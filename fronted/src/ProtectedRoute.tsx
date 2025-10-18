import { Navigate,Outlet } from "react-router-dom";
import { usePersonaAuth } from "./context/personaContext";

function ProtectedRoute() {
    const { loading, isAuthenticated } = usePersonaAuth();// Obtener el estado de autenticación desde el contexto
    console.log( loading, isAuthenticated)
    if (loading) return <h1> loading...</h1>;
    if (!isAuthenticated && !loading) {
        return <Navigate to="/login" replace />;
    }
return(
    <Outlet />
)
}
export default ProtectedRoute;