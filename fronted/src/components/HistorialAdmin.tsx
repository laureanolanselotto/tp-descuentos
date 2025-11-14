import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { obtenerHistorial } from "@/api/historial";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HistorialItem {
  _id: string;
  personaId: string;
  personaNombre: string;
  fechaModificacion: string;
  entidad: string;
  entidadId: string;
  accion: "CREATE" | "UPDATE" | "DELETE";
  cambios?: {
    antes?: Record<string, unknown>;
    despues?: Record<string, unknown>;
  };
  descripcion?: string;
}

export default function HistorialAdmin() {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todos los registros sin filtros
      const response = await obtenerHistorial({});
      const data = response.data.data || response.data || [];
      setHistorial(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error desconocido';
      setError(errorMessage || "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case "CREATE":
        return "text-green-600 bg-green-50 px-2 py-1 rounded";
      case "UPDATE":
        return "text-blue-600 bg-blue-50 px-2 py-1 rounded";
      case "DELETE":
        return "text-red-600 bg-red-50 px-2 py-1 rounded";
      default:
        return "";
    }
  };

  const getAccionTexto = (accion: string) => {
    switch (accion) {
      case "CREATE":
        return "Creación";
      case "UPDATE":
        return "Actualización";
      case "DELETE":
        return "Eliminación";
      default:
        return accion;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Historial de Cambios</CardTitle>
          <Button
            onClick={fetchHistorial}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : historial.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No hay cambios registrados
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead key="fecha">Fecha</TableHead>
                  <TableHead key="admin">Admin</TableHead>
                  <TableHead key="entidad">Entidad</TableHead>
                  <TableHead key="tipo">Tipo de Modificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historial.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="text-sm">
                      {format(new Date(item.fechaModificacion), "dd/MM/yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell className="font-medium">{item.personaNombre}</TableCell>
                    <TableCell className="capitalize">{item.entidad}</TableCell>
                    <TableCell>
                      <span className={getAccionColor(item.accion)}>
                        {getAccionTexto(item.accion)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
