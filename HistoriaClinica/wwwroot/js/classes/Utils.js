/**
 * Clase de utilidades generales
 */
class Utils {
    /**
     * Selector de elementos DOM
     */
    static $(selector, root = document) {
        return root.querySelector(selector);
    }

    /**
     * Selector de múltiples elementos DOM
     */
    static $$(selector, root = document) {
        return Array.from(root.querySelectorAll(selector));
    }

    /**
     * Obtiene elemento por ID
     */
    static byId(id) {
        return document.getElementById(id);
    }

    /**
     * Elimina duplicados de un array
     */
    static uniq(arr) {
        return [...new Set(arr)];
    }

    /**
     * Limita un número entre min y max
     */
    static clamp(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }

    /**
     * Formatea una fecha para input de tipo date
     */
    static formatDateForInput(value) {
        if (!value) return '';
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        if (typeof value === 'string' && value.includes('T')) return value.split('T')[0];
        const date = new Date(value);
        return isNaN(date) ? '' : date.toISOString().split('T')[0];
    }

    /**
     * Intenta convertir un valor a fecha ISO
     */
    static tryISODate(value) {
        if (!value) return null;
        const date = new Date(value);
        return isNaN(date) ? null : date.toISOString().split('T')[0];
    }

    /**
     * Convierte un valor a float o null
     */
    static toFloatOrNull(value) {
        if (value == null || String(value).trim() === '') return null;
        const v = parseFloat(String(value).replace(',', '.'));
        return Number.isFinite(v) ? v : null;
    }

    /**
     * Obtiene el ID del paciente desde la URL
     */
    static getPatientIdFromUrl() {
        return new URLSearchParams(window.location.search).get('id');
    }

    /**
     * Debounce function
     */
    static debounce(func, wait, immediate) {
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
     * Throttle function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Genera un ID único
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Capitaliza la primera letra de una cadena
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Convierte una cadena a camelCase
     */
    static toCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    /**
     * Convierte una cadena a kebab-case
     */
    static toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Escapa caracteres HTML
     */
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    /**
     * Desescapa caracteres HTML
     */
    static unescapeHtml(text) {
        const map = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'"
        };
        return text.replace(/&(amp|lt|gt|quot|#039);/g, (m) => map[m]);
    }

    /**
     * Formatea un número con separadores de miles
     */
    static formatNumber(num, decimals = 0) {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    }

    /**
     * Formatea una fecha en formato local
     */
    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        return new Intl.DateTimeFormat('es-ES', { ...defaultOptions, ...options }).format(new Date(date));
    }

    /**
     * Formatea una fecha y hora en formato local
     */
    static formatDateTime(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Intl.DateTimeFormat('es-ES', { ...defaultOptions, ...options }).format(new Date(date));
    }

    /**
     * Calcula la edad a partir de una fecha de nacimiento
     */
    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    /**
     * Valida un email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valida un DNI argentino
     */
    static isValidDNI(dni) {
        const dniRegex = /^\d{7,8}$/;
        return dniRegex.test(dni);
    }

    /**
     * Valida un teléfono
     */
    static isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
    }

    /**
     * Copia texto al portapapeles
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    /**
     * Descarga un archivo
     */
    static downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Lee un archivo como texto
     */
    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * Lee un archivo como data URL
     */
    static readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Espera un tiempo determinado
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry con backoff exponencial
     */
    static async retry(fn, maxAttempts = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === maxAttempts) throw error;
                await this.sleep(delay * Math.pow(2, attempt - 1));
            }
        }
    }

    /**
     * Verifica si un elemento está en el viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Scroll suave a un elemento
     */
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Obtiene parámetros de la URL
     */
    static getUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    /**
     * Actualiza parámetros de la URL sin recargar la página
     */
    static updateUrlParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, params[key]);
            }
        });
        window.history.pushState({}, '', url);
    }

    /**
     * Obtiene el valor de un cookie
     */
    static getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    /**
     * Establece un cookie
     */
    static setCookie(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    /**
     * Elimina un cookie
     */
    static deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
}

