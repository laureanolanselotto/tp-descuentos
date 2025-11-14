import { useToast as useToastOriginal } from "@/hooks/use-toast";
import { usePersonaAuth } from "@/context/personaContext";
import { registrarCambioHistorial, HistorialAdminData } from "@/api/historial";

type AccionType = "CREATE" | "UPDATE" | "DELETE";

interface ToastConHistorialOptions {
  title: string;
  description: string;
  variant?: "default" | "destructive";
  // Datos del historial (solo si es éxito y el usuario es admin)
  historial?: {
    entidad: string;      // "beneficios", "wallets", etc.
    accion: AccionType;   // "CREATE", "UPDATE", "DELETE"
  };
}

/**
 * Hook que extiende useToast para registrar automáticamente en el historial
 * cuando un admin realiza operaciones exitosas (CREATE, UPDATE, DELETE)
 */
export const useToastConHistorial = () => {
  const { toast: toastOriginal } = useToastOriginal();
  const { persona, isAdmin } = usePersonaAuth();

  const toast = async (options: ToastConHistorialOptions) => {
    // Mostrar el toast normal
    toastOriginal({
      title: options.title,
      description: options.description,
      variant: options.variant,
    });

    // Si es un toast de éxito, el usuario es admin, y hay datos de historial
    if (
      !options.variant || options.variant === "default" // Es éxito
    ) {
      if (isAdmin && options.historial && persona) {
        // Ejecutar en el siguiente tick para no bloquear el toast
        setTimeout(async () => {
          try {
            const personaData = persona as unknown as { name?: string };

            const historialData: HistorialAdminData = {
              personaNombre: personaData.name || persona.name || "Admin",
              entidad: options.historial.entidad,
              accion: options.historial.accion,
            };

            console.log(" Intentando registrar en historial:", {
              entidad: historialData.entidad,
              accion: historialData.accion,
              admin: historialData.personaNombre
            });

            // Registrar en el historial de forma asíncrona (no bloquea la UI)
            await registrarCambioHistorial(historialData);
            console.log("✓ Cambio registrado en historial exitosamente");
          } catch (error) {
            // Error silencioso - no queremos afectar la experiencia del usuario
            if (error && typeof error === 'object' && 'response' in error) {
              const axiosError = error as { response?: { status?: number; data?: unknown } };
              console.warn("⚠️ Error al registrar en historial:", {
                status: axiosError.response?.status,
                message: axiosError.response?.data
              });
            } else {
              console.error("Error al registrar en historial:", error);
            }
          }
        }, 0); // Ejecutar en el siguiente tick
      } else {
        // Debug: mostrar por qué no se registra
        if (!isAdmin) console.log("ℹ No se registra en historial: usuario no es admin");
        if (!options.historial) console.log("ℹNo se registra en historial: sin datos de historial");
        if (!persona) console.log("ℹ No se registra en historial: sin datos de persona");
      }
    }
  };

  return { toast };
};
