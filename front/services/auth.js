/**
 * Servicio de autenticación para el frontend
 * 
 * Maneja toda la lógica relacionada con autenticación en el lado del cliente:
 * - Almacenamiento de tokens
 * - Login y registro
 * - Verificación de estado de autenticación
 * - Logout
 */
class AuthService {
    constructor() {
        this.baseUrl = '/api/auth';
        this.tokenKey = 'tp-descuentos-token';
        this.userKey = 'tp-descuentos-user';
    }

    /**
     * Registra un nuevo usuario
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (result.success) {
                // Guardar token y usuario en localStorage
                this.setToken(result.data.token);
                this.setUser(result.data.user);
                return result;
            } else {
                throw new Error(result.message || 'Error en el registro');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    /**
     * Inicia sesión con email y contraseña
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                // Guardar token y usuario en localStorage
                this.setToken(result.data.token);
                this.setUser(result.data.user);
                return result;
            } else {
                throw new Error(result.message || 'Error en el login');
            }
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Cierra la sesión del usuario
     */
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                // Llamar al endpoint de logout (opcional)
                await fetch(`${this.baseUrl}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
            }
        } catch (error) {
            console.warn('Error al cerrar sesión en el servidor:', error);
        } finally {
            // Limpiar datos locales
            this.clearAuth();
        }
    }

    /**
     * Obtiene el perfil del usuario autenticado
     */
    async getProfile() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch(`${this.baseUrl}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                this.setUser(result.data.user);
                return result.data.user;
            } else {
                throw new Error(result.message || 'Error al obtener perfil');
            }
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            throw error;
        }
    }

    /**
     * Verifica si el token actual es válido
     */
    async verifyToken() {
        try {
            const token = this.getToken();
            if (!token) {
                return false;
            }

            const response = await fetch(`${this.baseUrl}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            return result.success && result.data.valid;
        } catch (error) {
            console.error('Error al verificar token:', error);
            return false;
        }
    }

    /**
     * Obtiene el token almacenado
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Guarda el token en localStorage
     */
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    /**
     * Obtiene los datos del usuario almacenados
     */
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Guarda los datos del usuario en localStorage
     */
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        return !!(token && user);
    }

    /**
     * Limpia todos los datos de autenticación
     */
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Obtiene headers de autorización para peticiones
     */
    getAuthHeaders() {
        const token = this.getToken();
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Redirige al login si no está autenticado
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    /**
     * Maneja errores de autenticación automáticamente
     */
    handleAuthError(error) {
        if (error.message.includes('Token inválido') || 
            error.message.includes('expirado') || 
            error.message.includes('401')) {
            this.clearAuth();
            window.location.href = '/login';
        }
    }
}

// Crear instancia global del servicio
window.authService = new AuthService();
