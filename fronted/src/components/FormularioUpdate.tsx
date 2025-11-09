import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type EntityType = "beneficios" | "wallets" | "localidades" | "ciudades" | "rubros" | "roles";

interface Campo {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "date";
  required?: boolean;
  placeholder?: string;
}

interface FormularioUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  itemId: string;
  onSuccess: () => void;
}

// Configuración de campos para cada entidad (igual que FormularioCrear)
const formConfig: Record<EntityType, { title: string; campos: Campo[] }> = {
  beneficios: {
    title: "Actualizar Beneficio",
    campos: [
      { name: "descripcion", label: "Descripción", type: "text", required: true },
      { name: "discount", label: "Descuento (%)", type: "number" },
      { name: "discountType", label: "Tipo de Descuento", type: "text", required: true },
      { name: "cant_cuotas", label: "Cantidad de Cuotas", type: "number" },
      { name: "fecha_desde", label: "Fecha Desde", type: "date", required: true },
      { name: "fecha_hasta", label: "Fecha Hasta", type: "date", required: true },
      { name: "limit", label: "Límite", type: "text", required: true },
      { name: "tope_reintegro", label: "Tope de Reintegro", type: "number" },
    ]
  },
  wallets: {
    title: "Actualizar Wallet",
    campos: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea", required: true },
      { name: "interes_anual", label: "Interés Anual (%)", type: "number" },
    ]
  },
  rubros: {
    title: "Actualizar Rubro",
    campos: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea", required: true },
    ]
  },
  localidades: {
    title: "Actualizar Localidad",
    campos: [
      { name: "nombre_localidad", label: "Nombre", type: "text", required: true },
      { name: "pais", label: "País", type: "text", required: true },
    ]
  },
  ciudades: {
    title: "Actualizar Ciudad",
    campos: [
      { name: "nombreCiudad", label: "Nombre", type: "text", required: true },
      { name: "codigoPostal", label: "Código Postal", type: "text" },
      { name: "latitud", label: "Latitud", type: "number" },
      { name: "longitud", label: "Longitud", type: "number" },
    ]
  },
  roles: {
    title: "Actualizar Rol de Administrador",
    campos: [
      { name: "email_admins", label: "Email del Administrador", type: "email", required: true },
    ]
  }
};

const FormularioUpdate = ({ isOpen, onClose, entityType, itemId, onSuccess }: FormularioUpdateProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  
  const config = formConfig[entityType];

  // Cargar datos existentes cuando se abre el modal
  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId, entityType]);

  const fetchItemData = async () => {
    try {
      setLoadingData(true);
      
      let getFunction;
      switch (entityType) {
        case 'beneficios': {
          const { getBeneficioById } = await import('@/api/beneficios');
          getFunction = getBeneficioById;
          break;
        }
        case 'wallets': {
          const { getWalletById } = await import('@/api/wallets');
          getFunction = getWalletById;
          break;
        }
        case 'rubros': {
          const { getRubroById } = await import('@/api/rubros');
          getFunction = getRubroById;
          break;
        }
        case 'localidades': {
          const { getLocalidadById } = await import('@/api/localidad');
          getFunction = getLocalidadById;
          break;
        }
        case 'ciudades': {
          const { getCiudadById } = await import('@/api/ciudades');
          getFunction = getCiudadById;
          break;
        }
        case 'roles': {
          const { getRolById } = await import('@/api/roles');
          getFunction = getRolById;
          break;
        }
      }

      const response = await getFunction(itemId);
      const data = response.data?.data || response.data;
      
      // Convertir los datos al formato del formulario
      const formattedData: Record<string, string> = {};
      config.campos.forEach(campo => {
        const value = data[campo.name];
        if (value !== null && value !== undefined) {
          formattedData[campo.name] = String(value);
        }
      });
      
      setFormData(formattedData);
    } catch (error) {
      console.error(`Error al cargar ${entityType}:`, error);
      toast({
        title: "Error",
        description: `No se pudo cargar la información de ${entityType}`,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setLoading(true);
      setShowConfirmDialog(false);

      // Convertir valores numéricos
      const processedData: Record<string, unknown> = {};
      config.campos.forEach(campo => {
        const value = formData[campo.name];
        if (value !== undefined && value !== '') {
          if (campo.type === 'number') {
            processedData[campo.name] = parseFloat(value);
          } else {
            processedData[campo.name] = value;
          }
        }
      });

      // Campos especiales para beneficios
      if (entityType === 'beneficios') {
        processedData.availableDays = [0, 1, 2, 3, 4, 5, 6];
      }

      // Importar dinámicamente la función de actualización
      let updateFunction;
      switch (entityType) {
        case 'beneficios': {
          const { updateBeneficio } = await import('@/api/beneficios');
          updateFunction = updateBeneficio;
          break;
        }
        case 'wallets': {
          const { updateWallet } = await import('@/api/wallets');
          updateFunction = updateWallet;
          break;
        }
        case 'rubros': {
          const { updateRubro } = await import('@/api/rubros');
          updateFunction = updateRubro;
          break;
        }
        case 'localidades': {
          const { updateLocalidad } = await import('@/api/localidad');
          updateFunction = updateLocalidad;
          break;
        }
        case 'ciudades': {
          const { updateCiudad } = await import('@/api/ciudades');
          updateFunction = updateCiudad;
          break;
        }
        case 'roles': {
          const { updateRol } = await import('@/api/roles');
          updateFunction = updateRol;
          break;
        }
      }

      console.log('Datos procesados a enviar:', processedData);
      console.log('ID del item:', itemId);
      
      await updateFunction(itemId, processedData);

      toast({
        title: "¡Éxito!",
        description: `${config.title.replace('Actualizar ', '')} actualizado correctamente.`,
      });

      setFormData({});
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error(`Error al actualizar ${entityType}:`, error);
      console.error('Detalles del error:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : `Error al actualizar ${entityType}`;
      
      toast({
        title: "Error",
        description: errorMessage || `No se pudo actualizar el ${entityType}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
          </DialogHeader>
          
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Cargando datos...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.campos.map((campo) => (
                  <div key={campo.name} className={campo.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <Label htmlFor={campo.name}>
                      {campo.label} {campo.required && <span className="text-red-500">*</span>}
                    </Label>
                    {campo.type === 'textarea' ? (
                      <Textarea
                        id={campo.name}
                        value={formData[campo.name] || ''}
                        onChange={(e) => handleChange(campo.name, e.target.value)}
                        required={campo.required}
                        className="mt-1"
                      />
                    ) : (
                      <Input
                        id={campo.name}
                        type={campo.type}
                        value={formData[campo.name] || ''}
                        onChange={(e) => handleChange(campo.name, e.target.value)}
                        required={campo.required}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-600">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar actualización?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas actualizar este registro? Los cambios se guardarán permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpdate} className="bg-yellow-500 hover:bg-yellow-600">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FormularioUpdate;
