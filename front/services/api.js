/**
 * Servicio para comunicación con la API del backend
 */
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
    }

    /**
     * Método genérico para hacer peticiones HTTP
     * @param {string} endpoint - Endpoint de la API (ej: '/personas')
     * @param {Object} options - Opciones de fetch (method, body, headers, etc.)
     * @returns {Promise<Object>} Respuesta JSON de la API
     * @throws {Error} Error de red o HTTP
     */
    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            
            const config = { ...defaultOptions, ...options };
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error en la petición:', error);
            throw error;
        }
    }

    // ========== PERSONAS ==========
    
    /**
     * Obtener todas las personas
     * @returns {Promise<{data: Array}>} Lista de personas
     * @example
     * const personas = await apiService.getPersonas();
     * console.log(personas.data); // Array de personas
     */
    async getPersonas() {
        return this.makeRequest('/personas');
    }

    /**
     * Obtener una persona por ID
     */
    async getPersona(id) {
        return this.makeRequest(`/personas/${id}`);
    }

    /**
     * Crear una nueva persona
     * @param {Object} personaData - Datos de la persona
     * @param {string} personaData.name - Nombre de la persona
     * @param {string} personaData.apellido - Apellido de la persona
     * @param {string} personaData.email - Email de la persona
     * @param {number} personaData.tel - Teléfono de la persona
     * @param {number} personaData.dni - DNI de la persona
     * @returns {Promise<Object>} Persona creada
     * @example
     * const nuevaPersona = await apiService.createPersona({
     *   name: 'Juan',
     *   apellido: 'Pérez',
     *   email: 'juan@email.com',
     *   tel: 1123456789,
     *   dni: 12345678
     * });
     */
    async createPersona(personaData) {
        return this.makeRequest('/personas', {
            method: 'POST',
            body: JSON.stringify(personaData)
        });
    }

    /**
     * Actualizar una persona
     */
    async updatePersona(id, personaData) {
        return this.makeRequest(`/personas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(personaData)
        });
    }

    /**
     * Eliminar una persona
     */
    async deletePersona(id) {
        return this.makeRequest(`/personas/${id}`, {
            method: 'DELETE'
        });
    }

    // ========== BENEFICIOS ==========
    
    /**
     * Obtener todos los beneficios
     */
    async getBeneficios() {
        return this.makeRequest('/beneficios');
    }

    /**
     * Obtener un beneficio por ID
     */
    async getBeneficio(id) {
        return this.makeRequest(`/beneficios/${id}`);
    }

    /**
     * Crear un nuevo beneficio
     */
    async createBeneficio(beneficioData) {
        return this.makeRequest('/beneficios', {
            method: 'POST',
            body: JSON.stringify(beneficioData)
        });
    }

    /**
     * Actualizar un beneficio
     */
    async updateBeneficio(id, beneficioData) {
        return this.makeRequest(`/beneficios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(beneficioData)
        });
    }

    /**
     * Eliminar un beneficio
     */
    async deleteBeneficio(id) {
        return this.makeRequest(`/beneficios/${id}`, {
            method: 'DELETE'
        });
    }

    // ========== MÉTODOS ÚTILES ==========
    
    /**
     * Obtener beneficios activos (fecha actual entre fechaInicio y fechaFin)
     */
    async getBeneficiosActivos() {
        const response = await this.getBeneficios();
        const hoy = new Date();
        
        return {
            ...response,
            data: response.data.filter(beneficio => {
                const fechaInicio = new Date(beneficio.fechaInicio);
                const fechaFin = new Date(beneficio.fechaFin);
                return fechaInicio <= hoy && fechaFin >= hoy;
            })
        };
    }

    /**
     * Obtener beneficios por método de pago
     */
    async getBeneficiosPorMetodoPago(metodoPago) {
        const response = await this.getBeneficios();
        
        return {
            ...response,
            data: response.data.filter(beneficio => 
                beneficio.metodoPago && beneficio.metodoPago.includes(metodoPago)
            )
        };
    }
}

// Crear instancia global del servicio
const apiService = new ApiService();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
