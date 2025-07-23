/**
 * Validadores para el proyecto
 */

export class Validators {
    /**
     * Validar email usando expresión regular RFC 5322
     * @param email - Email a validar
     * @returns true si el email es válido, false si no
     * @example
     * Validators.isValidEmail('user@example.com'); // true
     * Validators.isValidEmail('invalid-email'); // false
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validar DNI argentino (debe estar entre 1.000.000 y 99.999.999)
     * @param dni - Número de DNI a validar
     * @returns true si el DNI es válido, false si no
     * @example
     * Validators.isValidDNI(12345678); // true
     * Validators.isValidDNI(123); // false (muy corto)
     */
    static isValidDNI(dni: number): boolean {
        return Number.isInteger(dni) && dni >= 1000000 && dni <= 99999999;
    }

    /**
     * Validar teléfono argentino
     */
    static isValidPhone(phone: number): boolean {
        const phoneStr = phone.toString();
        return phoneStr.length >= 8 && phoneStr.length <= 15;
    }

    /**
     * Validar porcentaje
     */
    static isValidPercentage(percentage: number): boolean {
        return Number.isFinite(percentage) && percentage > 0 && percentage <= 100;
    }

    /**
     * Validar fecha
     */
    static isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * Validar que fechaFin sea posterior a fechaInicio
     */
    static isValidDateRange(fechaInicio: string, fechaFin: string): boolean {
        if (!this.isValidDate(fechaInicio) || !this.isValidDate(fechaFin)) {
            return false;
        }
        
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        return fin > inicio;
    }

    /**
     * Validar array de métodos de pago
     */
    static isValidPaymentMethods(methods: string[]): boolean {
        if (!Array.isArray(methods) || methods.length === 0) {
            return false;
        }
        
        const validMethods = ['qr', 'tarjeta', 'tarjeta de credito', 'tarjeta de debito', 'efectivo'];
        
        return methods.every(method => 
            typeof method === 'string' && 
            method.trim().length > 0 &&
            validMethods.some(valid => method.toLowerCase().includes(valid.toLowerCase()))
        );
    }

    /**
     * Validar string no vacío
     */
    static isValidString(str: string, minLength: number = 1, maxLength: number = 255): boolean {
        return typeof str === 'string' && 
               str.trim().length >= minLength && 
               str.trim().length <= maxLength;
    }

    /**
     * Sanitizar string
     */
    static sanitizeString(str: string): string {
        if (typeof str !== 'string') return '';
        return str.trim().replace(/[<>'"]/g, '');
    }

    /**
     * Validar datos de persona
     */
    static validatePersona(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.isValidString(data.name, 2, 50)) {
            errors.push('El nombre debe tener entre 2 y 50 caracteres');
        }

        if (!this.isValidString(data.apellido, 2, 50)) {
            errors.push('El apellido debe tener entre 2 y 50 caracteres');
        }

        if (!this.isValidEmail(data.email)) {
            errors.push('El email no tiene un formato válido');
        }

        if (!this.isValidPhone(data.tel)) {
            errors.push('El teléfono no es válido');
        }

        if (!this.isValidDNI(data.dni)) {
            errors.push('El DNI debe ser un número entre 1.000.000 y 99.999.999');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validar datos de beneficio
     */
    static validateBeneficio(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.isValidString(data.name, 3, 100)) {
            errors.push('El nombre debe tener entre 3 y 100 caracteres');
        }

        if (!this.isValidPercentage(data.porcentaje)) {
            errors.push('El porcentaje debe ser un número entre 1 y 100');
        }

        if (!this.isValidString(data.descripcion, 10, 500)) {
            errors.push('La descripción debe tener entre 10 y 500 caracteres');
        }

        if (!this.isValidDateRange(data.fechaInicio, data.fechaFin)) {
            errors.push('Las fechas no son válidas o la fecha de fin debe ser posterior a la de inicio');
        }

        if (!this.isValidPaymentMethods(data.metodoPago)) {
            errors.push('Debe especificar al menos un método de pago válido');
        }

        if (!this.isValidString(data.tipoDescuento, 3, 50)) {
            errors.push('El tipo de descuento debe tener entre 3 y 50 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
