import instance from './axios';

// Tipo para Localidad
export interface Localidad {
  _id: string;
  id?: string;
  nombre_localidad: string;
  pais: string;
}

// Función para cargar localidades
export const cargarLocalidades = async (): Promise<Localidad[]> => {
  try {
    const response = await instance.get(`/localidades`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error al cargar localidades:", error);
    throw error;
  }
};

// Función para crear localidad
export const createLocalidad = (data: Record<string, unknown>) => instance.post(`/localidades`, data);

// Función para obtener localidad por ID
export const getLocalidadById = (id: string) => instance.get(`/localidades/${id}`);

// Función para actualizar localidad
export const updateLocalidad = (id: string, data: Record<string, unknown>) => instance.patch(`/localidades/${id}`, data);

// Función para eliminar localidad
export const deleteLocalidad = (id: string) => instance.delete(`/localidades/${id}`);

