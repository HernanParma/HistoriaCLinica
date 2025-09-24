/**
 * Clase para manejar el almacenamiento local y autenticación
 */
class StorageManager {
    constructor() {
        this.storage = localStorage;
    }

    /**
     * Obtiene el token JWT
     */
    get jwt() {
        return this.storage.getItem('jwtToken');
    }

    /**
     * Obtiene el estado de login
     */
    get isLoggedIn() {
        return this.storage.getItem('isLoggedIn') === 'true';
    }

    /**
     * Obtiene el nombre de usuario
     */
    get username() {
        return this.storage.getItem('username');
    }

    /**
     * Establece el token JWT
     */
    setJwt(token) {
        this.storage.setItem('jwtToken', token);
    }

    /**
     * Establece el estado de login
     */
    setLoggedIn(isLoggedIn) {
        this.storage.setItem('isLoggedIn', isLoggedIn.toString());
    }

    /**
     * Establece el nombre de usuario
     */
    setUsername(username) {
        this.storage.setItem('username', username);
    }

    /**
     * Limpia toda la información de autenticación
     */
    clearAuth() {
        this.storage.removeItem('isLoggedIn');
        this.storage.removeItem('username');
        this.storage.removeItem('jwtToken');
    }

    /**
     * Obtiene un valor del almacenamiento
     */
    getItem(key) {
        return this.storage.getItem(key);
    }

    /**
     * Establece un valor en el almacenamiento
     */
    setItem(key, value) {
        this.storage.setItem(key, value);
    }

    /**
     * Elimina un valor del almacenamiento
     */
    removeItem(key) {
        this.storage.removeItem(key);
    }

    /**
     * Obtiene un objeto del almacenamiento
     */
    getObject(key) {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error parsing stored object:', error);
            return null;
        }
    }

    /**
     * Establece un objeto en el almacenamiento
     */
    setObject(key, value) {
        try {
            this.storage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error storing object:', error);
        }
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        return this.isLoggedIn && this.jwt;
    }

    /**
     * Obtiene el ID del paciente desde la URL
     */
    getPatientIdFromUrl() {
        return new URLSearchParams(window.location.search).get('id');
    }
}
