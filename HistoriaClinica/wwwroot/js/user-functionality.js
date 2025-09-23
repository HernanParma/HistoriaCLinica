// Funcionalidad del usuario para la página de historia clínica
document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Inicializando funcionalidad del usuario en historia clínica...');
    
    // Obtener elementos del DOM
    const userGreeting = document.getElementById('userGreeting');
    const userName = document.getElementById('userName');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtnNav = document.getElementById('logoutBtnNav');
    const newPatientBtnNav = document.getElementById('newPatientBtnNav');
    
    // Verificar que los elementos existan
    if (!userGreeting || !userName || !userMenuBtn || !userDropdown || !logoutBtnNav) {
        console.error('❌ Elementos del usuario no encontrados');
        return;
    }
    
    // Verificar autenticación
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || 'Usuario';
    
    if (!isLoggedIn) {
        console.log('⚠️ Usuario no autenticado, redirigiendo...');
        window.location.replace('login.html');
        return;
    }
    
    // Actualizar la interfaz con la información del usuario
    userGreeting.textContent = `¡Hola, ${username}!`;
    userName.textContent = username;
    
    console.log('✅ Usuario autenticado:', username);
    
    // Funcionalidad del menú desplegable
    let isDropdownOpen = false;
    
    function toggleUserDropdown() {
        isDropdownOpen = !isDropdownOpen;
        if (isDropdownOpen) {
            userDropdown.classList.remove('hidden');
            userMenuBtn.classList.add('active');
        } else {
            userDropdown.classList.add('hidden');
            userMenuBtn.classList.remove('active');
        }
    }
    
    function closeUserDropdown() {
        isDropdownOpen = false;
        userDropdown.classList.add('hidden');
        userMenuBtn.classList.remove('active');
    }
    
    // Event listeners para el menú de usuario
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleUserDropdown();
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            closeUserDropdown();
        }
    });
    
    // Cerrar dropdown con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeUserDropdown();
        }
    });
    
    // Funcionalidad del botón "Registrar Nuevo Paciente"
    if (newPatientBtnNav) {
        newPatientBtnNav.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('👤 Redirigiendo a agregar nuevo paciente...');
            window.location.href = 'agregar.html';
        });
    }
    
    // Funcionalidad de logout
    if (logoutBtnNav) {
        logoutBtnNav.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🚪 Cerrando sesión...');
            
            // Limpiar localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('jwtToken');
            
            // Redirigir a login
            window.location.replace('login.html');
        });
    }
    
    // Redirección al hacer clic en logo o título
    var logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    console.log('✅ Funcionalidad del usuario inicializada correctamente');
});



















