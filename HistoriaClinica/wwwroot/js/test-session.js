// Script de prueba para verificar la gestión de sesiones
console.log('🧪 Iniciando pruebas de sesión...');

// Función para simular diferentes estados de sesión
function testSessionStates() {
    console.log('🔍 Probando diferentes estados de sesión...');
    
    // Estado 1: Sin sesión
    console.log('\n📋 Estado 1: Sin sesión');
    localStorage.clear();
    sessionStorage.clear();
    console.log('localStorage:', Object.keys(localStorage));
    console.log('sessionStorage:', Object.keys(sessionStorage));
    
    // Estado 2: Con token en userToken (estado problemático)
    console.log('\n📋 Estado 2: Con token en userToken (estado problemático)');
    localStorage.setItem('userToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYzNzQ5NjAwMCwiZXhwIjoxNjM3NTgyNDAwfQ.test');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', 'admin');
    console.log('localStorage:', Object.keys(localStorage));
    
    // Estado 3: Con token en jwtToken (estado correcto)
    console.log('\n📋 Estado 3: Con token en jwtToken (estado correcto)');
    localStorage.setItem('jwtToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYzNzQ5NjAwMCwiZXhwIjoxNjM3NTgyNDAwfQ.test');
    console.log('localStorage:', Object.keys(localStorage));
    
    // Estado 4: Con múltiples tokens (estado conflictivo)
    console.log('\n📋 Estado 4: Con múltiples tokens (estado conflictivo)');
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYzNzQ5NjAwMCwiZXhwIjoxNjM3NTgyNDAwfQ.conflict');
    localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYzNzQ5NjAwMCwiZXhwIjoxNjM3NTgyNDAwfQ.auth');
    console.log('localStorage:', Object.keys(localStorage));
}

// Función para probar la limpieza de tokens
function testTokenCleanup() {
    console.log('\n🧹 Probando limpieza de tokens...');
    
    // Simular estado conflictivo
    localStorage.setItem('userToken', 'old-token');
    localStorage.setItem('jwtToken', 'new-token');
    localStorage.setItem('token', 'conflict-token');
    
    console.log('Antes de limpieza:', Object.keys(localStorage));
    
    // Simular la función de limpieza
    const keysToClean = ['userToken', 'token', 'authToken', 'accessToken'];
    keysToClean.forEach(key => {
        if (key !== 'jwtToken') {
            localStorage.removeItem(key);
        }
    });
    
    console.log('Después de limpieza:', Object.keys(localStorage));
}

// Función para probar validación de token
function testTokenValidation() {
    console.log('\n✅ Probando validación de token...');
    
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYzNzQ5NjAwMCwiZXhwIjoxNjM3NTgyNDAwfQ.test';
    const invalidToken = 'invalid-token';
    const emptyToken = '';
    
    console.log('Token válido:', validToken.split('.').length === 3);
    console.log('Token inválido:', invalidToken.split('.').length === 3);
    console.log('Token vacío:', emptyToken.split('.').length === 3);
}

// Ejecutar todas las pruebas
function runAllTests() {
    console.log('🚀 Ejecutando todas las pruebas...\n');
    
    testSessionStates();
    testTokenCleanup();
    testTokenValidation();
    
    console.log('\n✅ Todas las pruebas completadas');
    console.log('\n📊 Estado final del localStorage:', Object.keys(localStorage));
    console.log('📊 Estado final del sessionStorage:', Object.keys(sessionStorage));
}

// Ejecutar pruebas cuando se cargue la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Exportar funciones para uso manual
window.testSession = {
    testSessionStates,
    testTokenCleanup,
    testTokenValidation,
    runAllTests
};










