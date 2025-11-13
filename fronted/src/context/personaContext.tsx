import { createContext, useState, ReactNode, useContext ,useEffect} from "react";
import { loginRequest, registerPersona,verifyTokenRequest } from "../api/personas";
import { string, z } from "zod";
import { registroSchema } from "../../../src/schema/personas.validator";
import { AxiosError } from "axios";
import Cookies from 'js-cookie';

// Tipos del backend
type RegisterPersonaData = z.infer<typeof registroSchema>;

interface PersonaContextType {
    persona: RegisterPersonaData | null;
    signup: (user: RegisterPersonaData) => Promise<unknown>;
    signin: (user: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean; //  Nuevo campo para rol de admin
    errors: string[];
    clearErrors: () => void;
    loading: boolean;
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
    const [persona, setPersona] = useState<RegisterPersonaData | null>(null);// Estado de la persona autenticada
    const [isAuthenticated, setIsAuthenticated] = useState(false);// Estado de autenticación
    const [isAdmin, setIsAdmin] = useState(false); //  Estado de rol admin
    const [errors, setErrors] = useState<string[]>([]); // Array de errores
    const [loading,setLoading]=useState(true);// Nuevo estado de carga

    const clearErrors = () => {
        setErrors([]);
    };
    
    const signup = async (user: RegisterPersonaData) => {
        try {
            setErrors([]); // Limpiar errores previos
            const res = await registerPersona(user);
            // NO establecer isAuthenticated ni persona
            // El usuario debe hacer login después de registrarse
            return res.data; // Retornar los datos para que la página pueda manejarlos
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
            throw error; // Re-lanzar el error para que la página pueda manejarlo
        }
    };
    const signin = async (user: { email: string; password: string }) => {
        try { 
            setErrors([]); // Limpiar errores previos
            const res = await loginRequest(user);
            console.log(res.data);
            // Guardar solo el objeto user, no toda la respuesta
            setPersona(res.data.user || res.data);
            setIsAuthenticated(true);
            //  Verificar si es admin desde la respuesta del login
            setIsAdmin(res.data.user?.isAdmin || false);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            
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
                setErrors(["Error desconocido al iniciar sesión"]);
            }
        }
    };

    const logout = () => {
        Cookies.remove('token'); // Eliminar la cookie del token
        setPersona(null);
        setIsAuthenticated(false);
        setIsAdmin(false); //  Limpiar estado de admin
    }

    useEffect(() => {
      if (errors.length > 0) {
        const timer = setTimeout(() => {
          setErrors([]);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [errors]);
    
    useEffect(() => {
        async function checkLogin() {
            const cookies = Cookies.get();// Obtener cookies
        if (!cookies.token) {// COMPRUEBA SI NO HAY TOKEN
            setIsAuthenticated(false);// NO ESTÁ AUTENTICADO
            setLoading(false);// TERMINA DE CARGAR
            return setPersona(null);// NO HAY PERSONA
        }
            try {
                const res = await verifyTokenRequest();// Verificar token en el backend
                if (!res.data) {// si el backend no devuelve datos
                    setIsAuthenticated(false);// NO ESTÁ AUTENTICADO
                    setIsAdmin(false); //  NO ES ADMIN
                    setLoading(false);// TERMINA DE CARGAR
                    return;
                }// si devuelve datos
                setIsAuthenticated(true);// ESTÁ AUTENTICADO
                setPersona(res.data);// SETEA LA PERSONA
                setIsAdmin(res.data.isAdmin || false); //  VERIFICAR SI ES ADMIN
                setLoading(false);// TERMINA DE CARGAR

        } catch (error) {// si hay error
            console.error("Error al verificar token:", error);// mostrar error en consola
            setIsAuthenticated(false);
            setIsAdmin(false); //  NO ES ADMIN
            setPersona(null);// NO HAY PERSONA
            setLoading(false);

        }}
        checkLogin();
    },[]);

    return (
        <PersonaContext.Provider value={{
            persona,
            signup,
            signin,
            logout,
            isAuthenticated,
            isAdmin, //  Exportar estado de admin
            errors,
            clearErrors,
            loading,
        }}>
            {children}
        </PersonaContext.Provider>
    );
};

export { PersonaContext, PersonaProvider, usePersonaAuth };