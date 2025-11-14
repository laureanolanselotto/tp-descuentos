import instance from "./axios";

export interface HistorialAdminData {
  personaNombre: string;
  entidad: string;
  accion: "CREATE" | "UPDATE" | "DELETE";
}

export interface HistorialAdminFiltros {
  entidad?: string;
  accion?: "CREATE" | "UPDATE" | "DELETE";
  desde?: string;
  hasta?: string;
  limit?: number;
}

// GET - Obtener historial con filtros opcionales
export const obtenerHistorial = (filtros?: HistorialAdminFiltros) => {
  return instance.get("/historial-admin", { params: filtros });
};

// POST - Registrar cambio en historial
export const registrarCambioHistorial = (data: HistorialAdminData) => {
  return instance.post("/historial-admin", data);
};
