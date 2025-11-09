import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DaySelector from "./DaySelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type EntityType = "beneficios" | "wallets" | "localidades" | "ciudades" | "rubros" | "roles";

interface Campo {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "date" | "select" | "multiselect";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>; // Para selects
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
      { 
        name: "discountType", 
        label: "Tipo de Descuento", 
        type: "select", 
        required: true,
        options: [
          { value: "off", label: "Off (Descuento directo)" },
          { value: "cuota", label: "Cuota (Cuotas sin interés)" },
          { value: "reintegro", label: "Reintegro (Cashback)" }
        ]
      },
      { name: "walletId", label: "Wallet", type: "select", required: true, options: [] },
      { name: "rubroId", label: "Rubro", type: "select", required: true, options: [] },
      { name: "localidades", label: "Localidades", type: "multiselect", options: [] },
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
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // Todos los días por defecto
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<Array<{ value: string; label: string }>>([]);
  const [rubros, setRubros] = useState<Array<{ value: string; label: string }>>([]);
  const [localidades, setLocalidades] = useState<Array<{ value: string; label: string }>>([]);
  const { toast } = useToast();
  
  const config = formConfig[entityType];

  const handleChange = (name: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cargar opciones para selects de beneficios
  useEffect(() => {
    if (entityType === 'beneficios' && isOpen) {
      const loadOptions = async () => {
        try {
          // Cargar wallets
          const { getWallets } = await import('@/api/wallets');
          const walletsResponse = await getWallets();
          const walletsData = walletsResponse.data.data || walletsResponse.data;
          setWallets(walletsData.map((w: { _id: string; id?: string; name: string }) => ({
            value: w._id || w.id || '',
            label: w.name
          })));

          // Cargar rubros
          const { getRubros } = await import('@/api/rubros');
          const rubrosData = await getRubros();
          setRubros(rubrosData.map((r) => ({
            value: r._id || r.id || '',
            label: r.nombre
          })));

          // Cargar localidades
          const { cargarLocalidades } = await import('@/api/localidad');
          const localidadesData = await cargarLocalidades();
          setLocalidades(localidadesData.map((l: { _id: string; id?: string; nombre_localidad: string }) => ({
            value: l._id || l.id || '',
            label: l.nombre_localidad
          })));
        } catch (error) {
          console.error('Error cargando opciones:', error);
        }
      };
      loadOptions();
    }
  }, [entityType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Convertir valores numéricos
      const processedData: Record<string, unknown> = {};
      config.campos.forEach(campo => {
        const value = formData[campo.name];
        if (value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
          if (campo.type === 'number' && typeof value === 'string') {
            const numValue = parseFloat(value);
            // Solo agregar si el número es válido y mayor a 0 (o si es requerido)
            if (!isNaN(numValue) && (numValue > 0 || campo.required)) {
              processedData[campo.name] = numValue;
            }
          } else if (campo.type === 'multiselect' && Array.isArray(value)) {
            processedData[campo.name] = value; // Arrays se pasan tal cual
          } else {
            processedData[campo.name] = value;
          }
        }
      });

      // Campos especiales para beneficios
      if (entityType === 'beneficios') {
        processedData.availableDays = selectedDays; // Usar los días seleccionados
      }

      // Log para ver el objeto que se enviará a la base de datos
      console.log('📤 Datos a enviar a la base de datos:', {
        entityType,
        data: processedData
      });

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
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]); // Reset días
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
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]); // Reset días
    setWallets([]);
    setRubros([]);
    setLocalidades([]);
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
            {config.campos.map((campo) => {
              // Obtener opciones dinámicas para selects de beneficios
              let dynamicOptions = campo.options || [];
              if (entityType === 'beneficios') {
                if (campo.name === 'walletId') dynamicOptions = wallets;
                if (campo.name === 'rubroId') dynamicOptions = rubros;
                if (campo.name === 'localidades') dynamicOptions = localidades;
              }

              return (
                <div key={campo.name} className={campo.type === 'textarea' || campo.type === 'multiselect' ? 'md:col-span-2' : ''}>
                  <Label htmlFor={campo.name}>
                    {campo.label} {campo.required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  {campo.type === 'textarea' ? (
                    <Textarea
                      id={campo.name}
                      value={(formData[campo.name] as string) || ''}
                      onChange={(e) => handleChange(campo.name, e.target.value)}
                      placeholder={campo.placeholder}
                      required={campo.required}
                      className="mt-1"
                    />
                  ) : campo.type === 'select' ? (
                    <Select
                      value={(formData[campo.name] as string) || ''}
                      onValueChange={(value) => handleChange(campo.name, value)}
                      required={campo.required}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={campo.placeholder || `Selecciona ${campo.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {dynamicOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : campo.type === 'multiselect' ? (
                    <div className="mt-1 border rounded-md p-3 max-h-48 overflow-y-auto">
                      {dynamicOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay opciones disponibles</p>
                      ) : (
                        <div className="space-y-2">
                          {dynamicOptions.map((option) => {
                            const selected = Array.isArray(formData[campo.name]) && 
                              (formData[campo.name] as string[]).includes(option.value);
                            return (
                              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={(e) => {
                                    const currentValues = (formData[campo.name] as string[]) || [];
                                    if (e.target.checked) {
                                      handleChange(campo.name, [...currentValues, option.value]);
                                    } else {
                                      handleChange(campo.name, currentValues.filter(v => v !== option.value));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">{option.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      id={campo.name}
                      type={campo.type}
                      value={(formData[campo.name] as string) || ''}
                      onChange={(e) => handleChange(campo.name, e.target.value)}
                      placeholder={campo.placeholder}
                      required={campo.required}
                      className="mt-1"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Selector de días para beneficios */}
          {entityType === 'beneficios' && (
            <div className="pt-2">
              <DaySelector 
                selectedDays={selectedDays} 
                onDaysChange={setSelectedDays} 
              />
            </div>
          )}

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
