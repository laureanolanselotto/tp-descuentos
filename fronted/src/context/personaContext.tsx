import { createContext, useState, ReactNode, useContext } from "react";
import { registerPersona } from "../api/personas";
import { z } from "zod";
import { registroSchema } from "../../../src/schema/personas.validator";

// Tipos del backend
type RegisterPersonaData = z.infer<typeof registroSchema>;

interface PersonaContextType {
    persona: RegisterPersonaData | null;
    signup: (user: RegisterPersonaData) => Promise<void>;
    isAuthenticated: boolean;
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

    const signup = async (user: RegisterPersonaData) => {
        try { 
            const res = await registerPersona(user);
            console.log(res.data);
            setPersona(res.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error al registrar usuario:", error);
        }
    };
    
    return (
        <PersonaContext.Provider value={{
            persona,
            signup,
            isAuthenticated
        }}>
            {children}
        </PersonaContext.Provider>
    );
};

export { PersonaContext, PersonaProvider, usePersonaAuth };