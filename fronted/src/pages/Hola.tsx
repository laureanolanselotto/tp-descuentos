import { usePersonaAuth } from "../context/personaContext";
const Hola = () => {
    const { persona } = usePersonaAuth();
    console.log("Persona en Hola:", persona);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">hola</h1>
    </div>
  );
};

export default Hola;
