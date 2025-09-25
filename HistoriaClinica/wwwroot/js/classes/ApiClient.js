/**
 * Clase para manejar todas las llamadas a la API
 */
class ApiClient {
    constructor() {
        this.baseUrl = window.CONFIG?.API_BASE_URL || window.location.origin;
    }

    /**
     * Obtiene los headers de autenticación
     */
    getAuthHeaders() {
        const token = localStorage.getItem('jwtToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    /**
     * Realiza una petición HTTP
     */
    async request(path, options = {}) {
        const {
            method = 'GET',
            data,
            headers = {},
            raw = false
        } = options;

        const url = `${this.baseUrl}${path}`;
        const requestOptions = {
            method,
            headers: { 
                Accept: 'application/json', 
                ...this.getAuthHeaders(), 
                ...headers 
            }
        };

        if (data !== undefined && headers['Content-Type'] !== 'multipart/form-data') {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, requestOptions);
            
            if (response.status === 401) {
                this.clearAuth();
                window.location.replace('login.html');
                throw new Error('401 No autorizado');
            }

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`${response.status} ${response.statusText}${text ? ' - ' + text : ''}`);
            }

            return raw ? response : response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * Limpia la autenticación
     */
    clearAuth() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('jwtToken');
    }

    /**
     * Métodos de conveniencia
     */
    async get(path) {
        return this.request(path);
    }

    async post(path, data, headers = {}) {
        return this.request(path, { method: 'POST', data, headers });
    }

    async put(path, data) {
        return this.request(path, { method: 'PUT', data });
    }

    async delete(path) {
        return this.request(path, { method: 'DELETE' });
    }

    /**
     * Métodos específicos para pacientes
     */
    async getPatient(patientId) {
        return this.get(`/api/pacientes/${patientId}`);
    }

    async updatePatient(patientId, data) {
        return this.put(`/api/pacientes/${patientId}`, data);
    }

    async getPatientConsultations(patientId) {
        return this.get(`/api/pacientes/${patientId}/consultas`);
    }

    async createConsultation(patientId, data) {
        return this.request(`/api/pacientes/${patientId}/consultas`, {
            method: 'POST',
            data,
            raw: true
        });
    }

    async updateConsultation(patientId, consultationId, data) {
        return this.put(`/api/pacientes/${patientId}/consultas/${consultationId}`, data);
    }

    async deleteConsultation(patientId, consultationId) {
        return this.delete(`/api/pacientes/${patientId}/consultas/${consultationId}`);
    }

    async markAsReviewed(patientId, consultationId, field) {
        return this.put(`/api/pacientes/${patientId}/consultas/${consultationId}/marcar-revisado`, { campo: field });
    }

    /**
     * Métodos para archivos
     */
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('archivo', file);
        
        return this.request('/api/pacientes/archivos/subir', {
            method: 'POST',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    async uploadFiles(files) {
        const results = [];
        for (const file of files) {
            const result = await this.uploadFile(file);
            results.push(result);
        }
        return results;
    }
}

