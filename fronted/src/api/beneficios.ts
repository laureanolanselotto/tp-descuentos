import instance from './axios'; 
import { useEffect, useState } from 'react';
import { usePersonaAuth } from '@/context/personaContext';

const getBeneficios = () => instance.get(`/beneficios`);

const getBeneficioById = (id: string) => instance.get(`/beneficios/${id}`);

export { getBeneficios, getBeneficioById };

const useBeneficios = () => {
    const [beneficios, setBeneficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);
    const { persona } = usePersonaAuth();

    useEffect(() => {
        const fetchBeneficiosPorLocalidad = async () => {
            try {
                setLoading(true);
                
                // Verificar que la persona esté logueada
                if (!persona) {
                    console.warn("No hay persona logueada");
                    setBeneficios([]);
                    setLoading(false);
                    return;
                }

                // Obtener el ID de la localidad de la persona
                // El tipo no refleja que localidad puede estar poblada, pero lo está
                const personaData = persona as any; // Usar any para acceder a localidad poblada
                const localidadPersona = personaData.localidad;
                
                if (!localidadPersona) {
                    console.warn("La persona no tiene localidad asignada");
                    setBeneficios([]);
                    setLoading(false);
                    return;
                }

                const localidadPersonaId = localidadPersona._id || localidadPersona.id || localidadPersona;
                console.log("Localidad de la persona:", localidadPersonaId);

                // 1. Obtener TODOS los beneficios desde el backend
                const res = await getBeneficios();
                
                // El backend devuelve { message: '...', data: [...] }
                const todosBeneficios = res.data?.data || res.data || [];
                
                console.log("Respuesta completa del backend:", res.data);
                console.log("Total de beneficios en BD:", Array.isArray(todosBeneficios) ? todosBeneficios.length : 'No es un array');

                // Verificar que todosBeneficios sea un array
                if (!Array.isArray(todosBeneficios)) {
                    console.error("Los beneficios no son un array:", todosBeneficios);
                    setBeneficios([]);
                    setLoading(false);
                    return;
                }

                // 2. Filtrar los beneficios que pertenecen a la misma localidad
                const beneficiosFiltrados = todosBeneficios.filter((beneficio: any) => {
                    // Verificar si el beneficio tiene localidades
                    if (!beneficio.localidades || beneficio.localidades.length === 0) {
                        return false;
                    }

                    // Verificar si alguna localidad del beneficio coincide con la de la persona
                    const perteneceALocalidad = beneficio.localidades.some((localidad: any) => {
                        const localidadId = localidad._id || localidad.id || localidad;
                        return localidadId === localidadPersonaId || String(localidadId) === String(localidadPersonaId);
                    });

                    return perteneceALocalidad;
                });

                console.log("Beneficios filtrados por localidad:", beneficiosFiltrados.length);

                // 3. Guardar los beneficios filtrados
                setBeneficios(beneficiosFiltrados);
                setLoading(false);

            } catch (error: any) {
                console.error("Error al obtener beneficios:", error);
                setErrors([error.message || "Error desconocido"]);
                setBeneficios([]);
                setLoading(false);
            }
        };

        fetchBeneficiosPorLocalidad();
    }, [persona]); // Se ejecuta cuando cambia la persona (login/logout)

    return { beneficios, loading, errors };
};

export { useBeneficios };