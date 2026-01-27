// Configuración automática de la API según el entorno
(function() {
    'use strict';
    
    console.log('🔧 Cargando configuración automática de la API...');
    
    // Función para detectar automáticamente la URL base de la API
    function detectApiBaseUrl() {
        const currentHost = window.location.hostname;
        const currentProtocol = window.location.protocol;
        const currentPort = window.location.port;
        
        console.log('🌐 Detectando URL base de la API...');
        console.log('📍 Host actual:', currentHost);
        console.log('🔒 Protocolo actual:', currentProtocol);
        console.log('🔢 Puerto actual:', currentPort || '(por defecto)');
        
        // Si estamos en localhost o 127.0.0.1
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
            // Si estamos en Live Server (puerto 5500), el backend está en otro puerto
            // Intentar detectar si el backend está corriendo en 5000 o 7229
            if (currentPort === '5500' || currentPort === '5501') {
                // Live Server detectado, usar el puerto del backend
                // Primero intentar HTTP en 5000, luego HTTPS en 7229
                const apiUrl = 'http://localhost:5000';
                console.log('🏠 Live Server detectado (puerto ' + currentPort + '), usando backend en:', apiUrl);
                return apiUrl;
            }
            
            // Si hay un puerto específico y no es Live Server, usarlo
            if (currentPort && currentPort !== '5500' && currentPort !== '5501') {
                const apiUrl = `${currentProtocol}//${currentHost}:${currentPort}`;
                console.log('🏠 Entorno local detectado, usando mismo origen:', apiUrl);
                return apiUrl;
            }
            
            // Si no hay puerto o es el puerto por defecto, usar el backend en 5000
            const apiUrl = 'http://localhost:5000';
            console.log('🏠 Entorno local detectado, usando backend en:', apiUrl);
            return apiUrl;
        }
        
        // Si estamos en producción (historia.runasp.net)
        if (currentHost.includes('historia.runasp.net') || currentHost.includes('runasp.net')) {
            const apiUrl = 'https://historia.runasp.net';
            console.log('🚀 Entorno de producción detectado, usando:', apiUrl);
            return apiUrl;
        }
        
        // Fallback: usar el mismo origen
        const fallbackUrl = currentPort 
            ? `${currentProtocol}//${currentHost}:${currentPort}`
            : `${currentProtocol}//${currentHost}`;
        console.log('⚠️ Usando fallback (mismo origen):', fallbackUrl);
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
  