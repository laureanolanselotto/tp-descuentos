import instance from './axios'; 
import { z } from 'zod'
import { registroSchema } from '../../../src/schema/personas.validator'

// Tipo inferido del schema de validación del backend
type RegisterPersonaData = z.infer<typeof registroSchema>;

// Tipo para Localidad
export interface Localidad {
  _id: string;
  id?: string;
  nombre_localidad: string;
  pais: string;
}

// La ruta correcta es /api/personas/ (sin /register)
const registerPersona = (user: RegisterPersonaData) => instance.post(`/personas`, user);
const loginRequest = (user: { email: string; password: string }) => instance.post(`/auth/login`, user);

// Obtener todas las localidades
const getLocalidades = async (): Promise<Localidad[]> => {
  const response = await instance.get(`/localidades`);
  return response.data.data || [];
};

const modificarPersona = (id: string, updatedData: Partial<RegisterPersonaData>) => {
  return instance.put(`/personas/${id}`, updatedData);
};

const getPersonaById = async (id: string) => {
  const response = await instance.get(`/personas/${id}`);
  return response.data?.data || response.data;
};
const verifyTokenRequest = () => instance.get(`/auth/verify-token`);

export { registerPersona, loginRequest, getLocalidades, verifyTokenRequest, modificarPersona, getPersonaById };

