import { usePersonaAuth } from "../context/personaContext";
import NavegadorAdmin from "../components/NavegadorAdmin";

const Admint = () => {
    const { persona } = usePersonaAuth();
    console.log("Persona en Admin:", persona);
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
        <NavegadorAdmin />
      </div>
    </div>
  );
};

export default Admint;
