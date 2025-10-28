import axios from "./axios";

export interface ImagenData {
  _id: string;
  id?: string;
  url: string;
  nombre: string;
}

export const getImagenByNombre = async (nombre: string) => {
  return axios.get<{ message: string; data: ImagenData }>(`/imagenes/buscar`, {
    params: { nombre }
  });
};

export const getAllImagenes = async () => {
  return axios.get<{ message: string; data: ImagenData[] }>('/imagenes');
};
