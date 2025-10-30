import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registroSchema } from "../../../src/schema/personas.validator";
import { usePersonaAuth } from "@/context/personaContext";
import { modificarPersona, getPersonaById, PersonaData } from "@/api/personas";
import { cargarLocalidades, Localidad } from "@/api/localidad";

// Tipo para extraer ID de diferentes estructuras de persona
type PersonaWithId = {
  id?: string;
  _id?: string;
  data?: { id?: string };
};

const accountSchema = registroSchema
  .extend({
    password: registroSchema.shape.password.optional().or(z.literal("")),
    confirmPassword: registroSchema.shape.password.optional().or(z.literal("")),
  })
  .refine(
    (data) => !data.password || data.password === data.confirmPassword,
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    }
  );

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onUpdate?: (data: Partial<AccountFormData>) => void;
}

const AccountModal = ({ isOpen, onClose, onUpdate }: AccountModalProps) => {
  const { persona } = usePersonaAuth();
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(true);
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const personaId = useMemo(() => {
    if (!persona) return "";
    // El contexto usa RegisterPersonaData, pero necesitamos extraer el ID
    const source = persona as PersonaWithId;
    return source.id || source._id || source.data?.id || "";
  }, [persona]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      apellido: "",
      email: "",
      tel: "",
      direccion: "",
      localidadId: "",
      password: "",
      confirmPassword: "",
      wallets: [], // IDs de wallets seleccionadas porque se mada como put
    },
  });

  const extractLocalidadId = (value: string | { _id?: string; id?: string; localidadId?: string } | undefined): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value._id || value.id || value.localidadId || "";
    }
    return "";
  };

  const extractWalletIds = (walletsValue: Array<string | { _id?: string; id?: string; walletId?: string }> | undefined): string[] => {
    if (!walletsValue) return [];
    if (Array.isArray(walletsValue)) {
      return walletsValue
        .map((wallet) => {
          if (typeof wallet === "string") return wallet;
          if (wallet && typeof wallet === "object") {
            return wallet._id || wallet.id || wallet.walletId;
          }
          return null;
        })
        .filter((id): id is string => Boolean(id));
    }
    return [];
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchLocalidades = async () => {
      setLoadingLocalidades(true);
      try {
        const data = await cargarLocalidades();
        setLocalidades(data);
      } catch (error) {
        console.error("Error al cargar localidades:", error);
      } finally {
        setLoadingLocalidades(false);
      }
    };

    fetchLocalidades();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !personaId) return;

    let cancelled = false;
    const fetchPersona = async () => {
      setLoadingPersona(true);
      try {
        const data = await getPersonaById(personaId);
        if (cancelled) return;
  console.log('Datos de persona cargados', data);
        setPersonaData(data);
        reset({
          name: data?.name ?? "",
          apellido: data?.apellido ?? "",
          email: data?.email ?? "",
          tel: data?.tel ? String(data.tel) : "",  // Convertir number a string para el form
          direccion: data?.direccion ?? "",
          localidadId: extractLocalidadId(data?.localidad),
          password: "" ,
          confirmPassword: "",
          wallets: extractWalletIds(data?.wallets),
        });
        setSuccess(false);
        setServerError(null);
      } catch (error) {
        if (!cancelled) {
          console.error("Error al cargar datos de la persona:", error);
          setServerError("No se pudieron cargar los datos de la cuenta");
        }
      } finally {
        if (!cancelled) {
          setLoadingPersona(false);
        }
      }
    };

    fetchPersona();
    return () => {
      cancelled = true;
    };
  }, [isOpen, personaId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!personaId) {
      setServerError("No se pudo identificar al usuario");
      return;
    }

    const cleanedValues: Partial<AccountFormData> = { ...values };

    if (!cleanedValues.localidadId || String(cleanedValues.localidadId).trim() === "") {
      delete cleanedValues.localidadId;
    } else {
      const val = String(cleanedValues.localidadId);
      if (val.length !== 24) {
        const matched = localidades.find(
          (localidad) =>
            `${localidad.nombre_localidad} - ${localidad.pais}` === val ||
            localidad.nombre_localidad === val
        );
        if (matched && (matched._id || matched.id)) {
          cleanedValues.localidadId = matched._id || matched.id;
        } else {
          delete cleanedValues.localidadId;
        }
      }
    }

    if (!cleanedValues.password) {
      delete cleanedValues.password;
    }
    delete cleanedValues.confirmPassword;

    if (!cleanedValues.wallets || cleanedValues.wallets.length === 0) {
      delete cleanedValues.wallets;
    }

    try {
      setServerError(null);
      console.log("Actualizando persona", { personaId, payload: cleanedValues });
      await modificarPersona(personaId, cleanedValues);
      setSuccess(true);
      if (onUpdate) {
        onUpdate(cleanedValues);
      }
    } catch (error) {
      console.error("Error al actualizar persona:", error);
      setServerError("No se pudieron actualizar los datos");
      setSuccess(false);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && onClose) onClose(); }}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Cuenta</DialogTitle>
        </DialogHeader>
        {loadingPersona ? (
          <div className="py-8 text-center text-muted-foreground">
            Cargando datos de la cuenta...
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <div className="flex gap-3 w-full">
            <label className="flex-1 relative">
              <input
                className="bg-[#333] text-white w-full pt-8 pb-1 px-3 rounded-lg border border-[#69696965] focus:outline-none"
                type="text"
                placeholder={personaData?.name || "Nombre"}
                {...register("name")}
              />
              <span className="absolute left-3 top-3 text-white/50 text-sm">Nombre</span>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </label>
          </div>

          <label className="relative">
            <input
              className="bg-[#333] text-white w-full pt-8 pb-1 px-3 rounded-lg border border-[#69696965] focus:outline-none"
              type="tel"
              placeholder={personaData?.tel ? String(personaData.tel) : "Teléfono"}
              {...register("tel")}
            />
            <span className="absolute left-3 top-3 text-white/50 text-sm">Teléfono</span>
            {errors.tel && <p className="text-red-400 text-xs mt-1">{errors.tel.message}</p>}
          </label>

          <label className="relative">
            <input
              className="bg-[#333] text-white w-full pt-8 pb-1 px-3 rounded-lg border border-[#69696965] focus:outline-none"
              type="email"
              placeholder={personaData?.email || "Email"}
              {...register("email")}
            />
            <span className="absolute left-3 top-3 text-white/50 text-sm">Email</span>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </label>

          <label className="relative">
            <input
              className="bg-[#333] text-white w-full pt-8 pb-1 px-3 rounded-lg border border-[#69696965] focus:outline-none"
              type="text"
              placeholder={personaData?.direccion || "Dirección"}
              {...register("direccion")}
            />
            <span className="absolute left-3 top-3 text-white/50 text-sm">Dirección</span>
            {errors.direccion && <p className="text-red-400 text-xs mt-1">{errors.direccion.message}</p>}
          </label>

          <div className="relative">
            <label htmlFor="localidadId" className="block text-sm text-white/70 mb-2">
            </label>
            <div className="relative">
              <select
                id="localidadId"
                className="w-full bg-[#333] text-white px-4 py-3 rounded-lg border border-[#69696965] focus:outline-none focus:border-[#00bfff] focus:ring-2 focus:ring-[#00bfff]/20 appearance-none cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loadingLocalidades}
                {...register("localidadId")}
              >
                <option value="" disabled className="bg-[#333] text-gray-400">
                  Selecciona una localidad
                </option>
                {localidades.map((localidad) => (
                  <option key={localidad._id} value={localidad._id} className="bg-[#333] text-white py-2">
                    {localidad.nombre_localidad} - {localidad.pais}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {errors.localidadId && <p className="text-red-400 text-xs mt-1">{errors.localidadId.message}</p>}
          </div>

          <label className="relative">
            <input
              className="bg-[#333] text-white w-full pt-8 pb-1 px-3 rounded-lg border border-[#69696965] focus:outline-none"
              type="password"
              placeholder="Nueva contraseña"
              {...register("password")}
            />
            <span className="absolute left-3 top-3 text-white/50 text-sm">Nueva contraseña</span>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </label>

          <label className="relative">
            <input
              className="bg-[#333] text-white w-full pt-8 pb-1 px-3 rounded-lg border border-[#69696965] focus:outline-none"
              type="password"
              placeholder="Confirmar contraseña"
              {...register("confirmPassword")}
            />
            <span className="absolute left-3 top-3 text-white/50 text-sm">Confirmar contraseña</span>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </label>

            {serverError && <div className="text-red-400 text-sm text-center">{serverError}</div>}
            {success && <div className="text-green-400 text-sm text-center">Datos actualizados correctamente</div>}

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccountModal;

