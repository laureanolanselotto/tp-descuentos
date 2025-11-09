import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import instance from "@/api/axios";

// Tipos de entidades soportadas
export type EntityType = "beneficios" | "wallets" | "personas" | "localidades" | "ciudades" | "rubros" | "roles";

interface TablaInfoProps {
  entityType: EntityType;
  title?: string;
}

// Tipo para los datos de las entidades
type EntityData = Record<string, unknown>;

// Configuración de columnas para cada entidad
const entityConfig: Record<EntityType, { 
  endpoint: string; 
  columns: string[]; 
  columnLabels: Record<string, string>;
  formatters?: Record<string, (value: unknown) => string>;
}> = {
  beneficios: {
    endpoint: "/beneficios",
    columns: ["descripcion", "discount", "discountType", "cant_cuotas", "fecha_desde", "fecha_hasta", "limit"],
    columnLabels: {
      descripcion: "Descripción",
      discount: "Descuento",
      discountType: "Tipo",
      cant_cuotas: "Cuotas",
      fecha_desde: "Desde",
      fecha_hasta: "Hasta",
      limit: "Límite",
    },
    formatters: {
      discount: (val) => val ? `${val}%` : "-",
      cant_cuotas: (val) => val ? String(val) : "-",
    }
  },
  wallets: {
    endpoint: "/wallets",
    columns: ["name", "descripcion", "interes_anual"],
    columnLabels: {
      name: "Nombre",
      descripcion: "Descripción",
      interes_anual: "Interés Anual",
    },
    formatters: {
      interes_anual: (val) => val ? `${val}%` : "-",
    }
  },
  personas: {
    endpoint: "/personas",
    columns: ["name", "email", "tel", "direccion", "rol_persona"],
    columnLabels: {
      name: "Nombre",
      email: "Email",
      tel: "Teléfono",
      direccion: "Dirección",
      rol_persona: "Admin",
    },
    formatters: {
      rol_persona: (val) => val ? "Sí" : "No",
      direccion: (val) => val ? String(val) : "-",
    }
  },
  localidades: {
    endpoint: "/localidades",
    columns: ["nombre_localidad", "pais"],
    columnLabels: {
      nombre_localidad: "Nombre",
      pais: "País",
    }
  },
  ciudades: {
    endpoint: "/ciudades",
    columns: ["nombreCiudad", "codigoPostal", "latitud", "longitud"],
    columnLabels: {
      nombreCiudad: "Ciudad",
      codigoPostal: "CP",
      latitud: "Latitud",
      longitud: "Longitud",
    },
    formatters: {
      codigoPostal: (val) => val ? String(val) : "-",
      latitud: (val) => (typeof val === 'number') ? val.toFixed(4) : "-",
      longitud: (val) => (typeof val === 'number') ? val.toFixed(4) : "-",
    }
  },
  rubros: {
    endpoint: "/rubros",
    columns: ["nombre", "descripcion"],
    columnLabels: {
      nombre: "Nombre",
      descripcion: "Descripción",
    }
  },
  roles: {
    endpoint: "/roles",
    columns: ["email_admins"],
    columnLabels: {
      email_admins: "Email de Administrador",
    }
  }
};

const TablaInfo = ({ entityType, title }: TablaInfoProps) => {
  const [data, setData] = useState<EntityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = entityConfig[entityType];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await instance.get(config.endpoint);
      
      // Manejar diferentes estructuras de respuesta
      const fetchedData = response.data.data || response.data || [];
      setData(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (err: unknown) {
      console.error(`Error al cargar ${entityType}:`, err);
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : `Error al cargar ${entityType}`;
      setError(errorMessage || `Error al cargar ${entityType}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType]);

  const getValue = (item: EntityData, column: string) => {
    const value = item[column];
    const formatter = config.formatters?.[column];
    
    if (formatter) {
      return formatter(value);
    }
    
    if (value === null || value === undefined) {
      return "-";
    }
    
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  const getItemId = (item: EntityData) => {
    const id = item._id || item.id || item.ID;
    return id ? String(id) : Math.random().toString();
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando {title || entityType}...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {title || config.columnLabels[config.columns[0]] || entityType}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {data.length} registro{data.length !== 1 ? "s" : ""}
          </span>
          <Button onClick={fetchData} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay datos disponibles
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {config.columns.map((column) => (
                  <TableHead key={column}>
                    {config.columnLabels[column] || column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={getItemId(item)}>
                  {config.columns.map((column) => (
                    <TableCell key={column}>
                      {getValue(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default TablaInfo;
