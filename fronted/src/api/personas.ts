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

// Tipo para los datos de Persona que vienen del backend (basado en personas.entity.ts)
export interface PersonaData {
  _id?: string;
  id?: string;
  name: string;
  apellido: string;
  email: string;
  tel: number | string;  // Puede ser number (entidad) o string (formulario)
  direccion?: string;  // Es opcional en la entidad
  password?: string;  // Para actualizaciones, no siempre viene
  localidad?: string | Localidad | { _id?: string; id?: string; localidadId?: string };
  wallets?: Array<string | { _id?: string; id?: string; walletId?: string }>;
  notificaciones?: Array<unknown>;  // Collection de notificaciones
  data?: {
    id?: string;
    [key: string]: unknown;
  };
}

// La ruta correcta es /api/personas/ (sin /register)
const registerPersona = (user: RegisterPersonaData) => instance.post(`/personas`, user);
const loginRequest = (user: { email: string; password: string }) => instance.post(`/auth/login`, user);

const modificarPersona = (id: string, updatedData: Partial<RegisterPersonaData>) => {
  return instance.put(`/personas/${id}`, updatedData);
};

const getPersonaById = async (id: string): Promise<PersonaData> => {
  const response = await instance.get(`/personas/${id}`);
  return response.data?.data || response.data;
};
const verifyTokenRequest = () => instance.get(`/auth/verify-token`);

const logoutRequest = () => instance.post(`/auth/logout`);

const updatePersonaWallets = (personaId: string, walletIds: string[]) => {
  return instance.patch(`/personas/${personaId}`, { wallets: walletIds });
};

export { registerPersona, loginRequest, verifyTokenRequest, modificarPersona, getPersonaById, logoutRequest, updatePersonaWallets };

