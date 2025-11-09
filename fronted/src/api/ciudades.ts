import instance from './axios';

export const getCiudades = () => instance.get(`/ciudades`);

export const getCiudadById = (id: string) => instance.get(`/ciudades/${id}`);

export const createCiudad = (data: Record<string, unknown>) => instance.post(`/ciudades`, data);

export const updateCiudad = (id: string, data: Record<string, unknown>) => instance.put(`/ciudades/${id}`, data);

export const deleteCiudad = (id: string) => instance.delete(`/ciudades/${id}`);
