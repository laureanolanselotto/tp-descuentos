/**
 * Manejador de promociones
 */
class PromocionesManager {
    constructor() {
        this.promociones = [];
        this.promocionesFiltradas = [];
        this.init();
    }

    async init() {
        await this.cargarPromociones();
        this.setupEventListeners();
        this.renderPromociones();
    }

    /**
     * Cargar promociones desde la API
     */
    async cargarPromociones() {
        try {
            mostrarCarga();
            const response = await apiService.getBeneficiosActivos();
            this.promociones = response.data || [];
            this.promocionesFiltradas = [...this.promociones];
            ocultarCarga();
            
            if (this.promociones.length === 0) {
                mostrarError('No hay promociones activas en este momento');
            }
        } catch (error) {
            ocultarCarga();
            mostrarError('Error al cargar las promociones: ' + error.message);
            console.error('Error:', error);
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-btn');
        const metodoPagoFilter = document.getElementById('metodo-pago-filter');
        const porcentajeFilter = document.getElementById('porcentaje-filter');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.actualizarPromociones());
        }

        if (metodoPagoFilter) {
            metodoPagoFilter.addEventListener('change', () => this.aplicarFiltros());
        }

        if (porcentajeFilter) {
            porcentajeFilter.addEventListener('input', (e) => {
                document.getElementById('porcentaje-display').textContent = `Mínimo: ${e.target.value}%`;
                this.aplicarFiltros();
            });
        }
    }

    /**
     * Aplicar filtros a las promociones
     */
    aplicarFiltros() {
        const metodoPago = document.getElementById('metodo-pago-filter').value;
        const porcentajeMinimo = parseInt(document.getElementById('porcentaje-filter').value);

        this.promocionesFiltradas = this.promociones.filter(promo => {
            // Filtro por método de pago
            if (metodoPago && (!promo.metodoPago || !promo.metodoPago.some(m => 
                m.toLowerCase().includes(metodoPago.toLowerCase())))) {
                return false;
            }

            // Filtro por porcentaje mínimo
            if (promo.porcentaje < porcentajeMinimo) {
                return false;
            }

            return true;
        });

        this.renderPromociones();
    }

    /**
     * Actualizar promociones
     */
    async actualizarPromociones() {
        await this.cargarPromociones();
        this.aplicarFiltros();
        mostrarExito('Promociones actualizadas correctamente');
    }

    /**
     * Renderizar promociones en el DOM
     */
    renderPromociones() {
        const container = document.getElementById('promociones-container');
        const template = document.getElementById('promocion-template');

        if (!container || !template) {
            console.error('No se encontraron los elementos necesarios');
            return;
        }

        // Limpiar contenedor
        container.innerHTML = '';

        if (this.promocionesFiltradas.length === 0) {
            container.innerHTML = `
                <div class="no-promociones">
                    <h3>😔 No hay promociones que coincidan con los filtros</h3>
                    <p>Intenta ajustar los filtros o actualizar la lista</p>
                </div>
            `;
            return;
        }

        // Renderizar cada promoción
        this.promocionesFiltradas.forEach(promo => {
            const promocionElement = this.crearElementoPromocion(promo, template);
            container.appendChild(promocionElement);
        });
    }

    /**
     * Crear elemento de promoción
     */
    crearElementoPromocion(promo, template) {
        const clone = document.importNode(template.content, true);

        // Rellenar datos
        clone.querySelector('.promo-name').textContent = promo.name;
        clone.querySelector('.promo-description').textContent = promo.descripcion;
        clone.querySelector('.promo-porcentaje').textContent = formatearPorcentaje(promo.porcentaje) + ' OFF';
        clone.querySelector('.promo-tipo').textContent = promo.tipoDescuento;

        // Fechas
        clone.querySelector('.fecha-inicio').textContent = `Desde: ${formatearFecha(promo.fechaInicio)}`;
        clone.querySelector('.fecha-fin').textContent = `Hasta: ${formatearFecha(promo.fechaFin)}`;
        
        const diasRestantesEl = clone.querySelector('.dias-restantes');
        const dias = diasRestantes(promo.fechaFin);
        if (dias > 0) {
            diasRestantesEl.textContent = `⏰ ${dias} días restantes`;
            diasRestantesEl.className = 'dias-restantes urgente';
        } else {
            diasRestantesEl.textContent = '⚠️ Promoción expirada';
            diasRestantesEl.className = 'dias-restantes expirado';
        }

        // Métodos de pago
        const metodosContainer = clone.querySelector('.metodos-pago-lista');
        if (promo.metodoPago && promo.metodoPago.length > 0) {
            metodosContainer.innerHTML = promo.metodoPago.map(metodo => 
                `<span class="metodo-pago-badge">${escaparHTML(metodo)}</span>`
            ).join('');
        } else {
            metodosContainer.innerHTML = '<span class="metodo-pago-badge">No especificado</span>';
        }

        // Agregar clase para promociones próximas a vencer
        if (dias <= 3 && dias > 0) {
            clone.querySelector('.promocion-card').classList.add('promocion-urgente');
        }

        return clone;
    }
}

/**
 * Inicializar cuando se cargue la página
 */
document.addEventListener('DOMContentLoaded', () => {
    new PromocionesManager();
});
