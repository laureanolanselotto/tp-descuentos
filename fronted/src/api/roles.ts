import instance from './axios';

export const getRoles = () => instance.get(`/roles`);

export const getRolById = (id: string) => instance.get(`/roles/${id}`);

export const createRol = (data: Record<string, unknown>) => instance.post(`/roles`, data);

export const updateRol = (id: string, data: Record<string, unknown>) => instance.put(`/roles/${id}`, data);

export const deleteRol = (id: string) => instance.delete(`/roles/${id}`);
