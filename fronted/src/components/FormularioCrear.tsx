import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type EntityType = "beneficios" | "wallets" | "localidades" | "ciudades" | "rubros" | "roles";

interface Campo {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "date";
  required?: boolean;
  placeholder?: string;
}

interface FormularioCrearProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  onSuccess: () => void;
}

// Configuración de campos para cada entidad
const formConfig: Record<EntityType, { title: string; campos: Campo[] }> = {
  beneficios: {
    title: "Crear Beneficio",
    campos: [
      { name: "descripcion", label: "Descripción", type: "text", required: true, placeholder: "Descripción del beneficio" },
      { name: "discount", label: "Descuento (%)", type: "number", placeholder: "10" },
      { name: "discountType", label: "Tipo de Descuento", type: "text", required: true, placeholder: "off / cuota / reintegro" },
      { name: "cant_cuotas", label: "Cantidad de Cuotas", type: "number", placeholder: "6" },
      { name: "fecha_desde", label: "Fecha Desde", type: "date", required: true },
      { name: "fecha_hasta", label: "Fecha Hasta", type: "date", required: true },
      { name: "limit", label: "Límite", type: "text", required: true, placeholder: "Ej: Sin límite" },
      { name: "tope_reintegro", label: "Tope de Reintegro", type: "number", placeholder: "1000" },
    ]
  },
  wallets: {
    title: "Crear Wallet",
    campos: [
      { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Nombre de la wallet" },
      { name: "descripcion", label: "Descripción", type: "textarea", required: true, placeholder: "Descripción de la wallet" },
      { name: "interes_anual", label: "Interés Anual (%)", type: "number", placeholder: "15" },
    ]
  },
  rubros: {
    title: "Crear Rubro",
    campos: [
      { name: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Nombre del rubro" },
      { name: "descripcion", label: "Descripción", type: "textarea", required: true, placeholder: "Descripción del rubro" },
    ]
  },
  localidades: {
    title: "Crear Localidad",
    campos: [
      { name: "nombre_localidad", label: "Nombre", type: "text", required: true, placeholder: "Nombre de la localidad" },
      { name: "pais", label: "País", type: "text", required: true, placeholder: "Argentina" },
    ]
  },
  ciudades: {
    title: "Crear Ciudad",
    campos: [
      { name: "nombreCiudad", label: "Nombre", type: "text", required: true, placeholder: "Nombre de la ciudad" },
      { name: "codigoPostal", label: "Código Postal", type: "text", placeholder: "5000" },
      { name: "latitud", label: "Latitud", type: "number", placeholder: "-31.4135" },
      { name: "longitud", label: "Longitud", type: "number", placeholder: "-64.1811" },
    ]
  },
  roles: {
    title: "Crear Rol de Administrador",
    campos: [
      { name: "email_admins", label: "Email del Administrador", type: "email", required: true, placeholder: "admin@ejemplo.com" },
    ]
  }
};

const FormularioCrear = ({ isOpen, onClose, entityType, onSuccess }: FormularioCrearProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const config = formConfig[entityType];

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

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
        processedData.availableDays = [0, 1, 2, 3, 4, 5, 6]; // Por defecto todos los días
      }

      // Importar dinámicamente la función de creación
      let createFunction;
      switch (entityType) {
        case 'beneficios': {
          const { createBeneficio } = await import('@/api/beneficios');
          createFunction = createBeneficio;
          break;
        }
        case 'wallets': {
          const { createWallet } = await import('@/api/wallets');
          createFunction = createWallet;
          break;
        }
        case 'rubros': {
          const { createRubro } = await import('@/api/rubros');
          createFunction = createRubro;
          break;
        }
        case 'localidades': {
          const { createLocalidad } = await import('@/api/localidad');
          createFunction = createLocalidad;
          break;
        }
        case 'ciudades': {
          const { createCiudad } = await import('@/api/ciudades');
          createFunction = createCiudad;
          break;
        }
        case 'roles': {
          const { createRol } = await import('@/api/roles');
          createFunction = createRol;
          break;
        }
      }

      await createFunction(processedData);

      toast({
        title: "¡Éxito!",
        description: `${config.title.replace('Crear ', '')} creado correctamente.`,
      });

      setFormData({});
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error(`Error al crear ${entityType}:`, error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : `Error al crear ${entityType}`;
      
      toast({
        title: "Error",
        description: errorMessage || `No se pudo crear el ${entityType}`,
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        
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
                    placeholder={campo.placeholder}
                    required={campo.required}
                    className="mt-1"
                  />
                ) : (
                  <Input
                    id={campo.name}
                    type={campo.type}
                    value={formData[campo.name] || ''}
                    onChange={(e) => handleChange(campo.name, e.target.value)}
                    placeholder={campo.placeholder}
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioCrear;
