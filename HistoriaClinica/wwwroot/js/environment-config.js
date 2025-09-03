// js/environment-config.js
// Configuración automática de entorno que detecta si estamos en desarrollo o producción
(function() {
    'use strict';
    
    console.log('🔧 Detectando entorno de ejecución...');
    
    // Función para detectar el entorno
    function detectEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        console.log('📍 Hostname:', hostname);
        console.log('🔒 Protocolo:', protocol);
        
        // Si estamos en localhost o 127.0.0.1, es desarrollo
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            console.log('🏠 Entorno de DESARROLLO detectado');
            return 'development';
        }
        
        // Si estamos en historia.runasp.net o runasp.net, es producción
        if (hostname.includes('historia.runasp.net') || hostname.includes('runasp.net')) {
            console.log('🚀 Entorno de PRODUCCIÓN detectado');
            return 'production';
        }
        
        // Fallback: usar producción por defecto
        console.log('⚠️ Entorno no reconocido, usando PRODUCCIÓN por defecto');
        return 'production';
    }
    
    // Función para cargar la configuración según el entorno
    function loadEnvironmentConfig() {
        const environment = detectEnvironment();
        
        if (environment === 'development') {
            console.log('📁 Cargando configuración de DESARROLLO...');
            loadScript('js/development-config.js');
            return 'development';
        } else {
            console.log('📁 Cargando configuración de PRODUCCIÓN...');
            loadScript('js/production-config.js');
            return 'production';
        }
    }
    
    // Función para cargar scripts dinámicamente
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log('✅ Script cargado:', src);
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Error al cargar script:', src);
                reject(new Error(`Error al cargar script: ${src}`));
            };
            document.head.appendChild(script);
        });
    }
    
    // Cargar la configuración del entorno
    const currentEnvironment = loadEnvironmentConfig();
    
    // Configuración global básica que estará disponible inmediatamente
    window.ENVIRONMENT = currentEnvironment;
    
    console.log('✅ Entorno configurado:', currentEnvironment);
    
})();
