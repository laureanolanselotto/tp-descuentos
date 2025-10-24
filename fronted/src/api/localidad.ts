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

