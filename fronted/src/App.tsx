import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/Account";
import Login from "./pages/Login";
import { PersonaProvider } from "./context/personaContext";
import ProtectedRoute from "./ProtectedRoute";
import Hola from "./pages/Hola";

const queryClient = new QueryClient();

const App = () => (
  <PersonaProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Routes>
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<Login/>} />
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/HomePage" element={<Index />} />
            <Route path="/hola" element={<Hola />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </PersonaProvider>
);

export default App;
