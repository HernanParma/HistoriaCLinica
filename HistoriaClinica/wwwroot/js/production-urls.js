// js/production-urls.js
// Manejo de URLs para producción con HTTPS
(function() {
    'use strict';
    
    // Función para obtener la URL base de la aplicación
    function getBaseUrl() {
        return window.location.origin;
    }
    
    // Función para construir URLs absolutas
    function buildUrl(path) {
        const baseUrl = getBaseUrl();
        // Asegurar que path comience con /
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        return baseUrl + cleanPath;
    }
    
    // Función para redirigir a páginas específicas
    function redirectTo(page) {
        const url = buildUrl(page);
        window.location.href = url;
    }
    
    // Función para verificar si estamos en HTTPS
    function isHttps() {
        return window.location.protocol === 'https:';
    }
    
    // Función para verificar si estamos en producción
    function isProduction() {
        return !isDevelopment();
    }
    
    // Función para verificar si estamos en desarrollo
    function isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('.local') ||
               window.location.port !== '';
    }
    
    // Hacer las funciones disponibles globalmente
    window.URL_HELPER = {
        getBaseUrl,
        buildUrl,
        redirectTo,
        isHttps,
        isProduction,
        isDevelopment
    };
    
    // Log para debugging
    if (isDevelopment()) {
        console.log('🔧 URL Helper cargado para DESARROLLO');
        console.log('🌐 Base URL:', getBaseUrl());
        console.log('🔒 HTTPS:', isHttps());
    } else {
        console.log('🚀 URL Helper cargado para PRODUCCIÓN');
        console.log('🌐 Base URL:', getBaseUrl());
        console.log('🔒 HTTPS:', isHttps());
    }
    
    // Exportar para módulos si es necesario
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { URL_HELPER };
    }
})();





















