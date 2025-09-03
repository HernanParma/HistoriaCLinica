// Asegurar que CONFIG exista
if (typeof CONFIG === 'undefined') {
    var CONFIG = { API_BASE_URL: window.location.origin };
}
  
  // Estado global
  let isLoggedIn = false;
  let allPatients = [];
  let currentPage = 1;
  let patientsPerPage = 10;
  let filteredPatients = [];
  let sortColumn = null;
  let sortDirection = 'asc';
  
  // ======================
  //  INICIALIZACIÓN
  // ======================
  window.addEventListener('DOMContentLoaded', function () {
    // ---- Elementos comunes (login/registro) ----
    const loginForm = document.getElementById('loginForm');
    const userForm  = document.getElementById('userForm');
  
    const loginFormElement = document.getElementById('loginFormElement');
    const userFormElement  = document.getElementById('userFormElement');
  
    const loginMessage = document.getElementById('loginMessage');
    const userMessage  = document.getElementById('userMessage');
  
    const showRegisterLink = document.getElementById('showRegister');     // "Regístrate aquí"
    const switchToLoginBtn = document.getElementById('switchToLoginBtn'); // "Inicia sesión"

    // ---- Elementos de reset password ----
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetPasswordFormElement = document.getElementById('resetPasswordFormElement');
    const resetPasswordMessage = document.getElementById('resetPasswordMessage');
    const newPasswordForm = document.getElementById('newPasswordForm');
    const newPasswordFormElement = document.getElementById('newPasswordFormElement');
    const newPasswordMessage = document.getElementById('newPasswordMessage');
    const switchToLoginFromResetBtn = document.getElementById('switchToLoginFromResetBtn');
    const switchToLoginFromNewPasswordBtn = document.getElementById('switchToLoginFromNewPasswordBtn');
  
    // ---- Elementos de la app (index.html) ----
    const backToListBtn = document.getElementById('backToListBtn');
    const userInfo = document.getElementById('user-info');
    const userGreeting = document.getElementById('userGreeting');
    const userName = document.getElementById('userName');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtnNav = document.getElementById('logoutBtnNav');
    const newPatientBtnNav = document.getElementById('newPatientBtnNav');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnList = document.getElementById('logoutBtnList');
    const newPatientBtn = document.getElementById('newPatientBtn');
    const addFirstPatientBtn = document.getElementById('addFirstPatientBtn');
  
    const patientForm = document.getElementById('patientForm');
    const patientFormElement = document.getElementById('patientFormElement');
    const patientMessage = document.getElementById('patientMessage');
  
    const patientsList = document.getElementById('patientsList');
    const patientsMessage = document.getElementById('patientsMessage');
    const searchPatient = document.getElementById('searchPatient');
    const patientsTableBody = document.getElementById('patientsTableBody');
    const loadingPatients = document.getElementById('loadingPatients');
    const noPatients = document.getElementById('noPatients');
  
    const patientDetailsModal = document.getElementById('patient-details-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    // Panel lateral izquierdo
    const patientSidebar = document.getElementById('patient-sidebar');
    const sidebarContent = document.getElementById('sidebar-content');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const mainContent = document.querySelector('.main-content');
  
    const paginationBar = document.getElementById('paginationBar');
    const patientsPerPageSelect = document.getElementById('patientsPerPage');

    // Configurar eventos del panel lateral
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener('click', closePatientSidebar);
    }

    // Cerrar panel lateral con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && patientSidebar && patientSidebar.classList.contains('show')) {
        closePatientSidebar();
      }
    });
  
    // ======================
    //  UI helpers
    // ======================
    function showMessage(el, text, type) {
      if (!el) return;
      el.textContent = text;
      el.className = `message ${type}`;
      el.style.display = 'block';
      if (type === 'success') setTimeout(() => (el.style.display = 'none'), 5000);
    }
  
    function clearMessages() {
      document.querySelectorAll('.message').forEach(m => {
        m.style.display = 'none';
        m.textContent = '';
      });
    }
  
    function showLoginFormHard() {
      loginForm?.classList.remove('hidden');
      userForm?.classList.add('hidden');
      clearMessages();
    }
  
    function showUserFormHard() {
      userForm?.classList.remove('hidden');
      loginForm?.classList.add('hidden');
      resetPasswordForm?.classList.add('hidden');
      newPasswordForm?.classList.add('hidden');
      clearMessages();
    }

    function showResetPasswordFormHard() {
      resetPasswordForm?.classList.remove('hidden');
      loginForm?.classList.add('hidden');
      userForm?.classList.add('hidden');
      newPasswordForm?.classList.add('hidden');
      clearMessages();
    }

    function showNewPasswordFormHard() {
      newPasswordForm?.classList.remove('hidden');
      loginForm?.classList.add('hidden');
      userForm?.classList.add('hidden');
      resetPasswordForm?.classList.add('hidden');
      clearMessages();
    }
  
    // ======================
    //  Toggle Login ⇄ Registro ⇄ Reset Password (login.html)
    // ======================
    if (showRegisterLink) {
      showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showUserFormHard();
        history.replaceState(null, '', location.pathname + '#register');
      });
    }

    const showResetPasswordLink = document.getElementById('showResetPassword');
    if (showResetPasswordLink) {
      showResetPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showResetPasswordFormHard();
        history.replaceState(null, '', location.pathname + '#reset');
      });
    }
  
    if (switchToLoginBtn) {
      switchToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginFormHard();
        history.replaceState(null, '', location.pathname + '#login');
      });
    }
  
    // Estado inicial en login.html
    if (document.body && document.getElementById('loginForm') && document.getElementById('userForm')) {
      if (location.hash === '#register') showUserFormHard();
      else showLoginFormHard();
    }
  
    // ======================
    //  LOGIN
    // ======================
    if (loginFormElement) {
      loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const formData = new FormData(loginFormElement);
        const username = formData.get('username');
        const password = formData.get('password');
  
        if (!username || !password) {
          showMessage(loginMessage, 'Por favor complete todos los campos', 'error');
          return;
        }
  
        const btn = loginFormElement.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
  
        try {
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
  
          const resp = await fetch(`${CONFIG.API_BASE_URL}/api/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ NombreUsuario: username, Contrasena: password })
          });
  
          if (resp.ok) {
            const data = await resp.json();
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            if (data.token) {
              localStorage.setItem('jwtToken', data.token);
            }
            showMessage(loginMessage, '¡Login exitoso! Redirigiendo...', 'success');
            setTimeout(() => window.location.replace('index.html'), 500);
          } else {
            let errorMsg = 'Usuario o contraseña incorrectos. Por favor, verifica tus datos.';
            try {
              const data = await resp.text();
              console.log('Respuesta del servidor:', data);
              console.log('Status:', resp.status);
              console.log('Headers:', resp.headers);
              
              if (data && data.toLowerCase().includes('no verificado')) {
                errorMsg = 'Tu usuario no está verificado. Por favor, revisa tu correo electrónico para activarlo.';
              } else if (data && data.toLowerCase().includes('contraseña incorrecta')) {
                errorMsg = 'Contraseña incorrecta.';
              } else if (data && data.toLowerCase().includes('usuario no encontrado')) {
                errorMsg = 'Usuario no encontrado.';
              } else {
                errorMsg = `Error del servidor: ${data}`;
              }
            } catch (err) {
              console.error('Error al procesar respuesta:', err);
              errorMsg = 'Error de conexión. Intente nuevamente.';
            }
            showMessage(loginMessage, errorMsg, 'error');
          }
        } catch (err) {
          showMessage(loginMessage, 'Error de conexión. Intente nuevamente.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = original;
        }
      });
    }
  
    // ======================
    //  REGISTRO -> redirige a verificar.html
    // ======================
    if (userFormElement) {
      userFormElement.addEventListener('submit', handleUserRegistration);
    }
  
    async function handleUserRegistration(e) {
      e.preventDefault();
  
      const formData = new FormData(userFormElement);
      const username = formData.get('newUsername');
      const password = formData.get('newPassword');
      const confirmPassword = formData.get('confirmPassword');
  
      const email = 'hernanparma22@gmail.com';
  
      if (!username || !password || !confirmPassword) {
        showMessage(userMessage, 'Por favor complete todos los campos', 'error');
        return;
      }
      if (password.length < 6) {
        showMessage(userMessage, 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showMessage(userMessage, 'Las contraseñas no coinciden', 'error');
        return;
      }
  
      const btn = userFormElement.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
  
      try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
  
        const resp = await fetch(`${CONFIG.API_BASE_URL}/api/usuarios/registrar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ NombreUsuario: username, Contrasena: password })
        });
  
        if (resp.ok) {
          // Redirige a verificar.html con username (+ email opcional)
          const verifyUrl = new URL('verificar.html', window.location.href);
          verifyUrl.searchParams.set('username', username);
          verifyUrl.searchParams.set('email', email);
          console.log('Registro OK. Redirigiendo a:', verifyUrl.toString());
          window.location.replace(verifyUrl.toString());
          return;
        }
  
        const ct = resp.headers.get('content-type') || '';
        const errText = ct.includes('application/json') ? JSON.stringify(await resp.json()) : await resp.text();
        if (errText && errText.toLowerCase().includes('ya existe')) {
          showMessage(userMessage, 'El nombre de usuario o email ya existe. Intente con otro.', 'error');
        } else {
          showMessage(userMessage, errText || 'Error al registrar usuario. Intente nuevamente.', 'error');
        }
      } catch (err) {
        console.error('Error en registro:', err);
        showMessage(userMessage, 'Error de conexión. Intente nuevamente.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = original;
      }
    }
  
    // ======================
    //  NAV / HEADER
    // ======================
    function updateHeaderForLoggedInUser(username) {
      if (userInfo) userInfo.classList.remove('hidden');
      if (userName) userName.textContent = username;
      if (userGreeting) userGreeting.textContent = 'Hola!';
    }
  
    function updateHeaderForLoggedOutUser() {
      if (userInfo) userInfo.classList.add('hidden');
      closeUserDropdown();
    }
  
    function toggleUserDropdown() {
      if (!userDropdown || !userMenuBtn) return;
      const isOpen = !userDropdown.classList.contains('hidden');
      if (isOpen) closeUserDropdown();
      else openUserDropdown();
    }
  
    function openUserDropdown() {
      if (userDropdown) userDropdown.classList.remove('hidden');
      if (userMenuBtn) userMenuBtn.classList.add('active');
    }
  
    function closeUserDropdown() {
      if (userDropdown) userDropdown.classList.add('hidden');
      if (userMenuBtn) userMenuBtn.classList.remove('active');
    }
  
    if (userMenuBtn) userMenuBtn.addEventListener('click', toggleUserDropdown);
    document.addEventListener('click', function (e) {
      if (userDropdown && !userMenuBtn?.contains(e.target) && !userDropdown.contains(e.target)) closeUserDropdown();
    });
  
    // ======================
    //  Navegación de vistas (index.html)
    // ======================
    function showPatientsList() {
      if (patientsList) patientsList.classList.remove('hidden');
      loginForm?.classList.add('hidden');
      userForm?.classList.add('hidden');
      patientForm?.classList.add('hidden');
      clearMessages();
      loadPatients();
    }
  
    function showPatientForm() {
      if (patientForm) patientForm.classList.remove('hidden');
      loginForm?.classList.add('hidden');
      userForm?.classList.add('hidden');
      patientsList?.classList.add('hidden');
      clearMessages();
      loadPatients();
    }
  
    if (backToListBtn) backToListBtn.addEventListener('click', () => showPatientsList());
    if (newPatientBtn) newPatientBtn.addEventListener('click', () => showPatientForm());
    if (newPatientBtnNav) newPatientBtnNav.addEventListener('click', () => showPatientForm());
  
    // ======================
    //  Logout
    // ======================
    function handleLogout() {
      isLoggedIn = false;
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      updateHeaderForLoggedOutUser();
      window.location.replace('login.html');
    }
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnList) logoutBtnList.addEventListener('click', handleLogout);
    if (logoutBtnNav) logoutBtnNav.addEventListener('click', handleLogout);
  
    // ======================
    //  Estado de login (solo en index.html)
    // ======================
    function checkLoginStatus() {
      const savedLoginStatus = localStorage.getItem('isLoggedIn');
      const savedUsername = localStorage.getItem('username');
  
      if (savedLoginStatus === 'true' && savedUsername) {
        isLoggedIn = true;
        updateHeaderForLoggedInUser(savedUsername);
        showPatientsList();
      } else {
        updateHeaderForLoggedOutUser();
        // en index.html, si no hay login, muestra login (pero normalmente estás en login.html)
        showLoginFormHard();
      }
    }
  
    // Ejecutar según página:
    const path = window.location.pathname.toLowerCase();
    if (path.includes('index.html') || path.endsWith('/')) {
      checkLoginStatus();
      setupTableHeaders();
    } else if (path.includes('login.html')) {
      // ya se mostró la vista correcta arriba (hash #register o login por defecto)
    }
  
    // ======================
    //  PACIENTES (index.html)
    // ======================
    if (searchPatient) {
      searchPatient.addEventListener('input', handlePatientSearch);
    }
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closePatientModal);
    }
    if (patientDetailsModal) {
      patientDetailsModal.addEventListener('click', function (e) {
        if (e.target === patientDetailsModal) closePatientModal();
      });
    }
  
    if (patientsPerPageSelect) {
      patientsPerPageSelect.value = patientsPerPage;
      patientsPerPageSelect.addEventListener('change', function () {
        const value = this.value;
        if (value === '*') {
          patientsPerPage = Infinity; // Mostrar todos los pacientes
        } else {
          patientsPerPage = parseInt(value, 10);
        }
        currentPage = 1;
        updatePatientsTable();
      });
    }
  
    // Helper para obtener headers con JWT
    function getAuthHeaders() {
      const token = localStorage.getItem('jwtToken');
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async function loadPatients() {
      if (loadingPatients) loadingPatients.classList.remove('hidden');
      if (noPatients) noPatients.classList.add('hidden');
      if (patientsTableBody) patientsTableBody.innerHTML = '';

      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes`, {
          headers: { ...getAuthHeaders() }
        });
        if (response.ok) {
          allPatients = await response.json();
          
          // Debug: Verificar la estructura de los datos
          console.log(`📊 Cargados ${allPatients.length} pacientes desde la API`);
          
          filteredPatients = allPatients;
          currentPage = 1;
          updatePatientsTable();
        } else {
          showMessage(patientsMessage, 'Error al cargar los pacientes', 'error');
        }
      } catch (error) {
        showMessage(patientsMessage, 'Error de conexión al cargar pacientes', 'error');
        console.error('Error al cargar pacientes:', error);
      } finally {
        loadingPatients?.classList.add('hidden');
      }
    }
  
    function displayPatients(patients) {
      if (!patientsTableBody) return;

      patientsTableBody.innerHTML = '';
      if (patients.length === 0) {
        noPatients?.classList.remove('hidden');
        patientsTableBody.parentElement?.classList.add('hidden');
        return;
      }

      noPatients?.classList.add('hidden');
      patientsTableBody.parentElement?.classList.remove('hidden');

      // Limpiar cualquier mensaje informativo existente
      const existingInfo = patientsTableBody.parentElement?.querySelector('.info-message');
      if (existingInfo) {
        existingInfo.remove();
      }

      patients.forEach(patient => {
        // Corregir el mapeo de datos si es necesario
        const correctedPatient = {
          ...patient,
          // Mantener DNI y N° Afiliado como están (están correctos)
          dni: patient.dni,
          numeroAfiliado: patient.numeroAfiliado,
          
          // Corregir nombre y apellido - si en apellido hay nombres, intercambiar
          nombre: patient.nombre || '',
          apellido: patient.apellido || '',
          
          // Corregir las demás propiedades según la descripción del problema
          telefono: patient.telefono || '',
          obraSocial: patient.obraSocial || '',
          fechaNacimiento: patient.fechaNacimiento || '',
          particular: patient.particular || false
        };
        
        // Los datos están correctos, solo necesitamos intercambiar las posiciones de las celdas
        // No intercambiamos el contenido, solo la posición donde se muestran
        console.log(`📋 Datos del paciente ${correctedPatient.id}:`);
        console.log(`  Nombre: "${correctedPatient.nombre}"`);
        console.log(`  Apellido: "${correctedPatient.apellido}"`);
        
        // Verificar si hay problemas de mapeo (solo en consola para debug)
        if (correctedPatient.particular && typeof correctedPatient.particular === 'string' && /^\d+$/.test(correctedPatient.particular)) {
          console.log('⚠️ Detectado problema: particular contiene teléfono');
        }
        
        // Corregir el desplazamiento de datos según la descripción del problema
        // Si particular contiene teléfono, hay un desplazamiento
        if (correctedPatient.particular && typeof correctedPatient.particular === 'string' && /^\d+$/.test(correctedPatient.particular)) {
          console.log('Detectado desplazamiento de datos, corrigiendo...');
          
          // Corregir el desplazamiento: particular <- teléfono <- obra social <- fecha
          const tempParticular = correctedPatient.particular;
          const tempTelefono = correctedPatient.telefono;
          const tempObraSocial = correctedPatient.obraSocial;
          const tempFecha = correctedPatient.fechaNacimiento;
          
          // Reasignar correctamente
          correctedPatient.particular = false; // Valor por defecto para particular
          correctedPatient.telefono = tempParticular; // El teléfono estaba en particular
          correctedPatient.obraSocial = tempTelefono; // La obra social estaba en teléfono
          correctedPatient.fechaNacimiento = tempObraSocial; // La fecha estaba en obra social
          
          console.log('Datos corregidos:');
          console.log('  Particular:', correctedPatient.particular);
          console.log('  Teléfono:', correctedPatient.telefono);
          console.log('  Obra Social:', correctedPatient.obraSocial);
          console.log('  Fecha:', correctedPatient.fechaNacimiento);
        }
        
        // Log final para verificar el resultado
        console.log(`✅ Paciente ${correctedPatient.id}: Nombre="${correctedPatient.nombre}", Apellido="${correctedPatient.apellido}"`);
        
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        
        // Crear cada celda individualmente para asegurar el orden correcto
        const dniCell = document.createElement('td');
        dniCell.textContent = correctedPatient.dni || '';
        dniCell.setAttribute('data-column', 'dni');
        
        const afiliadoCell = document.createElement('td');
        afiliadoCell.textContent = correctedPatient.numeroAfiliado || '';
        afiliadoCell.setAttribute('data-column', 'afiliado');
        
        const apellidoCell = document.createElement('td');
        apellidoCell.textContent = correctedPatient.apellido || '';
        apellidoCell.setAttribute('data-column', 'apellido');
        
        const nombreCell = document.createElement('td');
        nombreCell.textContent = correctedPatient.nombre || '';
        nombreCell.setAttribute('data-column', 'nombre');
        
        const particularCell = document.createElement('td');
        particularCell.setAttribute('data-column', 'particular');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = correctedPatient.particular || false;
        checkbox.disabled = true;
        checkbox.style.pointerEvents = 'none';
        particularCell.appendChild(checkbox);
        
        const telefonoCell = document.createElement('td');
        telefonoCell.textContent = correctedPatient.telefono || '';
        telefonoCell.setAttribute('data-column', 'telefono');
        
        const obraSocialCell = document.createElement('td');
        obraSocialCell.textContent = correctedPatient.obraSocial || '';
        obraSocialCell.setAttribute('data-column', 'obraSocial');
        
        const fechaNacCell = document.createElement('td');
        fechaNacCell.textContent = correctedPatient.fechaNacimiento ? new Date(correctedPatient.fechaNacimiento).toLocaleDateString() : '';
        fechaNacCell.setAttribute('data-column', 'fechaNacimiento');
        
        const accionesCell = document.createElement('td');
        accionesCell.className = 'actions';
        accionesCell.setAttribute('data-column', 'acciones');
        accionesCell.innerHTML = `
          <div class="action-buttons">
            <button class="btn-action btn-view" data-id="${correctedPatient.id}"><i class="fas fa-eye"></i> Ver</button>
            <button class="btn-action btn-delete" data-id="${correctedPatient.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
          </div>`;
        
        // Agregar las celdas en el orden correcto según los headers de la tabla
        // 1. DNI, 2. N° Afiliado, 3. Apellido, 4. Nombre, 5. Particular, 6. Teléfono, 7. Obra Social, 8. Fecha Nac., 9. Acciones
        row.appendChild(dniCell);           // Columna 1: DNI
        row.appendChild(afiliadoCell);      // Columna 2: N° Afiliado
        row.appendChild(apellidoCell);      // Columna 3: Apellido 
        row.appendChild(nombreCell);        // Columna 4: Nombre 
        row.appendChild(particularCell);    // Columna 5: Particular (checkbox)
        row.appendChild(telefonoCell);      // Columna 6: Teléfono
        row.appendChild(obraSocialCell);    // Columna 7: Obra Social
        row.appendChild(fechaNacCell);      // Columna 8: Fecha Nac.
        row.appendChild(accionesCell);      // Columna 9: Acciones
        
        // Verificar que las celdas contengan los datos correctos
        console.log(`🔍 Verificación de celdas para paciente ${correctedPatient.id}:`);
        console.log(`  Celda Nombre (columna 3): "${nombreCell.textContent}"`);
        console.log(`  Celda Apellido (columna 4): "${apellidoCell.textContent}"`);
        
        patientsTableBody.appendChild(row);
        
        // Agregar evento de clic en toda la fila para abrir historia
        row.addEventListener('click', (e) => {
          // No abrir historia si se hace clic en los botones de acción
          if (e.target.closest('.action-buttons')) {
            return;
          }
          // Abrir historia del paciente
          window.location.href = `historia.html?id=${correctedPatient.id}`;
        });
      });

      // Verificación rápida de datos (solo en consola)
      setTimeout(() => {
        const rows = patientsTableBody.querySelectorAll('tr');
        console.log(`✅ Tabla cargada con ${rows.length} pacientes`);
      }, 100);

      patientsTableBody.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          const patient = allPatients.find(p => p.id == id);
          if (patient) {
            window.currentPatient = patient; // Guardar referencia global
            openPatientModal(patient);
          }
        });
      });

      patientsTableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
            try {
              const response = await fetch(`${CONFIG.API_BASE_URL}/api/Pacientes/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
              if (response.ok || response.status === 204) {
                showMessage(patientsMessage, 'Paciente eliminado correctamente', 'success');
                await loadPatients();
              } else {
                showMessage(patientsMessage, 'No se pudo eliminar el paciente', 'error');
              }
            } catch {
              showMessage(patientsMessage, 'Error de conexión al eliminar paciente', 'error');
            }
          }
        });
      });
    }

    function sortPatients(patients, column, direction) {
      return [...patients].sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];

        // Manejar valores nulos o undefined
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        // Convertir a string para comparación
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();

        // Comparar valores
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    function setupTableHeaders() {
      const table = document.getElementById('patientsTable');
      if (!table) return;

      const headers = table.querySelectorAll('th');
      headers.forEach((header, index) => {
        const columnMap = ['dni', 'numeroAfiliado', 'apellido', 'nombre', 'particular', 'telefono', 'obraSocial', 'fechaNacimiento'];
        const column = columnMap[index];
        
        if (column) {
          header.style.cursor = 'pointer';
          header.addEventListener('click', () => {
            if (sortColumn === column) {
              sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
              sortColumn = column;
              sortDirection = 'asc';
            }
            updatePatientsTable();
          });

          // Agregar indicador de ordenamiento
          const indicator = document.createElement('span');
          indicator.className = 'sort-indicator';
          indicator.innerHTML = ' <i class="fas fa-sort"></i>';
          header.appendChild(indicator);
        }
      });
    }

    function updateSortIndicators() {
      const table = document.getElementById('patientsTable');
      if (!table) return;

      const headers = table.querySelectorAll('th');
      const columnMap = ['dni', 'numeroAfiliado', 'apellido', 'nombre', 'particular', 'telefono', 'obraSocial', 'fechaNacimiento'];
      
      headers.forEach((header, index) => {
        const column = columnMap[index];
        const indicator = header.querySelector('.sort-indicator');
        
        if (indicator && column) {
          if (sortColumn === column) {
            indicator.innerHTML = sortDirection === 'asc' ? ' <i class="fas fa-sort-up"></i>' : ' <i class="fas fa-sort-down"></i>';
          } else {
            indicator.innerHTML = ' <i class="fas fa-sort-up"></i>';
          }
        }
      });
    }
  
    function filterPatients(query) {
      query = query.trim().toLowerCase();
      if (!query) return allPatients;
      return allPatients.filter(p =>
        (p.nombre && p.nombre.toLowerCase().includes(query)) ||
        (p.apellido && p.apellido.toLowerCase().includes(query)) ||
        (p.dni && String(p.dni).toLowerCase().includes(query)) ||
        (p.numeroAfiliado && String(p.numeroAfiliado).toLowerCase().includes(query)) ||
        (p.particular !== undefined && (p.particular ? 'si' : 'no').includes(query))
      );
    }
  
    function handlePatientSearch(e) {
      const searchTerm = e.target.value.toLowerCase().trim();
      filteredPatients = searchTerm ? filterPatients(searchTerm) : allPatients;
      currentPage = 1;
      updatePatientsTable();
    }
  
    function updatePatientsTable() {
      // Aplicar ordenamiento a todos los pacientes filtrados
      const sortedFilteredPatients = sortColumn ? sortPatients(filteredPatients, sortColumn, sortDirection) : filteredPatients;
      
      const total = sortedFilteredPatients.length;
      
      let patientsToShow;
      let totalPages;
      
      if (patientsPerPage === Infinity) {
        // Mostrar todos los pacientes
        patientsToShow = sortedFilteredPatients;
        totalPages = 1;
        currentPage = 1;
      } else {
        // Paginación normal
        totalPages = Math.ceil(total / patientsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        
        const start = (currentPage - 1) * patientsPerPage;
        const end = start + patientsPerPage;
        patientsToShow = sortedFilteredPatients.slice(start, end);
      }

      displayPatients(patientsToShow);
      updateSortIndicators();
      renderPaginationBar(currentPage, totalPages);

      // Actualizar el valor del selector
      if (patientsPerPageSelect) {
        if (patientsPerPage === Infinity) {
          patientsPerPageSelect.value = '*';
        } else {
          patientsPerPageSelect.value = patientsPerPage.toString();
        }
      }
    }
  
    function renderPaginationBar(current, total) {
      if (!paginationBar) return;
      paginationBar.innerHTML = '';
      
      // No mostrar paginación si se seleccionó "Todos" o si solo hay una página
      if (patientsPerPage === Infinity || total <= 1) return;
  
      const ul = document.createElement('ul');
      ul.className = 'pagination';
  
      const prevLi = document.createElement('li');
      prevLi.innerHTML = `<button ${current === 1 ? 'disabled' : ''} aria-label="Anterior" class="arrow">&lt;</button>`;
      prevLi.querySelector('button').onclick = () => { if (current > 1) { currentPage--; updatePatientsTable(); } };
      ul.appendChild(prevLi);
  
      let startPage = Math.max(1, current - 3);
      let endPage = Math.min(total, current + 3);
      if (current <= 4) endPage = Math.min(7, total);
      if (current > total - 4) startPage = Math.max(1, total - 6);
  
      for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<button class="${i === current ? 'active' : ''}">${i}</button>`;
        li.querySelector('button').onclick = () => { currentPage = i; updatePatientsTable(); };
        ul.appendChild(li);
      }
  
      const nextLi = document.createElement('li');
      nextLi.innerHTML = `<button ${current === total ? 'disabled' : ''} aria-label="Siguiente" class="arrow">&gt;</button>`;
      nextLi.querySelector('button').onclick = () => { if (current < total) { currentPage++; updatePatientsTable(); } };
      ul.appendChild(nextLi);
  
      paginationBar.appendChild(ul);
    }
  
    // ======================
    //  Panel Lateral Paciente
    // ======================
    function openPatientSidebar(patient) {
      if (!patientSidebar || !sidebarContent) return;
  
      renderSidebarDisplayView(patient);
      patientSidebar.classList.remove('hidden');
      patientSidebar.classList.add('show');
      mainContent.classList.add('sidebar-open');
      
      // Agregar overlay en móviles
      if (window.innerWidth <= 768) {
        addSidebarOverlay();
      }
    }
    
    function closePatientSidebar() {
      if (!patientSidebar) return;
      
      patientSidebar.classList.remove('show');
      patientSidebar.classList.add('hidden');
      mainContent.classList.remove('sidebar-open');
      
      // Remover overlay
      removeSidebarOverlay();
    }
    
    function addSidebarOverlay() {
      let overlay = document.querySelector('.sidebar-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', closePatientSidebar);
        document.body.appendChild(overlay);
      }
      overlay.classList.add('show');
    }
    
    function removeSidebarOverlay() {
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        }, 300);
      }
    }
  
    function renderSidebarDisplayView(patient) {
      sidebarContent.innerHTML = `
        <!-- Botones de acción -->
        <div style="margin-bottom: 20px; display: flex; gap: 10px;">
          <button onclick="window.location.href='historia.html?id=${patient.id}'" class="btn btn-primary" style="flex: 1; padding: 12px; font-size: 1.1em; font-weight: 600;">
            <i class="fas fa-file-medical"></i> Historia Clínica
          </button>
          <button onclick="deletePatientFromSidebar(${patient.id})" class="btn btn-danger" style="padding: 12px; font-size: 1.1em; font-weight: 600;">
            <i class="fas fa-trash"></i>
          </button>
        </div>

        <!-- Formulario de datos del paciente -->
        <form id="patientEditForm" class="patient-edit-form">
          <!-- Información Personal -->
          <div class="patient-data-section">
            <h4><i class="fas fa-info-circle"></i> Información Personal</h4>
            <div class="patient-data-section-content">
              <div class="form-field-group">
                <label for="edit-nombre">Nombre:</label>
                <input type="text" id="edit-nombre" name="nombre" value="${patient.nombre || ''}" placeholder="Ingrese el nombre">
              </div>
              <div class="form-field-group">
                <label for="edit-apellido">Apellido:</label>
                <input type="text" id="edit-apellido" name="apellido" value="${patient.apellido || ''}" placeholder="Ingrese el apellido">
              </div>
              <div class="form-field-group">
                <label for="edit-dni">DNI:</label>
                <input type="text" id="edit-dni" name="dni" value="${patient.dni || ''}" placeholder="Ingrese el DNI">
              </div>
              <div class="form-field-group">
                <label for="edit-fechaNacimiento">Fecha de Nacimiento:</label>
                <input type="date" id="edit-fechaNacimiento" name="fechaNacimiento" value="${patient.fechaNacimiento ? patient.fechaNacimiento.split('T')[0] : ''}">
              </div>
              <div class="form-field-group">
                <label for="edit-peso">Peso (kg):</label>
                <input type="number" id="edit-peso" name="peso" value="${patient.peso || ''}" placeholder="Ingrese el peso" step="0.1">
              </div>
              <div class="form-field-group">
                <label for="edit-altura">Altura (cm):</label>
                <input type="number" id="edit-altura" name="altura" value="${patient.altura || ''}" placeholder="Ingrese la altura">
              </div>
              <div class="form-field-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="edit-particular" name="particular" ${patient.particular ? 'checked' : ''}>
                  <span class="checkmark"></span>
                  Paciente Particular
                </label>
              </div>
            </div>
          </div>

          <!-- Afiliación -->
          <div class="patient-data-section">
            <h4><i class="fas fa-id-card"></i> Afiliación</h4>
            <div class="patient-data-section-content">
              <div class="form-field-group">
                <label for="edit-numeroAfiliado">N° de Afiliado:</label>
                <input type="text" id="edit-numeroAfiliado" name="numeroAfiliado" value="${patient.numeroAfiliado || ''}" placeholder="Ingrese el número de afiliado">
              </div>
              <div class="form-field-group">
                <label for="edit-obraSocial">Obra Social:</label>
                <input type="text" id="edit-obraSocial" name="obraSocial" value="${patient.obraSocial || ''}" placeholder="Ingrese la obra social">
              </div>
            </div>
          </div>

          <!-- Contacto -->
          <div class="patient-data-section">
            <h4><i class="fas fa-envelope"></i> Contacto</h4>
            <div class="patient-data-section-content">
              <div class="form-field-group">
                <label for="edit-email">Email:</label>
                <input type="email" id="edit-email" name="email" value="${patient.email || ''}" placeholder="Ingrese el email">
              </div>
              <div class="form-field-group">
                <label for="edit-telefono">Teléfono:</label>
                <input type="tel" id="edit-telefono" name="telefono" value="${patient.telefono || ''}" placeholder="Ingrese el teléfono">
              </div>
            </div>
          </div>

          <!-- Datos Médicos -->
          <div class="patient-data-section">
            <h4><i class="fas fa-file-medical-alt"></i> Datos Médicos</h4>
            <div class="patient-data-section-content">
              <div class="form-field-group">
                <label for="edit-antecedentes">Antecedentes:</label>
                <textarea id="edit-antecedentes" name="antecedentes" rows="3" placeholder="Ingrese los antecedentes médicos">${patient.antecedentes || ''}</textarea>
              </div>
              <div class="form-field-group">
                <label for="edit-medicacion">Medicación:</label>
                <textarea id="edit-medicacion" name="medicacion" rows="3" placeholder="Ingrese la medicación actual">${patient.medicacion || ''}</textarea>
              </div>
            </div>
          </div>

          <!-- Botones de guardar -->
          <div class="form-actions">
            <button type="submit" class="btn btn-success">
              <i class="fas fa-save"></i> Guardar Cambios
            </button>
            <button type="button" class="btn btn-secondary" onclick="closePatientSidebar()">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </form>
      `;

      // Configurar el formulario
      setupPatientEditForm(patient.id);
    }

    function setupPatientEditForm(patientId) {
      const form = document.getElementById('patientEditForm');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const updatedData = {};
        
        // Procesar todos los campos del formulario
        formData.forEach((value, key) => {
          if (value !== null && value !== undefined && value !== '') {
            updatedData[key] = value;
          } else {
            // Para campos opcionales, enviar string vacío en lugar de null
            if (['email', 'telefono', 'obraSocial', 'antecedentes', 'medicacion', 'peso', 'altura'].includes(key)) {
              updatedData[key] = '';
            }
          }
        });
        
        // Manejar específicamente el checkbox "particular"
        const particularCheckbox = form.querySelector('input[name="particular"]');
        if (particularCheckbox) {
          updatedData.particular = particularCheckbox.checked;
        } else {
          updatedData.particular = false;
        }
        
        // Asegurar que los campos requeridos estén presentes
        if (!updatedData.nombre) updatedData.nombre = '';
        if (!updatedData.apellido) updatedData.apellido = '';
        if (!updatedData.dni) updatedData.dni = '';
        if (!updatedData.numeroAfiliado) updatedData.numeroAfiliado = '';
        if (!updatedData.fechaNacimiento) updatedData.fechaNacimiento = '';
        if (!updatedData.email) updatedData.email = '';
        if (!updatedData.telefono) updatedData.telefono = '';
        if (!updatedData.obraSocial) updatedData.obraSocial = '';
        if (!updatedData.antecedentes) updatedData.antecedentes = '';
        if (!updatedData.medicacion) updatedData.medicacion = '';
        
        // Convertir campos numéricos
        if (updatedData.peso && updatedData.peso !== '') {
          updatedData.peso = parseFloat(updatedData.peso);
        } else {
          updatedData.peso = null;
        }
        
        if (updatedData.altura && updatedData.altura !== '') {
          updatedData.altura = parseInt(updatedData.altura);
        } else {
          updatedData.altura = null;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        try {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
          
          const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes/${patientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(updatedData)
          });
          
          if (response.ok) {
            showNotification('Paciente actualizado correctamente', 'success');
            
            // Actualizar la lista de pacientes
            if (allPatients.length > 0) {
              await loadPatients();
            }
            
            // Cerrar el sidebar después de un breve delay
            setTimeout(() => {
              closePatientSidebar();
            }, 1500);
          } else {
            const errorText = await response.text();
            showNotification(`Error al actualizar: ${errorText}`, 'error');
          }
        } catch (error) {
          showNotification(`Error de conexión: ${error.message}`, 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      });
    }
  
    function renderPatientDetails(patient) {
      modalBody.innerHTML = `
        <div class="patient-details">
          <div class="detail-card">
            <h4><i class="fas fa-info-circle"></i> Información Personal</h4>
            <div class="detail-row">
              <span class="detail-label">Nombre:</span>
              <span class="detail-value">${patient.nombre || 'No especificado'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Apellido:</span>
              <span class="detail-value">${patient.apellido || 'No especificado'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">DNI:</span>
              <span class="detail-value">${patient.dni || 'No especificado'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha Nacimiento:</span>
              <span class="detail-value">${patient.fechaNacimiento ? new Date(patient.fechaNacimiento).toLocaleDateString('es-ES') : 'No especificado'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Peso:</span>
              <span class="detail-value">${patient.peso ? `${patient.peso} kg` : 'No especificado'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Altura:</span>
              <span class="detail-value">${patient.altura ? `${patient.altura} cm` : 'No especificado'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Paciente Particular:</span>
              <span class="detail-value">
                <i class="fas ${patient.particular ? 'fa-check text-success' : 'fa-times text-danger'}"></i>
                ${patient.particular ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
          
          <div class="detail-card">
            <h4><i class="fas fa-id-card"></i> Afiliación</h4>
            <div class="detail-row">
              <span class="detail-label">N° Afiliado:</span>
              <span class="detail-value">${patient.numeroAfiliado || 'No especificado'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Obra Social:</span>
              <span class="detail-value">${patient.obraSocial || 'No especificado'}</span>
            </div>
          </div>
          
          <div class="detail-card">
            <h4><i class="fas fa-envelope"></i> Contacto</h4>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${patient.email || 'No especificado'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Teléfono:</span>
              <span class="detail-value">${patient.telefono || 'No especificado'}</span>
            </div>
          </div>
          
          <div class="detail-card">
            <h4><i class="fas fa-file-medical-alt"></i> Datos Médicos</h4>
            <div class="detail-row">
              <span class="detail-label">Antecedentes:</span>
              <span class="detail-value">${patient.antecedentes || 'No especificado'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Medicación:</span>
              <span class="detail-value">${patient.medicacion || 'No especificado'}</span>
            </div>
          </div>
        </div>`;

      const modalHeader = patientDetailsModal.querySelector('.modal-header');
      const modalActions = modalHeader.querySelector('.modal-actions');
      if (modalActions) {
        modalActions.innerHTML = '';
        
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
        editBtn.className = 'btn btn-action btn-primary';
        editBtn.onclick = () => {
          renderEditView(patient);
        };
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i> Cerrar';
        closeBtn.className = 'btn btn-action btn-secondary';
        closeBtn.onclick = () => closePatientModal();
        
        modalActions.appendChild(editBtn);
        modalActions.appendChild(closeBtn);
      }
    }

    function renderEditView(patient) {
  
      const modalHeader = patientDetailsModal.querySelector('.modal-header');
      const modalActions = modalHeader.querySelector('.modal-actions');
      modalActions.innerHTML = '';

      // Mejorar la funcionalidad del checkbox en el modal
      const modalCheckboxContainer = modalBody.querySelector('.checkbox-container');
      const modalCustomCheckbox = modalBody.querySelector('.custom-checkbox');
      
      if (modalCheckboxContainer && modalCustomCheckbox) {
        // Permitir hacer clic en toda el área del contenedor
        modalCheckboxContainer.addEventListener('click', function(e) {
          if (e.target !== modalCustomCheckbox) {
            modalCustomCheckbox.checked = !modalCustomCheckbox.checked;
            // Disparar evento change para que se actualice el estado visual
            modalCustomCheckbox.dispatchEvent(new Event('change'));
          }
        });

        // Actualizar el estado visual cuando cambie el checkbox
        modalCustomCheckbox.addEventListener('change', function() {
          if (this.checked) {
            modalCheckboxContainer.classList.add('checked');
          } else {
            modalCheckboxContainer.classList.remove('checked');
          }
        });
      }
  
      const saveBtn = document.createElement('button');
      saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
      saveBtn.className = 'btn btn-action btn-success';
      saveBtn.onclick = () => handleUpdatePatient(patient.id);
  
      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
      cancelBtn.className = 'btn btn-action btn-danger';
      cancelBtn.onclick = () => openPatientModal(patient);
  
      modalActions.appendChild(saveBtn);
      modalActions.appendChild(cancelBtn);
    }
  
    async function handleUpdatePatient(patientId) {
      const form = document.getElementById('editPatientForm');
      if (!form) {
        console.error('No se encontró el formulario editPatientForm');
        return;
      }
  
      const formData = new FormData(form);
      const updatedData = {};
      
      // Procesar todos los campos del formulario
      formData.forEach((value, key) => {
        if (value !== null && value !== undefined && value !== '') {
          updatedData[key] = value;
        } else {
          // Para campos opcionales, enviar string vacío en lugar de null
          if (['email', 'telefono', 'obraSocial', 'antecedentes', 'medicacion'].includes(key)) {
            updatedData[key] = '';
          }
        }
      });
      
      // Manejar específicamente el checkbox "particular"
      const particularCheckbox = form.querySelector('input[name="particular"]');
      if (particularCheckbox) {
        updatedData.particular = particularCheckbox.checked;
      } else {
        updatedData.particular = false;
      }
      
      // Asegurar que los campos requeridos estén presentes
      if (!updatedData.nombre) updatedData.nombre = '';
      if (!updatedData.apellido) updatedData.apellido = '';
      if (!updatedData.dni) updatedData.dni = '';
      if (!updatedData.numeroAfiliado) updatedData.numeroAfiliado = '';
      if (!updatedData.fechaNacimiento) updatedData.fechaNacimiento = '';
      if (!updatedData.email) updatedData.email = '';
      if (!updatedData.telefono) updatedData.telefono = '';
      if (!updatedData.obraSocial) updatedData.obraSocial = '';
      if (!updatedData.antecedentes) updatedData.antecedentes = '';
      if (!updatedData.medicacion) updatedData.medicacion = '';
      
      // Convertir campos numéricos
      if (updatedData.peso && updatedData.peso !== '') {
        updatedData.peso = parseFloat(updatedData.peso);
      } else {
        updatedData.peso = null;
      }
      if (updatedData.altura && updatedData.altura !== '') {
        updatedData.altura = parseInt(updatedData.altura);
      } else {
        updatedData.altura = null;
      }
      
      // Asegurar que particular sea boolean
      updatedData.particular = Boolean(updatedData.particular);
      
      // Validación mínima
      if (!updatedData.nombre || !updatedData.apellido || !updatedData.dni) {
        showNotification('Por favor complete los campos obligatorios (Nombre, Apellido, DNI).', 'error');
        return;
      }
      
      updatedData.id = patientId;
      
      // Debug: Mostrar los datos que se van a enviar
      console.log('📤 Datos del paciente a actualizar:', updatedData);
  
            try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes/${patientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(updatedData)
        });

        if (response.ok) {
          showNotification('Paciente actualizado con éxito.', 'success');
          await loadPatients();
          const p = allPatients.find(x => x.id === patientId);
          setTimeout(() => (p ? openPatientModal(p) : closePatientModal()), 1000);
        } else {
          const errorText = await response.text();
          console.error('❌ Error del servidor:', errorText);
          
          // Intentar parsear el error como JSON para mostrar información más útil
          try {
            const errorData = JSON.parse(errorText);
            let errorMessage = 'No se pudo actualizar el paciente.';
            
            if (errorData.errors) {
              const errorList = Object.entries(errorData.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ');
              errorMessage += ` Errores: ${errorList}`;
            } else if (errorData.title) {
              errorMessage += ` ${errorData.title}`;
            }
            
            showNotification(errorMessage, 'error');
          } catch (parseError) {
            // Si no se puede parsear como JSON, mostrar el texto completo
            showNotification(`No se pudo actualizar el paciente. ${errorText}`, 'error');
          }
        }
      } catch (error) {
        showNotification(`Error de conexión: ${error.message}`, 'error');
      }
    }
  
    function closePatientModal() {
      patientDetailsModal?.classList.add('hidden');
      if (modalBody) modalBody.innerHTML = '';
    }

    function openPatientModal(patient) {
      if (!patientDetailsModal || !modalBody) return;
      
      renderPatientDetails(patient);
      patientDetailsModal.classList.remove('hidden');
    }
  
    // Exponer algunas funciones si las usas en HTML
    window.editPatient = function (id) { window.location.href = `historia.html?id=${id}`; };
  
    // Mostrar/ocultar contraseña en login
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    if (passwordInput && togglePassword && eyeIcon) {
      togglePassword.addEventListener('click', function () {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
      });
    }
  
    // ======================
    //  AGREGAR PACIENTE (agregar.html)
    // ======================
    const addPatientForm = document.getElementById('addPatientForm');
    const addPatientMessage = document.getElementById('addPatientMessage');
    
    // Configurar funcionalidad del checkbox en agregar paciente
    if (addPatientForm) {
        const checkboxContainer = addPatientForm.querySelector('.checkbox-container');
        const customCheckbox = addPatientForm.querySelector('.custom-checkbox');
        
        if (checkboxContainer && customCheckbox) {
            // Permitir hacer clic en toda el área del contenedor
            checkboxContainer.addEventListener('click', function(e) {
                if (e.target !== customCheckbox) {
                    customCheckbox.checked = !customCheckbox.checked;
                    // Disparar evento change para que se actualice el estado visual
                    customCheckbox.dispatchEvent(new Event('change'));
                }
            });

            // Actualizar el estado visual cuando cambie el checkbox
            customCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxContainer.classList.add('checked');
                } else {
                    checkboxContainer.classList.remove('checked');
                }
            });
        }
      addPatientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (addPatientMessage) {
          addPatientMessage.textContent = '';
          addPatientMessage.className = 'message';
        }
        const formData = new FormData(addPatientForm);
        const patientData = {};
        
        // Procesar todos los campos del formulario
        formData.forEach((value, key) => {
          if (value !== null && value !== undefined && value !== '') {
            patientData[key] = value;
          }
        });
        
        // Manejar específicamente el checkbox "particular"
        const particularCheckbox = addPatientForm.querySelector('input[name="particular"]');
        if (particularCheckbox) {
          patientData.particular = particularCheckbox.checked;
        } else {
          patientData.particular = false; // Valor por defecto
        }
        
        // Asegurar que todos los campos requeridos estén presentes
        if (!patientData.nombre) patientData.nombre = '';
        if (!patientData.apellido) patientData.apellido = '';
        if (!patientData.dni) patientData.dni = '';
        if (!patientData.numeroAfiliado) patientData.numeroAfiliado = '';
        if (!patientData.fechaNacimiento) patientData.fechaNacimiento = '';
        if (!patientData.email) patientData.email = '';
        if (!patientData.telefono) patientData.telefono = '';
        if (!patientData.obraSocial) patientData.obraSocial = '';
        if (!patientData.peso) patientData.peso = null;
        if (!patientData.altura) patientData.altura = null;
        if (!patientData.antecedentes) patientData.antecedentes = '';
        if (!patientData.medicacion) patientData.medicacion = '';
        
        // Convertir campos numéricos
        if (patientData.peso && patientData.peso !== '') {
          patientData.peso = parseFloat(patientData.peso);
        }
        if (patientData.altura && patientData.altura !== '') {
          patientData.altura = parseInt(patientData.altura);
        }
        
        // Asegurar que particular sea boolean
        patientData.particular = Boolean(patientData.particular);
        // Validación mínima
        if (!patientData.nombre || !patientData.apellido || !patientData.dni) {
          showMessage(addPatientMessage, 'Por favor complete los campos obligatorios.', 'error');
          return;
        }
        
        // Debug: Mostrar los datos que se van a enviar
        console.log('📤 Datos del paciente a enviar:', patientData);
        console.log('📋 Campo particular:', patientData.particular, 'tipo:', typeof patientData.particular);
        
        // Verificar que el checkbox esté funcionando correctamente
        console.log('🔍 Checkbox particular:', particularCheckbox?.checked, 'tipo:', typeof particularCheckbox?.checked);
        
        const btn = addPatientForm.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        try {
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
          const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(patientData)
          });
          if (response.ok) {
            showMessage(addPatientMessage, 'Paciente registrado exitosamente.', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1200);
          } else {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            
            // Intentar parsear el error como JSON para mostrar información más útil
            try {
              const errorData = JSON.parse(errorText);
              let errorMessage = 'No se pudo registrar el paciente.';
              
              if (errorData.errors) {
                const errorList = Object.entries(errorData.errors)
                  .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                  .join('; ');
                errorMessage += ` Errores: ${errorList}`;
              } else if (errorData.title) {
                errorMessage += ` ${errorData.title}`;
              }
              
              showMessage(addPatientMessage, errorMessage, 'error');
            } catch (parseError) {
              // Si no se puede parsear como JSON, mostrar el texto completo
              showMessage(addPatientMessage, `No se pudo registrar el paciente. ${errorText}`, 'error');
            }
          }
        } catch (err) {
          showMessage(addPatientMessage, 'Error de conexión al registrar paciente.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = original;
        }
      });
    }
  
    // ======================
    //  RESET PASSWORD FUNCTIONALITY
    // ======================
    
    // Event listeners para botones de navegación entre formularios
    if (switchToLoginFromResetBtn) {
      switchToLoginFromResetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginFormHard();
        history.replaceState(null, '', location.pathname + '#login');
      });
    }

    if (switchToLoginFromNewPasswordBtn) {
      switchToLoginFromNewPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginFormHard();
        history.replaceState(null, '', location.pathname + '#login');
      });
    }

    // Actualizar funciones para incluir los nuevos formularios
    function showLoginFormHard() {
      loginForm?.classList.remove('hidden');
      userForm?.classList.add('hidden');
      resetPasswordForm?.classList.add('hidden');
      newPasswordForm?.classList.add('hidden');
      clearMessages();
    }

    // Manejar solicitud de reset de contraseña
    if (resetPasswordFormElement) {
      resetPasswordFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(resetPasswordFormElement);
        const username = formData.get('resetUsername');

        if (!username) {
          showMessage(resetPasswordMessage, 'Por favor ingrese el nombre de usuario', 'error');
          return;
        }

        const btn = resetPasswordFormElement.querySelector('button[type="submit"]');
        const original = btn.innerHTML;

        try {
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

          const resp = await fetch(`${CONFIG.API_BASE_URL}/api/usuarios/solicitar-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ NombreUsuario: username })
          });

          if (resp.ok) {
            const data = await resp.json();
            showMessage(resetPasswordMessage, `Código de verificación enviado exitosamente. Revisa tu email: ${data.email}.`, 'success');
            
            // Guardar username para el siguiente paso
            localStorage.setItem('resetUsername', username);
            
            // Cambiar al formulario de nueva contraseña después de 3 segundos
            setTimeout(() => {
              showNewPasswordFormHard();
              history.replaceState(null, '', location.pathname + '#newpassword');
            }, 3000);
          } else {
            const errorText = await resp.text();
            showMessage(resetPasswordMessage, errorText || 'Error al solicitar reset de contraseña', 'error');
          }
        } catch (err) {
          showMessage(resetPasswordMessage, 'Error de conexión. Intente nuevamente.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = original;
        }
      });
    }

    // ======================
    //  FUNCIONES DE EDICIÓN DE CAMPOS INDIVIDUALES
    // ======================
    
    // Función global para editar campos del paciente
    window.editPatientField = function(fieldName, currentValue) {
      const fieldElement = document.querySelector(`[onclick*="editPatientField('${fieldName}"]`);
      if (!fieldElement) return;

      let inputType = 'text';
      let inputValue = currentValue;

      // Determinar el tipo de input según el campo
      switch (fieldName) {
        case 'fechaNacimiento':
          inputType = 'date';
          break;
        case 'peso':
        case 'altura':
          inputType = 'number';
          break;
        case 'particular':
          inputType = 'checkbox';
          inputValue = currentValue === 'true';
          break;
        case 'antecedentes':
        case 'medicacion':
          inputType = 'textarea';
          break;
      }

      // Crear el elemento de entrada
      let inputElement;
      if (inputType === 'textarea') {
        inputElement = document.createElement('textarea');
        inputElement.rows = 3;
        inputElement.style.width = '100%';
        inputElement.style.minHeight = '60px';
      } else if (inputType === 'checkbox') {
        inputElement = document.createElement('input');
        inputElement.type = 'checkbox';
        inputElement.checked = inputValue;
      } else {
        inputElement = document.createElement('input');
        inputElement.type = inputType;
        inputElement.value = inputValue;
      }

      // Aplicar estilos
      inputElement.className = 'inline-edit-input';
      inputElement.style.padding = '8px 12px';
      inputElement.style.border = '2px solid #667eea';
      inputElement.style.borderRadius = '8px';
      inputElement.style.fontSize = '14px';
      inputElement.style.width = '200px';

      // Reemplazar el contenido del campo
      const originalContent = fieldElement.innerHTML;
      fieldElement.innerHTML = '';
      fieldElement.appendChild(inputElement);

      // Agregar botones de guardar/cancelar
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'edit-buttons';
      buttonContainer.style.marginTop = '8px';
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '8px';

      const saveBtn = document.createElement('button');
      saveBtn.innerHTML = '<i class="fas fa-check"></i> Guardar';
      saveBtn.className = 'btn btn-success btn-sm';
      saveBtn.style.padding = '6px 12px';
      saveBtn.style.fontSize = '12px';

      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
      cancelBtn.className = 'btn btn-secondary btn-sm';
      cancelBtn.style.padding = '6px 12px';
      cancelBtn.style.fontSize = '12px';

      buttonContainer.appendChild(saveBtn);
      buttonContainer.appendChild(cancelBtn);
      fieldElement.appendChild(buttonContainer);

      // Enfocar el input
      inputElement.focus();

      // Eventos
      saveBtn.onclick = () => savePatientField(fieldName, inputElement, originalContent);
      cancelBtn.onclick = () => cancelEdit(fieldElement, originalContent);

      // Guardar con Enter
      inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && inputType !== 'textarea') {
          e.preventDefault();
          savePatientField(fieldName, inputElement, originalContent);
        }
        if (e.key === 'Escape') {
          cancelEdit(fieldElement, originalContent);
        }
      });
    };

    async function savePatientField(fieldName, inputElement, originalContent) {
      // Obtener el paciente actual del sidebar
      const currentPatient = window.currentPatient;
      if (!currentPatient) {
        showNotification('Error: No se encontró el paciente actual', 'error');
        return;
      }

      let newValue;
      if (inputElement.type === 'checkbox') {
        newValue = inputElement.checked;
      } else if (inputElement.tagName === 'TEXTAREA') {
        newValue = inputElement.value;
      } else {
        newValue = inputElement.value;
      }

      try {
        // Actualizar solo el campo específico
        currentPatient[fieldName] = newValue;

        // Enviar actualización
        const updateResponse = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes/${currentPatient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(currentPatient)
        });

        if (updateResponse.ok) {
          // Actualizar la visualización
          const fieldElement = document.querySelector(`[onclick*="editPatientField('${fieldName}"]`);
          if (fieldElement) {
            let displayValue = newValue;
            
            // Formatear el valor para mostrar
            if (fieldName === 'fechaNacimiento' && newValue) {
              displayValue = new Date(newValue).toLocaleDateString();
            } else if (fieldName === 'particular') {
              displayValue = newValue ? 'Sí' : 'No';
            } else if (!newValue || newValue === '') {
              const defaultValues = {
                'nombre': 'No registrado',
                'apellido': 'No registrado',
                'dni': 'No registrado',
                'fechaNacimiento': 'No registrada',
                'peso': 'No registrado',
                'altura': 'No registrada',
                'numeroAfiliado': 'No registrado',
                'obraSocial': 'No registrada',
                'email': 'No registrado',
                'telefono': 'No registrado',
                'antecedentes': 'No registrados',
                'medicacion': 'No registrada'
              };
              displayValue = defaultValues[fieldName] || 'No registrado';
            }

            fieldElement.innerHTML = displayValue;
            
            // Actualizar la clase CSS
            if (!newValue || newValue === '') {
              fieldElement.classList.add('empty');
            } else {
              fieldElement.classList.remove('empty');
            }
          }

          showNotification(`Campo ${fieldName} actualizado correctamente`, 'success');
          
          // Actualizar la lista de pacientes si está visible
          if (allPatients.length > 0) {
            await loadPatients();
          }
        } else {
          const errorText = await updateResponse.text();
          showNotification(`Error al actualizar: ${errorText}`, 'error');
          cancelEdit(inputElement.parentElement, originalContent);
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
        cancelEdit(inputElement.parentElement, originalContent);
      }
    }

    function cancelEdit(fieldElement, originalContent) {
      fieldElement.innerHTML = originalContent;
    }

    // Función global para eliminar paciente desde el sidebar
    window.deletePatientFromSidebar = async function(patientId) {
      if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
        try {
          const response = await fetch(`${CONFIG.API_BASE_URL}/api/Pacientes/${patientId}`, { 
            method: 'DELETE', 
            headers: getAuthHeaders() 
          });
          
          if (response.ok || response.status === 204) {
            showNotification('Paciente eliminado correctamente', 'success');
            closePatientSidebar();
            await loadPatients();
          } else {
            showNotification('No se pudo eliminar el paciente', 'error');
          }
        } catch {
          showNotification('Error de conexión al eliminar paciente', 'error');
        }
      }
    };

    function showNotification(message, type = 'info') {
      // Crear notificación temporal
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `;
      
      if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      } else {
        notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }
      
      notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
      `;
      
      document.body.appendChild(notification);
      
      // Mostrar con animación
      setTimeout(() => notification.style.transform = 'translateX(0)', 100);
      
      // Remover después de 3 segundos
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    // Manejar cambio de contraseña
    if (newPasswordFormElement) {
      newPasswordFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(newPasswordFormElement);
        const verificationCode = formData.get('verificationCode');
        const newPassword = formData.get('newPassword');
        const confirmNewPassword = formData.get('confirmNewPassword');
        const username = localStorage.getItem('resetUsername');

        if (!verificationCode || !newPassword || !confirmNewPassword) {
          showMessage(newPasswordMessage, 'Por favor complete todos los campos', 'error');
          return;
        }

        if (newPassword.length < 6) {
          showMessage(newPasswordMessage, 'La nueva contraseña debe tener al menos 6 caracteres', 'error');
          return;
        }

        if (newPassword !== confirmNewPassword) {
          showMessage(newPasswordMessage, 'Las contraseñas no coinciden', 'error');
          return;
        }

        if (!username) {
          showMessage(newPasswordMessage, 'Error: No se encontró el nombre de usuario. Vuelva a solicitar el reset.', 'error');
          return;
        }

        const btn = newPasswordFormElement.querySelector('button[type="submit"]');
        const original = btn.innerHTML;

        try {
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cambiando...';

          const resp = await fetch(`${CONFIG.API_BASE_URL}/api/usuarios/cambiar-contrasena`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              NombreUsuario: username,
              CodigoVerificacion: verificationCode,
              NuevaContrasena: newPassword 
            })
          });

          if (resp.ok) {
            const data = await resp.json();
            showMessage(newPasswordMessage, data.message, 'success');
            
            // Limpiar datos temporales
            localStorage.removeItem('resetUsername');
            
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
              showLoginFormHard();
              history.replaceState(null, '', location.pathname + '#login');
              showMessage(loginMessage, 'Contraseña cambiada exitosamente. Puedes iniciar sesión con tu nueva contraseña.', 'success');
            }, 3000);
          } else {
            const errorText = await resp.text();
            showMessage(newPasswordMessage, errorText || 'Error al cambiar contraseña', 'error');
          }
        } catch (err) {
          showMessage(newPasswordMessage, 'Error de conexión. Intente nuevamente.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = original;
        }
      });
    }

    // Estado inicial en login.html con soporte para reset
    if (document.body && document.getElementById('loginForm') && document.getElementById('userForm')) {
      if (location.hash === '#register') showUserFormHard();
      else if (location.hash === '#reset') showResetPasswordFormHard();
      else if (location.hash === '#newpassword') showNewPasswordFormHard();
      else showLoginFormHard();
    }

    // Fin DOMContentLoaded
  });
  