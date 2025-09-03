// Configuración automática de la API según el entorno
(function() {
    'use strict';
    
    console.log('🔧 Cargando configuración automática de la API...');
    
    // Función para detectar automáticamente la URL base de la API
    function detectApiBaseUrl() {
        const currentHost = window.location.hostname;
        const currentProtocol = window.location.protocol;
        
        console.log('🌐 Detectando URL base de la API...');
        console.log('📍 Host actual:', currentHost);
        console.log('🔒 Protocolo actual:', currentProtocol);
        
        // Si estamos en localhost o en desarrollo
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
            const apiUrl = 'http://localhost:5156';
            console.log('🏠 Entorno local detectado, usando:', apiUrl);
            return apiUrl;
        }
        
        // Si estamos en producción (historia.runasp.net)
        if (currentHost.includes('historia.runasp.net') || currentHost.includes('runasp.net')) {
            const apiUrl = 'https://historia.runasp.net';
            console.log('🚀 Entorno de producción detectado, usando:', apiUrl);
            return apiUrl;
        }
        
        // Fallback: usar el mismo origen
        const fallbackUrl = `${currentProtocol}//${currentHost}`;
        console.log('⚠️ Usando fallback:', fallbackUrl);
        return fallbackUrl;
    }
    
    // Configuración global
    window.CONFIG = {
        API_BASE_URL: detectApiBaseUrl(),
        API_ENDPOINTS: {
            LOGIN: '/api/usuarios/login',
            REGISTER: '/api/usuarios/registrar',
            VERIFY: '/api/usuarios/verificar',
            PATIENTS: '/api/pacientes',
            CONSULTAS: '/api/consultas'
        },
        ENVIRONMENT: detectEnvironment(),
        VERSION: '1.0.0'
    };
    
    function detectEnvironment() {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'development';
        } else if (host.includes('historia.runasp.net')) {
            return 'production';
        } else {
            return 'unknown';
        }
    }
    
    // Función para cambiar dinámicamente la URL base
    window.updateApiBaseUrl = function(newUrl) {
        console.log('🔄 Actualizando URL base de la API:', newUrl);
        window.CONFIG.API_BASE_URL = newUrl;
        return newUrl;
    };
    
    // Función para obtener la URL completa de un endpoint
    window.getApiUrl = function(endpoint) {
        return `${window.CONFIG.API_BASE_URL}${endpoint}`;
    };
    
    // Función para verificar conectividad
    window.checkApiConnectivity = async function() {
        try {
            const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return response.ok;
        } catch (error) {
            console.warn('⚠️ No se pudo verificar conectividad con la API:', error.message);
            return false;
        }
    };
    
    console.log('✅ Configuración cargada:', window.CONFIG);
    
})();
  