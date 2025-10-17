import { createContext, useState, ReactNode, useContext } from "react";
import { registerPersona } from "../api/personas";
import { z } from "zod";
import { registroSchema } from "../../../src/schema/personas.validator";
import { AxiosError } from "axios";

// Tipos del backend
type RegisterPersonaData = z.infer<typeof registroSchema>;

interface PersonaContextType {
    persona: RegisterPersonaData | null;
    signup: (user: RegisterPersonaData) => Promise<void>;
    isAuthenticated: boolean;
    errors: string[];
    clearErrors: () => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

// Custom hook para usar el contexto
const usePersonaAuth = () => {
    const context = useContext(PersonaContext);
    if (!context) {
        throw new Error("usePersonaAuth must be used within a PersonaProvider");
    }   
    return context;
}

const PersonaProvider = ({ children }: { children: ReactNode }) => {
    const [persona, setPersona] = useState<RegisterPersonaData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState<string[]>([]); // Array de errores
    
    const clearErrors = () => {
        setErrors([]);
    };
    
    const signup = async (user: RegisterPersonaData) => {
        try { 
            setErrors([]); // Limpiar errores previos
            const res = await registerPersona(user);
            console.log(res.data);
            setPersona(res.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            
            // Tipado correcto para Axios error
            if (error instanceof AxiosError && error.response?.data?.message) {
                // Si el backend devuelve un array de errores
                if (Array.isArray(error.response.data.message)) {
                    setErrors(error.response.data.message);
                } else {
                    // Si es un solo mensaje, lo convertimos en array
                    setErrors([error.response.data.message]);
                }
            } else if (error instanceof Error) {
                setErrors([error.message]);
            } else {
                setErrors(["Error desconocido al registrar usuario"]);
            }
        }
    };
    
    return (
        <PersonaContext.Provider value={{
            persona,
            signup,
            isAuthenticated,
            errors,
            clearErrors
        }}>
            {children}
        </PersonaContext.Provider>
    );
};

export { PersonaContext, PersonaProvider, usePersonaAuth };