import axios from 'axios'
import { z } from 'zod'
import { registroSchema } from '../../../src/schema/personas.validator'

const API = 'http://localhost:3000';

// Tipo inferido del schema de validación del backend
type RegisterPersonaData = z.infer<typeof registroSchema>;

// La ruta correcta es /api/personas/ (sin /register)
const registerPersona = (user: RegisterPersonaData) => axios.post(`${API}/api/personas`, user);

export { registerPersona };