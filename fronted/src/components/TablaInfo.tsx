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
import { RefreshCw, Loader2, Edit, Trash2, Wallet } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import instance from "@/api/axios";
import FormularioUpdate from "./FormularioUpdate";

// Tipos de entidades soportadas
export type EntityType = "beneficios" | "wallets" | "localidades" | "ciudades" | "rubros" | "roles";

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
    columns: ["descripcion", "discount", "discountType", "wallet", "rubro", "localidades", "fecha_desde", "fecha_hasta"],
    columnLabels: {
      descripcion: "Descripción",
      discount: "Descuento",
      discountType: "Tipo",
      wallet: "Wallet",
      rubro: "Rubro",
      localidades: "Localidades",
      fecha_desde: "Desde",
      fecha_hasta: "Hasta",
    },
    formatters: {
      discount: (val) => val ? `${val}%` : "---",
      wallet: (val) => {
        if (!val || typeof val !== 'object') {
          return "---";
        }
        const wallet = val as { name?: string };
        return wallet.name || "---";
      },
      rubro: (val) => {
        if (!val || typeof val !== 'object') return "---";
        const rubro = val as { nombre?: string };
        return rubro.nombre || "---";
      },
      localidades: (val) => {
        if (!val || !Array.isArray(val)) return "---";
        if (val.length === 0) return "Sin localidades";
        const nombres = val.map((loc: unknown) => {
          if (typeof loc === 'object' && loc !== null) {
            return (loc as { nombre_localidad?: string }).nombre_localidad || "?";
          }
          return "?";
        });
        return nombres.join(", ");
      },
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
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

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

  const handleUpdate = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      
      let deleteFunction;
      switch (entityType) {
        case 'beneficios': {
          const { deleteBeneficio } = await import('@/api/beneficios');
          deleteFunction = deleteBeneficio;
          break;
        }
        case 'wallets': {
          const { deleteWallet } = await import('@/api/wallets');
          deleteFunction = deleteWallet;
          break;
        }
        case 'rubros': {
          const { deleteRubro } = await import('@/api/rubros');
          deleteFunction = deleteRubro;
          break;
        }
        case 'localidades': {
          const { deleteLocalidad } = await import('@/api/localidad');
          deleteFunction = deleteLocalidad;
          break;
        }
        case 'ciudades': {
          const { deleteCiudad } = await import('@/api/ciudades');
          deleteFunction = deleteCiudad;
          break;
        }
        case 'roles': {
          const { deleteRol } = await import('@/api/roles');
          deleteFunction = deleteRol;
          break;
        }
      }

      await deleteFunction(itemToDelete);

      toast({
        title: "¡Éxito!",
        description: `Registro eliminado correctamente.`,
      });

      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData(); // Recargar datos
    } catch (error: unknown) {
      console.error(`Error al eliminar ${entityType}:`, error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : `Error al eliminar ${entityType}`;
      
      toast({
        title: "Error",
        description: errorMessage || `No se pudo eliminar el registro`,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
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
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const itemId = getItemId(item);
                const isHovered = hoveredRow === itemId;
                
                return (
                  <TableRow 
                    key={itemId}
                    onMouseEnter={() => setHoveredRow(itemId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className="relative"
                  >
                    {config.columns.map((column) => (
                      <TableCell key={column}>
                        {getValue(item, column)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className={`flex gap-2 justify-end transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600"
                          onClick={() => handleUpdate(itemId)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white border-red-600"
                          onClick={() => handleDeleteClick(itemId)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de actualización */}
      {selectedItemId && (
        <FormularioUpdate
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedItemId(null);
          }}
          entityType={entityType}
          itemId={selectedItemId}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TablaInfo;
