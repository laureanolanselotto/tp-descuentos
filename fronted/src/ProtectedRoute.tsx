import { Navigate,Outlet } from "react-router-dom";
import { usePersonaAuth } from "./context/personaContext";

function ProtectedRoute() {
    const { loading, isAuthenticated } = usePersonaAuth();// Obtener el estado de autenticación desde el contexto
    console.log( loading, isAuthenticated)
    if (loading) return <h1> loading...</h1>;// mientras carga, mostrar loading
    if (!isAuthenticated && !loading) {//si no está autenticado, redirigir al login
        return <Navigate to="/login" replace />;
    }
return(
    <Outlet />
)
}
export default ProtectedRoute;