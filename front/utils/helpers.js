/**
 * Utilidades para el frontend
 */

/**
 * Formatear fecha en formato legible español
 * @param {string|Date} fecha - Fecha a formatear (string ISO o objeto Date)
 * @returns {string} Fecha formateada en español (ej: "23 de julio de 2025")
 * @example
 * formatearFecha('2025-07-23'); // "23 de julio de 2025"
 * formatearFecha(null); // "N/A"
 */
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    
    const opciones = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

/**
 * Formatear porcentaje con símbolo %
 * @param {number} porcentaje - Número a formatear como porcentaje
 * @returns {string} Porcentaje formateado (ej: "15%")
 * @example
 * formatearPorcentaje(15); // "15%"
 * formatearPorcentaje(0); // "0%"
 */
function formatearPorcentaje(porcentaje) {
    return `${porcentaje}%`;
}

/**
 * Validar email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validar DNI argentino
 */
function validarDNI(dni) {
    const numero = parseInt(dni);
    return numero >= 1000000 && numero <= 99999999;
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(mensaje, containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="alert alert-error">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${mensaje}</span>
                <button class="close-btn" onclick="cerrarError('${containerId}')">×</button>
            </div>
        `;
        container.style.display = 'block';
    } else {
        alert(mensaje); // Fallback
    }
}

/**
 * Mostrar mensaje de éxito
 */
function mostrarExito(mensaje, containerId = 'success-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="alert alert-success">
                <span class="success-icon">✅</span>
                <span class="success-message">${mensaje}</span>
                <button class="close-btn" onclick="cerrarMensaje('${containerId}')">×</button>
            </div>
        `;
        container.style.display = 'block';
    } else {
        alert(mensaje); // Fallback
    }
}

/**
 * Cerrar mensaje de error
 */
function cerrarError(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Cerrar mensaje de éxito
 */
function cerrarMensaje(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Mostrar spinner de carga
 */
function mostrarCarga(containerId = 'loading-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <span>Cargando...</span>
            </div>
        `;
        container.style.display = 'flex';
    }
}

/**
 * Ocultar spinner de carga
 */
function ocultarCarga(containerId = 'loading-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Debounce function para optimizar búsquedas
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Escapar HTML para prevenir XSS
 */
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/**
 * Generar ID único
 */
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Verificar si un beneficio está activo
 */
function esBeneficioActivo(beneficio) {
    const hoy = new Date();
    const fechaInicio = new Date(beneficio.fechaInicio);
    const fechaFin = new Date(beneficio.fechaFin);
    
    return fechaInicio <= hoy && fechaFin >= hoy;
}

/**
 * Obtener días restantes para un beneficio
 */
function diasRestantes(fechaFin) {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
    
    return dias > 0 ? dias : 0;
}
