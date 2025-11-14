import instance from './axios'; 
import { z } from 'zod'
import { registroSchema } from '../../../src/schema/personas.validator'
import { Localidad, cargarLocalidades } from './localidad';

// Tipo inferido del schema de validación del backend
type RegisterPersonaData = z.infer<typeof registroSchema>;

// Re-exportar Localidad para mantener compatibilidad
export type { Localidad };



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
};// Obtener todas las personas
const getAllPersonas = async (): Promise<PersonaData[]> => {
  const response = await instance.get(`/personas`);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};
// Obtener persona por email
const getPersonaByEmail = async (email: string): Promise<PersonaData | null> => {
  const personas = await getAllPersonas();
  const target = personas.find((item) => item.email === email);
  return target ?? null;
};
const verifyTokenRequest = () => instance.get(`/auth/verify-token`);

const logoutRequest = () => instance.post(`/auth/logout`);

// Nueva función: Verificar estado de admin en tiempo real
const checkAdminStatusRequest = () => instance.get(`/auth/check-admin-status`);

// Actualizar las wallets asociadas a una persona
const updatePersonaWallets = (personaId: string, walletIds: string[]) => {
  return instance.patch(`/personas/${personaId}`, { wallets: walletIds });
};

// Obtener localidades (usa la función de localidad.ts)
const getLocalidades = async (): Promise<Localidad[]> => {
  return cargarLocalidades();
};

// Helper: Obtener persona completa con populate
const getPersonaWithWallets = async (personaId: string): Promise<PersonaData> => {
  try {
    const personaFromDb = await getPersonaById(personaId);
    console.log("Persona cargada desde backend:", personaFromDb);
    return personaFromDb;
  } catch (error) {
    console.error("Error al cargar persona desde backend:", error);
    throw error;
  }
};
{/*funcion para eliminar personas registradas*/ }
const eliminarPersona = (id: string) => {
  return instance.delete(`/personas/${id}`);
};

const createPersona = (data: Record<string, unknown>) => instance.post(`/personas`, data);

export { registerPersona, eliminarPersona, loginRequest, verifyTokenRequest, modificarPersona, getPersonaById, getPersonaByEmail, logoutRequest, updatePersonaWallets, getLocalidades, getPersonaWithWallets, createPersona, checkAdminStatusRequest };

