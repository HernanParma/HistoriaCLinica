/**
 * Cargador de clases para el sistema de historia clínica
 * Este archivo debe ser incluido antes de historia-refactored.js
 */

// Función para cargar scripts dinámicamente
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Función para cargar todas las clases
async function loadAllClasses() {
    const classes = [
        'classes/ApiClient.js',
        'classes/StorageManager.js',
        'classes/UIManager.js',
        'classes/FileManager.js',
        'classes/LabFieldsManager.js',
        'classes/ConsultaManager.js',
        'classes/PatientManager.js',
        'classes/ModalManager.js',
        'classes/Utils.js'
    ];

    try {
        for (const className of classes) {
            await loadScript(className);
        }
        console.log('✅ Todas las clases cargadas correctamente');
    } catch (error) {
        console.error('❌ Error cargando clases:', error);
        throw error;
    }
}

// Auto-cargar si estamos en el contexto correcto
if (typeof window !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllClasses);
} else if (typeof window !== 'undefined') {
    loadAllClasses();
}

