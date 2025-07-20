// Asegurar que CONFIG esté disponible solo si no existe
if (typeof CONFIG === 'undefined') {
    var CONFIG = { API_BASE_URL: window.location.origin };
}

// Configuración de la API
// API_BASE_URL: Apunta a tu backend. Cámbialo si tu backend corre en un puerto diferente.
// const API_BASE_URL = 'https://localhost:7229';

// Estado de la aplicación
let isLoggedIn = false;
let allPatients = []; // Array para almacenar todos los pacientes

// Variables globales para paginación
let currentPage = 1;
let patientsPerPage = 10;
let filteredPatients = [];

// Inicialización segura
window.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const switchToRegisterBtn = document.getElementById('switchToRegisterBtn');
    const switchToLoginBtn = document.getElementById('switchToLoginBtn');
    const backToListBtn = document.getElementById('backToListBtn');
    const showRegisterBtn = document.getElementById('showRegister'); // Nuevo elemento para el botón de registro
    
    const userInfo = document.getElementById('user-info');
    const userGreeting = document.getElementById('userGreeting');
    const userName = document.getElementById('userName');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtnNav = document.getElementById('logoutBtnNav');
    const newPatientBtnNav = document.getElementById('newPatientBtnNav');
    
    const loginForm = document.getElementById('loginForm');
    const userForm = document.getElementById('userForm');
    const patientForm = document.getElementById('patientForm');
    const patientsList = document.getElementById('patientsList');
    const loginFormElement = document.getElementById('loginFormElement');
    const userFormElement = document.getElementById('userFormElement');
    const patientFormElement = document.getElementById('patientFormElement');
    const loginMessage = document.getElementById('loginMessage');
    const userMessage = document.getElementById('userMessage');
    const patientMessage = document.getElementById('patientMessage');
    const patientsMessage = document.getElementById('patientsMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnList = document.getElementById('logoutBtnList');
    const newPatientBtn = document.getElementById('newPatientBtn');
    const addFirstPatientBtn = document.getElementById('addFirstPatientBtn');
    const searchPatient = document.getElementById('searchPatient');
    const patientsTableBody = document.getElementById('patientsTableBody');
    const loadingPatients = document.getElementById('loadingPatients');
    const noPatients = document.getElementById('noPatients');
    const patientDetailsModal = document.getElementById('patient-details-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Soporte para agregar.html
    const addPatientForm = document.getElementById('addPatientForm');
    const addPatientMessage = document.getElementById('addPatientMessage');

    // Navegación entre formularios de login/registro
    if (switchToRegisterBtn) {
        switchToRegisterBtn.addEventListener('click', () => showUserForm());
    }
    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', () => showLoginForm());
    }
    if (backToListBtn) {
        backToListBtn.addEventListener('click', () => showPatientsList());
    }
    // Nuevo event listener para el botón "Regístrate aquí" en login.html
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showUserForm();
        });
    }

    // Formularios
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(loginFormElement);
            const username = formData.get('username');
            const password = formData.get('password');
            if (!username || !password) {
                if (loginMessage) {
                    loginMessage.textContent = 'Por favor complete todos los campos';
                    loginMessage.className = 'message error';
                }
                return;
            }
            const submitBtn = loginFormElement.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/usuarios/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombreUsuario: username, contrasenaHash: password })
                });
                if (response.ok) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', username);
                    if (loginMessage) {
                        loginMessage.textContent = '¡Login exitoso! Redirigiendo...';
                        loginMessage.className = 'message success';
                    }
                    setTimeout(() => { window.location.replace('index.html'); }, 500);
                } else {
                    if (loginMessage) {
                        loginMessage.textContent = 'Usuario o contraseña incorrectos. Por favor, verifica tus datos.';
                        loginMessage.className = 'message error';
                        loginMessage.style.display = 'block';
                    }
                }
            } catch (error) {
                if (loginMessage) {
                    loginMessage.textContent = 'Error de conexión. Intente nuevamente.';
                    loginMessage.className = 'message error';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    if (userFormElement) {
        userFormElement.addEventListener('submit', handleUserRegistration);
    }
    if (patientFormElement) {
        patientFormElement.addEventListener('submit', handlePatientRegistration);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (logoutBtnList) {
        logoutBtnList.addEventListener('click', handleLogout);
    }
    if (logoutBtnNav) {
        logoutBtnNav.addEventListener('click', handleLogout);
    }
    if (newPatientBtn) {
        newPatientBtn.addEventListener('click', () => showPatientForm());
    }
    if (newPatientBtnNav) {
        newPatientBtnNav.addEventListener('click', () => showPatientForm());
    }
    if (addFirstPatientBtn) {
        addFirstPatientBtn.addEventListener('click', () => showPatientForm());
    }

    // Menú desplegable del usuario
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserDropdown);
    }

    // Cerrar menú desplegable al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (userDropdown && !userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            closeUserDropdown();
        }
    });

    // Búsqueda de pacientes
    if (searchPatient) {
        searchPatient.addEventListener('input', handlePatientSearch);
    }

    // Modal de paciente
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closePatientModal);
    }
    if (patientDetailsModal) {
        patientDetailsModal.addEventListener('click', function(e) {
            if (e.target === patientDetailsModal) {
                closePatientModal();
            }
        });
    }

    // Mostrar el formulario correcto según el estado
    checkLoginStatus();
    setupFormValidation();

    // Funciones para el header del usuario
    function updateHeaderForLoggedInUser(username) {
        if (userInfo) userInfo.classList.remove('hidden');
        if (userName) userName.textContent = username;
        if (userGreeting) userGreeting.textContent = `Hola!`;
    }

    function updateHeaderForLoggedOutUser() {
        if (userInfo) userInfo.classList.add('hidden');
        closeUserDropdown();
    }

    function toggleUserDropdown() {
        if (!userDropdown || !userMenuBtn) return;
        
        const isOpen = !userDropdown.classList.contains('hidden');
        if (isOpen) {
            closeUserDropdown();
        } else {
            openUserDropdown();
        }
    }

    function openUserDropdown() {
        if (userDropdown) userDropdown.classList.remove('hidden');
        if (userMenuBtn) userMenuBtn.classList.add('active');
    }

    function closeUserDropdown() {
        if (userDropdown) userDropdown.classList.add('hidden');
        if (userMenuBtn) userMenuBtn.classList.remove('active');
    }

    // Funciones de navegación
    function showLoginForm() {
        if (loginForm) loginForm.classList.remove('hidden');
        if (userForm) userForm.classList.add('hidden');
        if (patientForm) patientForm.classList.add('hidden');
        if (patientsList) patientsList.classList.add('hidden');
        clearMessages();
    }
    
    function showUserForm() {
        if (userForm) userForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
        if (patientForm) patientForm.classList.add('hidden');
        if (patientsList) patientsList.classList.add('hidden');
        clearMessages();
    }
    
    function showPatientForm() {
        if (patientForm) patientForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
        if (userForm) userForm.classList.add('hidden');
        if (patientsList) patientsList.classList.add('hidden');
        clearMessages();
        loadPatients();
    }
    
    function showPatientsList() {
        if (patientsList) patientsList.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
        if (userForm) userForm.classList.add('hidden');
        if (patientForm) patientForm.classList.add('hidden');
        clearMessages();
        loadPatients();
    }
    
    function handleLogout() {
        isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        updateHeaderForLoggedOutUser();
        window.location.replace('login.html');
    }
    
    function checkLoginStatus() {
        const savedLoginStatus = localStorage.getItem('isLoggedIn');
        const savedUsername = localStorage.getItem('username');
        
        if (savedLoginStatus === 'true' && savedUsername) {
            isLoggedIn = true;
            updateHeaderForLoggedInUser(savedUsername);
            showPatientsList();
        } else {
            updateHeaderForLoggedOutUser();
            showLoginForm();
        }
    }

    // --- Funciones para el manejo de pacientes ---
    async function loadPatients() {
        if (loadingPatients) loadingPatients.classList.remove('hidden');
        if (noPatients) noPatients.classList.add('hidden');
        if (patientsTableBody) patientsTableBody.innerHTML = '';
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes`);
            console.log('Respuesta fetch pacientes:', response);
            if (response.ok) {
                allPatients = await response.json();
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
            if (loadingPatients) loadingPatients.classList.add('hidden');
        }
    }

    function displayPatients(patients) {
        if (!patientsTableBody) return;

        patientsTableBody.innerHTML = '';
        if (patients.length === 0) {
            if (noPatients) noPatients.classList.remove('hidden');
            if (patientsTableBody.parentElement) patientsTableBody.parentElement.classList.add('hidden');
        } else {
            if (noPatients) noPatients.classList.add('hidden');
            if (patientsTableBody.parentElement) patientsTableBody.parentElement.classList.remove('hidden');
            
            patients.forEach(patient => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${patient.dni}</td>
                    <td>${patient.numeroAfiliado}</td>
                    <td>${patient.nombre}</td>
                    <td>${patient.apellido}</td>
                    <td>${patient.email}</td>
                    <td>${patient.telefono}</td>
                    <td>${patient.obraSocial}</td>
                    <td>${new Date(patient.fechaNacimiento).toLocaleDateString()}</td>
                    <td>${patient.peso !== undefined && patient.peso !== null ? patient.peso : ''}</td>
                    <td>${patient.altura !== undefined && patient.altura !== null ? patient.altura : ''}</td>
                    <td class="actions">
                        <div class="action-buttons">
                            <button class="btn-action btn-view" data-id="${patient.id}"><i class="fas fa-eye"></i> Ver</button>
                            <button class="btn-action btn-history" data-id="${patient.id}"><i class="fas fa-history"></i> Historia</button>
                            <button class="btn-action btn-delete" data-id="${patient.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                        </div>
                    </td>
                `;
                patientsTableBody.appendChild(row);
            });
            
            // Event listeners para los botones de acción
            patientsTableBody.querySelectorAll('.btn-view').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const patient = allPatients.find(p => p.id == id);
                    if (patient) openPatientModal(patient);
                });
            });

            patientsTableBody.querySelectorAll('.btn-history').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    window.location.href = `historia.html?id=${id}`;
                });
            });

            patientsTableBody.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
                        deletePatient(id);
                    }
                });
            });
        }
    }

    function filterPatients(query) {
        query = query.trim().toLowerCase();
        if (!query) return allPatients;
        return allPatients.filter(function(p) {
            return (
                (p.nombre && p.nombre.toLowerCase().includes(query)) ||
                (p.apellido && p.apellido.toLowerCase().includes(query)) ||
                (p.dni && p.dni.toLowerCase().includes(query)) ||
                (p.numeroAfiliado && p.numeroAfiliado.toLowerCase().includes(query))
            );
        });
    }

    function handlePatientSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredPatients = allPatients;
        } else {
            filteredPatients = filterPatients(searchTerm);
        }
        currentPage = 1;
        updatePatientsTable();
    }

    function updatePatientsTable() {
        const total = filteredPatients.length;
        const totalPages = Math.ceil(total / patientsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * patientsPerPage;
        const end = start + patientsPerPage;
        const patientsToShow = filteredPatients.slice(start, end);
        displayPatients(patientsToShow);
        renderPaginationBar(currentPage, totalPages);
        // Mantener el valor del select sincronizado
        const patientsPerPageSelect = document.getElementById('patientsPerPage');
        if (patientsPerPageSelect && parseInt(patientsPerPageSelect.value) !== patientsPerPage) {
            patientsPerPageSelect.value = patientsPerPage;
        }
    }

    function renderPaginationBar(current, total) {
        if (!paginationBar) return;
        paginationBar.innerHTML = '';
        if (total <= 1) return;
        const ul = document.createElement('ul');
        ul.className = 'pagination';
        // Botón anterior
        const prevLi = document.createElement('li');
        prevLi.innerHTML = `<button ${current === 1 ? 'disabled' : ''} aria-label="Anterior" class="arrow">&lt;</button>`;
        prevLi.querySelector('button').onclick = () => { if (current > 1) { currentPage--; updatePatientsTable(); } };
        ul.appendChild(prevLi);
        // Números de página (máximo 7 visibles: actual, 3 antes, 3 después)
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
        // Botón siguiente
        const nextLi = document.createElement('li');
        nextLi.innerHTML = `<button ${current === total ? 'disabled' : ''} aria-label="Siguiente" class="arrow">&gt;</button>`;
        nextLi.querySelector('button').onclick = () => { if (current < total) { currentPage++; updatePatientsTable(); } };
        ul.appendChild(nextLi);
        paginationBar.appendChild(ul);
    }

    // Funciones para el Modal de Paciente
    function openPatientModal(patient) {
        if (!patientDetailsModal || !modalBody) return;

        // Limpiar el header y el body por si ya había algo
        const modalHeader = patientDetailsModal.querySelector('.modal-header');
        modalBody.innerHTML = '';
        if (modalHeader.querySelector('.modal-actions')) {
            modalHeader.querySelector('.modal-actions').remove();
        }

        // Renderizar vista de solo lectura
        renderDisplayView(patient);

        // Crear contenedor para botones de acción del modal
        const modalActions = document.createElement('div');
        modalActions.className = 'modal-actions';

        // Botón de Editar
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Editar';
        editBtn.className = 'btn btn-action btn-edit';
        editBtn.onclick = () => renderEditView(patient);
        
        modalActions.appendChild(editBtn);
        modalHeader.appendChild(modalActions);

        patientDetailsModal.classList.remove('hidden');
    }

    function renderDisplayView(patient) {
        modalBody.innerHTML = `
            <div class="modal-grid">
                <div class="detail-card">
                    <h4><i class="fas fa-info-circle"></i> Información Personal</h4>
                    <p><strong>Nombre:</strong> ${patient.nombre}</p>
                    <p><strong>Apellido:</strong> ${patient.apellido}</p>
                    <p><strong>DNI:</strong> ${patient.dni}</p>
                    <p><strong>Fecha de Nacimiento:</strong> ${new Date(patient.fechaNacimiento).toLocaleDateString()}</p>
                    <p><strong>Peso (kg):</strong> ${patient.peso !== undefined && patient.peso !== null ? patient.peso : 'No registrado'}</p>
                    <p><strong>Altura (cm):</strong> ${patient.altura !== undefined && patient.altura !== null ? patient.altura : 'No registrada'}</p>
                </div>
                <div class="detail-card">
                    <h4><i class="fas fa-id-card"></i> Afiliación</h4>
                    <p><strong>N° de Afiliado:</strong> ${patient.numeroAfiliado}</p>
                    <p><strong>Obra Social:</strong> ${patient.obraSocial}</p>
                </div>
                <div class="detail-card">
                    <h4><i class="fas fa-envelope"></i> Contacto</h4>
                    <p><strong>Email:</strong> ${patient.email}</p>
                    <p><strong>Teléfono:</strong> ${patient.telefono}</p>
                </div>
                <div class="detail-card">
                    <h4><i class="fas fa-file-medical-alt"></i> Datos Médicos</h4>
                    <p><strong>Antecedentes:</strong> ${patient.antecedentes || 'No registrados.'}</p>
                    <p><strong>Medicación Actual:</strong> ${patient.medicacion || 'No registrada.'}</p>
                </div>
            </div>
        `;
    }

    function renderEditView(patient) {
        modalBody.innerHTML = `
            <form id="editPatientForm" class="modal-form">
                <div class="detail-card">
                    <h4><i class="fas fa-info-circle"></i> Información Personal</h4>
                    <div class="form-group"><label>Nombre</label><input type="text" name="nombre" value="${patient.nombre}" required></div>
                    <div class="form-group"><label>Apellido</label><input type="text" name="apellido" value="${patient.apellido}" required></div>
                    <div class="form-group"><label>DNI</label><input type="text" name="dni" value="${patient.dni}" required></div>
                    <div class="form-group"><label>Fecha Nacimiento</label><input type="date" name="fechaNacimiento" value="${patient.fechaNacimiento.split('T')[0]}" required></div>
                    <div class="form-group"><label>Peso (kg)</label><input type="number" step="0.01" name="peso" value="${patient.peso !== undefined && patient.peso !== null ? patient.peso : ''}"></div>
                    <div class="form-group"><label>Altura (cm)</label><input type="number" name="altura" value="${patient.altura !== undefined && patient.altura !== null ? patient.altura : ''}"></div>
                </div>
                <div class="detail-card">
                    <h4><i class="fas fa-id-card"></i> Afiliación</h4>
                    <div class="form-group"><label>N° Afiliado</label><input type="text" name="numeroAfiliado" value="${patient.numeroAfiliado}" required></div>
                    <div class="form-group"><label>Obra Social</label><input type="text" name="obraSocial" value="${patient.obraSocial}" required></div>
                </div>
                <div class="detail-card">
                    <h4><i class="fas fa-envelope"></i> Contacto</h4>
                    <div class="form-group"><label>Email</label><input type="email" name="email" value="${patient.email}" required></div>
                    <div class="form-group"><label>Teléfono</label><input type="text" name="telefono" value="${patient.telefono}" required></div>
                </div>
                <div class="detail-card">
                    <h4><i class="fas fa-file-medical-alt"></i> Datos Médicos</h4>
                    <div class="form-group"><label>Antecedentes</label><textarea name="antecedentes">${patient.antecedentes || ''}</textarea></div>
                    <div class="form-group"><label>Medicación</label><textarea name="medicacion">${patient.medicacion || ''}</textarea></div>
                </div>
            </form>
            <div id="editMessage" class="message"></div>
        `;

        const modalHeader = patientDetailsModal.querySelector('.modal-header');
        const modalActions = modalHeader.querySelector('.modal-actions');
        modalActions.innerHTML = ''; // Limpiar botón de editar

        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
        saveBtn.className = 'btn btn-action btn-success';
        saveBtn.onclick = () => handleUpdatePatient(patient.id);

        const cancelBtn = document.createElement('button');
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        cancelBtn.className = 'btn btn-action btn-danger';
        cancelBtn.onclick = () => {
            openPatientModal(patient); // Vuelve a renderizar la vista de solo lectura
        };

        modalActions.appendChild(saveBtn);
        modalActions.appendChild(cancelBtn);
    }

    async function handleUpdatePatient(patientId) {
        const form = document.getElementById('editPatientForm');
        if (!form) return;

        const formData = new FormData(form);
        const updatedData = Object.fromEntries(formData.entries());
        
        // Mantener el id del paciente
        updatedData.id = patientId;

        // Convertir campos numéricos si es necesario, aunque el model binder de .NET Core suele manejarlo.
        // Asegurar que la fecha esté en el formato correcto para el backend si es necesario.
        
        const editMessage = document.getElementById('editMessage');
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes/${patientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                // Actualización exitosa, recargar datos
                showMessage(editMessage, 'Paciente actualizado con éxito.', 'success');
                await loadPatients(); // Recarga la lista de pacientes
                
                // Busca el paciente actualizado para re-renderizar el modal
                const newlyUpdatedPatient = allPatients.find(p => p.id === patientId);
                setTimeout(() => {
                    if (newlyUpdatedPatient) {
                       openPatientModal(newlyUpdatedPatient);
                    } else {
                       closePatientModal();
                    }
                }, 1000);
            } else {
                const errorData = await response.json();
                showMessage(editMessage, `Error al actualizar: ${errorData.title || response.statusText}`, 'error');
            }
        } catch (error) {
            showMessage(editMessage, `Error de conexión: ${error.message}`, 'error');
        }
    }

    function closePatientModal() {
        if (patientDetailsModal) {
            patientDetailsModal.classList.add('hidden');
        }
        if (modalBody) {
            modalBody.innerHTML = ''; // Limpiar contenido al cerrar
        }
    }

    // Funciones globales para las acciones de pacientes
    window.viewPatient = function(id) {
        const patient = allPatients.find(p => p.id === id);
        if (!patient || !modalBody) return;

        modalBody.innerHTML = `
            <div class="detail-group">
                <h3><i class="fas fa-id-card"></i> Información Personal</h3>
                <div class="detail-item"><strong>Nombre:</strong> <span>${patient.nombre} ${patient.apellido}</span></div>
                <div class="detail-item"><strong>DNI:</strong> <span>${patient.dni}</span></div>
                <div class="detail-item"><strong>Fecha de Nacimiento:</strong> <span>${patient.fechaNacimiento ? new Date(patient.fechaNacimiento).toLocaleDateString('es-ES') : 'No especificada'}</span></div>
            </div>
            <div class="detail-group">
                <h3><i class="fas fa-id-badge"></i> Afiliación</h3>
                <div class="detail-item"><strong>N° de Afiliado:</strong> <span>${patient.numeroAfiliado}</span></div>
                <div class="detail-item"><strong>Obra Social:</strong> <span>${patient.obraSocial || 'No especificada'}</span></div>
            </div>
            <div class="detail-group">
                <h3><i class="fas fa-address-book"></i> Contacto</h3>
                <div class="detail-item"><strong>Email:</strong> <span>${patient.email || 'No especificado'}</span></div>
                <div class="detail-item"><strong>Teléfono:</strong> <span>${patient.telefono || 'No especificado'}</span></div>
            </div>
        `;

        openPatientModal();
    };

    window.editPatient = function(id) {
        // Redirigir a la página de la historia clínica con el ID del paciente
        window.location.href = `historia.html?id=${id}`;
    };

    window.deletePatient = async function(id) {
        if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/Pacientes/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok || response.status === 204) {
                    showMessage(patientsMessage, 'Paciente eliminado correctamente', 'success');
                    // Recargar la lista de pacientes
                    await loadPatients();
                } else {
                    showMessage(patientsMessage, 'No se pudo eliminar el paciente', 'error');
                }
            } catch (error) {
                showMessage(patientsMessage, 'Error de conexión al eliminar paciente', 'error');
            }
        }
    };

    // --- Lógica de formularios ---
    async function handleUserRegistration(e) {
        e.preventDefault();
        const formData = new FormData(userFormElement);
        const username = formData.get('newUsername');
        const password = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
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
        const submitBtn = userFormElement.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/usuarios/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreUsuario: username, contrasenaHash: password })
            });
            if (response.ok) {
                showMessage(userMessage, 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.', 'success');
                userFormElement.reset();
                setTimeout(() => { showLoginForm(); }, 2000);
            } else {
                const errorData = await response.text();
                if (errorData.includes('ya existe')) {
                    showMessage(userMessage, 'El nombre de usuario ya existe. Intente con otro.', 'error');
                } else {
                    showMessage(userMessage, 'Error al registrar usuario. Intente nuevamente.', 'error');
                }
            }
        } catch (error) {
            showMessage(userMessage, 'Error de conexión. Intente nuevamente.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    async function handlePatientRegistration(e) {
        e.preventDefault();
        const formData = new FormData(patientFormElement);
        const requiredFields = ['numeroAfiliado', 'nombre', 'apellido'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                showMessage(patientMessage, `El campo ${field} es obligatorio`, 'error');
                return;
            }
        }
        const submitBtn = patientFormElement.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
            const pacienteData = {
                dni: formData.get('dni'),
                numeroAfiliado: formData.get('numeroAfiliado'),
                nombre: formData.get('nombre'),
                apellido: formData.get('apellido'),
                email: formData.get('email') || '',
                telefono: formData.get('telefono') || '',
                obraSocial: formData.get('obraSocial') || '',
                fechaNacimiento: formData.get('fechaNacimiento') ? new Date(formData.get('fechaNacimiento')).toISOString() : new Date().toISOString(),
                antecedentes: formData.get('antecedentes') || '',
                medicacion: formData.get('medicacion') || '',
                consulta: formData.get('consulta') || '',
                peso: formData.get('peso') || '',
                altura: formData.get('altura') || ''
            };
            
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pacienteData)
            });
            if (response.ok) {
                if (addPatientMessage) {
                    addPatientMessage.textContent = 'Paciente registrado exitosamente';
                    addPatientMessage.className = 'message success';
                }
                addPatientForm.reset();
                setTimeout(() => { window.location.href = 'index.html'; }, 1200);
            } else {
                const errorData = await response.text();
                if (addPatientMessage) {
                    addPatientMessage.textContent = 'Error al registrar paciente: ' + errorData;
                    addPatientMessage.className = 'message error';
                }
            }
        } catch (error) {
            if (addPatientMessage) {
                addPatientMessage.textContent = 'Error de conexión. Intente nuevamente.';
                addPatientMessage.className = 'message error';
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    // --- Funciones de utilidad ---
    function showMessage(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }
    
    function clearMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => {
            msg.style.display = 'none';
            msg.textContent = '';
        });
    }
    
    function setupFormValidation() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', () => clearFieldError(input.name));
        });
    }
    
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        const fieldName = field.name;
        
        if (fieldName === 'email' && value && !validateEmail(value)) {
            showFieldError(fieldName, 'Email inválido');
            return false;
        }
        
        if (fieldName === 'telefono' && value && !validatePhone(value)) {
            showFieldError(fieldName, 'Teléfono inválido');
            return false;
        }
        
        return true;
    }
    
    function showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        field.classList.add('field-error');
        
        let errorDiv = field.parentNode.querySelector('.field-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error-message';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }
    
    function clearFieldError(fieldName) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        field.classList.remove('field-error');
        
        const errorDiv = field.parentNode.querySelector('.field-error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function validatePhone(phone) {
        return /^[\d\s\-\+\(\)]+$/.test(phone);
    }

    // Mostrar el bloque de usuario solo si NO está el login visible
    if (loginForm && userInfo) {
        if (loginForm.classList.contains('hidden')) {
            userInfo.classList.remove('hidden');
        } else {
            userInfo.classList.add('hidden');
        }
    }

    function toggleUserInfoByLogin() {
        const loginForm = document.getElementById('loginForm');
        const userInfo = document.getElementById('user-info');
        if (loginForm && userInfo) {
            if (loginForm.classList.contains('hidden')) {
                userInfo.classList.remove('hidden');
            } else {
                userInfo.classList.add('hidden');
            }
        }
    }

    window.addEventListener('DOMContentLoaded', toggleUserInfoByLogin);
    // Si usas SPA o cambias de pantalla dinámicamente, llama a toggleUserInfoByLogin() después de cada cambio de pantalla.

    // Forzar el estado visual correcto al cargar la página
    checkLoginStatus();

    // Soporte para agregar.html
    if (addPatientForm) {
        addPatientForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (addPatientMessage) addPatientMessage.textContent = '';
            // Validación básica
            const formData = new FormData(addPatientForm);
            const requiredFields = ['dni', 'nombre', 'apellido', 'numeroAfiliado'];
            for (const field of requiredFields) {
                if (!formData.get(field)) {
                    if (addPatientMessage) {
                        addPatientMessage.textContent = `El campo ${field} es obligatorio`;
                        addPatientMessage.className = 'message error';
                    }
                    return;
                }
            }
            const pacienteData = {
                dni: formData.get('dni'),
                numeroAfiliado: formData.get('numeroAfiliado'),
                nombre: formData.get('nombre'),
                apellido: formData.get('apellido'),
                email: formData.get('email') || '',
                telefono: formData.get('telefono') || '',
                obraSocial: formData.get('obraSocial') || '',
                fechaNacimiento: new Date().toISOString(),
                peso: formData.get('peso') || '',
                altura: formData.get('altura') || ''
            };
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pacienteData)
                });
                if (response.ok) {
                    if (addPatientMessage) {
                        addPatientMessage.textContent = 'Paciente registrado exitosamente';
                        addPatientMessage.className = 'message success';
                    }
                    addPatientForm.reset();
                    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
                } else {
                    const errorData = await response.text();
                    if (addPatientMessage) {
                        addPatientMessage.textContent = 'Error al registrar paciente: ' + errorData;
                        addPatientMessage.className = 'message error';
                    }
                }
            } catch (error) {
                if (addPatientMessage) {
                    addPatientMessage.textContent = 'Error de conexión. Intente nuevamente.';
                    addPatientMessage.className = 'message error';
                }
            }
        });
    }

    const paginationBar = document.getElementById('paginationBar');
    const patientsPerPageSelect = document.getElementById('patientsPerPage');
    if (patientsPerPageSelect) {
        patientsPerPageSelect.value = patientsPerPage;
        patientsPerPageSelect.addEventListener('change', function() {
            patientsPerPage = parseInt(this.value);
            currentPage = 1;
            updatePatientsTable();
        });
    }
});