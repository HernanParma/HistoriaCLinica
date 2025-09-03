// Configuración global
if (typeof window.CONFIG === 'undefined') {
    window.CONFIG = {
        API_BASE_URL: window.location.origin
    };
}

console.log('🔧 Configuración de API:', window.CONFIG);

// Headers de autorización
function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    console.log('🔑 Token encontrado:', !!token);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Helper GET con manejo de errores detallado
async function apiGet(path) {
    console.log('🌐 Haciendo petición a:', `${window.CONFIG.API_BASE_URL}${path}`);
    
    try {
        const resp = await fetch(`${window.CONFIG.API_BASE_URL}${path}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            }
        });

        console.log('📡 Respuesta recibida:', resp.status, resp.statusText);

        // Redirigir si no autenticado
        if (resp.status === 401) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('jwtToken');
            window.location.replace('login.html');
            return Promise.reject(new Error('401 No autorizado'));
        }

        if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            console.error('❌ Error en respuesta:', resp.status, text);
            throw new Error(`${resp.status} ${resp.statusText}${text ? ' - ' + text : ''}`);
        }

        const data = await resp.json();
        console.log('✅ Datos recibidos:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en petición:', error);
        throw error;
    }
}

// UI helpers
function showSidebarError(msg) {
    const box = document.getElementById('sidebar-content');
    if (!box) return;
    box.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${msg}</span>
            <small>Revisa la consola (F12 → Network) para ver el detalle.</small>
        </div>
    `;
}

function showHCLoading() {
    const body = document.getElementById('hc-body');
    if (body) body.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando historia clínica...</span>
        </div>
    `;
}

// Render de datos del paciente con nuevo sistema de edición por secciones
function renderPatientSidebar(p) {
    const box = document.getElementById('sidebar-content');
    if (!box) return;
    box.innerHTML = `
        <div class="patient-data-container">
            <div class="patient-section" data-section="personal">
                <div class="section-header">
                    <h4><i class="fas fa-user"></i> Información Personal</h4>
                    <button class="btn-edit-section" onclick="toggleEditMode('personal')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
                <div class="editable-field">
                    <label>Nombre:</label>
                    <input type="text" id="edit-nombre" value="${p.nombre || p.Nombre || ''}" placeholder="Nombre del paciente" disabled>
                </div>
                <div class="editable-field">
                    <label>Apellido:</label>
                    <input type="text" id="edit-apellido" value="${p.apellido || p.Apellido || ''}" placeholder="Apellido del paciente" disabled>
                </div>
                <div class="editable-field">
                    <label>DNI:</label>
                    <input type="text" id="edit-dni" value="${p.dni || p.DNI || ''}" placeholder="DNI del paciente" disabled>
                </div>
                <div class="editable-field">
                    <label>N° Afiliado:</label>
                    <input type="text" id="edit-numeroAfiliado" value="${p.numeroAfiliado || p.NumeroAfiliado || ''}" placeholder="Número de afiliado" disabled>
                </div>
                <div class="editable-field">
                    <label>Obra Social:</label>
                    <input type="text" id="edit-obraSocial" value="${p.obraSocial || p.ObraSocial || ''}" placeholder="Obra social" disabled>
                </div>
                <div class="editable-field">
                    <label>Teléfono:</label>
                    <input type="tel" id="edit-telefono" value="${p.telefono || p.Telefono || ''}" placeholder="Teléfono" disabled>
                </div>
                <div class="section-actions hidden">
                    <button class="btn-save-section" onclick="saveSection('personal')">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
            
            <div class="patient-section" data-section="medicacion">
                <div class="section-header">
                    <h4><i class="fas fa-pills"></i> Medicación Actual</h4>
                    <button class="btn-edit-section" onclick="toggleEditMode('medicacion')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
                <div class="editable-field">
                    <label>Medicación:</label>
                    <textarea id="edit-medicacion" placeholder="Medicación actual del paciente" disabled>${p.medicacion || p.Medicacion || ''}</textarea>
                </div>
                <div class="section-actions hidden">
                    <button class="btn-save-section" onclick="saveSection('medicacion')">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
            
            <div class="patient-section" data-section="antecedentes">
                <div class="section-header">
                    <h4><i class="fas fa-history"></i> Antecedentes Médicos</h4>
                    <button class="btn-edit-section" onclick="toggleEditMode('antecedentes')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
                <div class="editable-field">
                    <label>Antecedentes:</label>
                    <textarea id="edit-antecedentes" placeholder="Antecedentes médicos del paciente" disabled>${p.antecedentes || p.Antecedentes || ''}</textarea>
                </div>
                <div class="section-actions hidden">
                    <button class="btn-save-section" onclick="saveSection('antecedentes')">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Configurar eventos de edición
    setupEditEvents();
}

// ===== NUEVO SISTEMA DE EDICIÓN POR SECCIONES =====

// Configurar eventos de edición para todas las secciones
function setupEditEvents() {
    console.log('🔧 Configurando eventos de edición...');
}

// Alternar modo de edición para una sección específica
function toggleEditMode(section) {
    console.log(`🔄 Alternando modo de edición para sección: ${section}`);
    
    const sectionElement = document.querySelector(`[data-section="${section}"]`);
    
    if (!sectionElement) {
        console.error(`❌ No se encontró la sección: ${section}`);
        return;
    }
    
    const editButton = sectionElement.querySelector('.btn-edit-section');
    const saveButton = sectionElement.querySelector('.section-actions');
    const fields = getSectionFields(section);
    
    if (fields.length === 0) {
        console.error(`❌ No se encontraron campos para la sección: ${section}`);
        return;
    }
    
    const isEditing = !fields[0].disabled;
    
    if (isEditing) {
        // Cancelar edición
        fields.forEach(field => field.disabled = true);
        editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
        editButton.classList.remove('editing');
        saveButton.classList.add('hidden');
        console.log(`❌ Edición cancelada para sección: ${section}`);
    } else {
        // Activar edición
        fields.forEach(field => field.disabled = false);
        editButton.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        editButton.classList.add('editing');
        saveButton.classList.remove('hidden');
        console.log(`✏️ Edición activada para sección: ${section}`);
    }
}

// Obtener todos los campos de una sección específica
function getSectionFields(section) {
    let fields = [];
    
    switch (section) {
        case 'personal':
            fields = [
                document.getElementById('edit-nombre'),
                document.getElementById('edit-apellido'),
                document.getElementById('edit-dni'),
                document.getElementById('edit-numeroAfiliado'),
                document.getElementById('edit-obraSocial'),
                document.getElementById('edit-telefono')
            ];
            break;
        case 'medicacion':
            fields = [
                document.getElementById('edit-medicacion')
            ];
            break;
        case 'antecedentes':
            fields = [
                document.getElementById('edit-antecedentes')
            ];
            break;
        default:
            console.error(`❌ Sección no reconocida: ${section}`);
            return [];
    }
    
    // Filtrar campos que existen
    return fields.filter(field => field !== null);
}

// Guardar todos los campos de una sección
async function saveSection(section) {
    console.log(`💾 Guardando sección: ${section}`);
    
    const fields = getSectionFields(section);
    if (fields.length === 0) {
        showErrorMessage('No se encontraron campos para guardar');
        return;
    }
    
    // Recopilar datos de la sección
    const sectionData = {};
    const patientId = getPatientIdFromUrl();
    
    switch (section) {
        case 'personal':
            sectionData.nombre = document.getElementById('edit-nombre')?.value || '';
            sectionData.apellido = document.getElementById('edit-apellido')?.value || '';
            sectionData.dni = document.getElementById('edit-dni')?.value || '';
            sectionData.numeroAfiliado = document.getElementById('edit-numeroAfiliado')?.value || '';
            sectionData.obraSocial = document.getElementById('edit-obraSocial')?.value || '';
            sectionData.telefono = document.getElementById('edit-telefono')?.value || '';
            break;
        case 'medicacion':
            sectionData.medicacion = document.getElementById('edit-medicacion')?.value || '';
            break;
        case 'antecedentes':
            sectionData.antecedentes = document.getElementById('edit-antecedentes')?.value || '';
            break;
        default:
            showErrorMessage('Sección no reconocida');
            return;
    }
    
    try {
        // Hacer petición PUT para actualizar el paciente
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(sectionData)
        });
        
        if (response.ok) {
            showSuccessMessage('Guardado con éxito');
            // Desactivar modo de edición
            toggleEditMode(section);
        } else {
            const errorData = await response.json();
            showErrorMessage(errorData.message || 'Error al guardar');
        }
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        showErrorMessage('Error de conexión al guardar');
    }
}

// Mostrar mensaje de éxito
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Insertar al inicio del contenedor principal
    const container = document.querySelector('.patient-data-container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Mostrar mensaje de error
function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    
    // Insertar al inicio del contenedor principal
    const container = document.querySelector('.patient-data-container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// ===== FIN DEL NUEVO SISTEMA DE EDICIÓN =====

// Obtener ID del paciente de la URL
function getPatientIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Cargar datos del paciente
async function loadPatientData(patientId) {
    try {
        const paciente = await apiGet(`/api/pacientes/${patientId}`);
        renderPatientSidebar(paciente);
        
        // Mostrar la tarjeta de consultas
        const hcCard = document.getElementById('hc-card');
        if (hcCard) {
            hcCard.classList.remove('hidden');
        }
        
        await loadPatientConsultations(patientId);
    } catch (err) {
        console.error('❌ Error al cargar datos del paciente:', err);
        showSidebarError(`Error al cargar datos del paciente: ${String(err.message)}`);
    }
}

// Cargar consultas del paciente
async function loadPatientConsultations(patientId) {
    try {
        showHCLoading();
        
        // Intentar primero la ruta específica de consultas
        try {
            const consultas = await apiGet(`/api/pacientes/${patientId}/consultas`);
            renderConsultas(consultas);
            return;
        } catch (err) {
            console.log('⚠️ Ruta específica falló, intentando desde datos del paciente...');
        }
        
        // Si falla, intentar obtener las consultas desde los datos del paciente
        const paciente = await apiGet(`/api/pacientes/${patientId}`);
        if (paciente && paciente.consultas) {
            renderConsultas(paciente.consultas);
        } else {
            renderConsultas([]);
        }
        
    } catch (err) {
        console.error('❌ Error al cargar consultas:', err);
        const hcBody = document.getElementById('hc-body');
        if (hcBody) {
            hcBody.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Ocurrió un error al cargar las consultas.</span>
                    <small>${String(err.message)}</small>
                </div>
            `;
        }
    }
}

// Función para renderizar valores de laboratorio
function renderLaboratorioValues(consulta) {
    const labValues = [
        { key: 'gr', label: 'GR (Glóbulos Rojos)', value: consulta.gr || consulta.GR },
        { key: 'hto', label: 'HTO (Hematocrito)', value: consulta.hto || consulta.HTO },
        { key: 'hb', label: 'HB (Hemoglobina)', value: consulta.hb || consulta.HB },
        { key: 'gb', label: 'GB (Glóbulos Blancos)', value: consulta.gb || consulta.GB },
        { key: 'plaq', label: 'PLAQ (Plaquetas)', value: consulta.plaq || consulta.PLAQ },
        { key: 'gluc', label: 'GLUC (Glucosa)', value: consulta.gluc || consulta.GLUC },
        { key: 'urea', label: 'UREA', value: consulta.urea || consulta.UREA },
        { key: 'cr', label: 'CR (Creatinina)', value: consulta.cr || consulta.CR },
        { key: 'got', label: 'GOT', value: consulta.got || consulta.GOT },
        { key: 'gpt', label: 'GPT', value: consulta.gpt || consulta.GPT },
        { key: 'ct', label: 'CT (Colesterol Total)', value: consulta.ct || consulta.CT },
        { key: 'tg', label: 'TG (Triglicéridos)', value: consulta.tg || consulta.TG },
        { key: 'vitd', label: 'VITD (Vitamina D)', value: consulta.vitd || consulta.VITD },
        { key: 'fal', label: 'FAL (Fosfatasa Alcalina)', value: consulta.fal || consulta.FAL },
        { key: 'col', label: 'COL (Colesterol)', value: consulta.col || consulta.COL },
        { key: 'b12', label: 'B12 (Vitamina B12)', value: consulta.b12 || consulta.B12 },
        { key: 'tsh', label: 'TSH', value: consulta.tsh || consulta.TSH },
        { key: 'orina', label: 'ORINA', value: consulta.orina || consulta.ORINA },
        { key: 'urico', label: 'URICO (Ácido Úrico)', value: consulta.urico || consulta.URICO }
    ];

    const labHTML = labValues
        .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
        .map(item => `
            <div class="lab-value-item">
                <span class="lab-label">${item.label}:</span>
                <span class="lab-value">${item.value}</span>
            </div>
        `).join('');

    if (labHTML === '') {
        return '<div class="no-lab-values">No hay valores de laboratorio registrados para esta consulta.</div>';
    }

    return labHTML;
}

// Función para alternar la vista de laboratorio
window.toggleLaboratorio = function(consultaId) {
    const labSection = document.getElementById(`laboratorio-${consultaId}`);
    const btn = event.target.closest('.btn-ver-laboratorio');
    
    if (labSection.classList.contains('hidden')) {
        labSection.classList.remove('hidden');
        labSection.classList.add('show');
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Laboratorio';
        btn.classList.add('active');
    } else {
        labSection.classList.remove('show');
        labSection.classList.add('hidden');
        btn.innerHTML = '<i class="fas fa-flask"></i> Ver Laboratorio';
        btn.classList.remove('active');
    }
};

// Renderizar consultas
function renderConsultas(consultas) {
    const hcBody = document.getElementById('hc-body');
    if (!hcBody) return;

    if (!consultas || !consultas.length) {
        hcBody.innerHTML = `
            <div class="no-consultations">
                <i class="fas fa-notes-medical"></i>
                <span>No hay consultas registradas para este paciente</span>
                <br><small>Puede agregar una nueva consulta cuando sea necesario</small>
            </div>
        `;
        return;
    }

    const consultasHtml = consultas.map(consulta => `
        <div class="consulta-item">
            <div class="consulta-header" onclick="toggleConsultaDetalle(this)">
                <div class="consulta-fecha">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${new Date(consulta.fecha || consulta.Fecha).toLocaleDateString()}</span>
                </div>
                <div class="consulta-actions">
                    <button class="btn-eliminar-consulta" onclick="eliminarConsulta(${consulta.id || consulta.Id})" title="Eliminar consulta">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
            </div>
            <div class="consulta-content collapsed">
                <div class="consulta-details">
                    ${consulta.motivo || consulta.Motivo ? `<div class="detail-item"><strong>Motivo:</strong> ${consulta.motivo || consulta.Motivo}</div>` : ''}
                    ${consulta.recetar || consulta.Recetar ? `<div class="detail-item"><strong>Recetar:</strong> ${consulta.recetar || consulta.Recetar}</div>` : ''}
                    ${consulta.ome || consulta.Ome ? `<div class="detail-item"><strong>OME:</strong> ${consulta.ome || consulta.Ome}</div>` : ''}
                    ${consulta.notas || consulta.Notas ? `<div class="detail-item"><strong>Notas:</strong> ${consulta.notas || consulta.Notas}</div>` : ''}
                </div>
                
                <!-- Botón para ver valores de laboratorio -->
                <div class="consulta-actions-bottom">
                    <button class="btn-ver-laboratorio" onclick="toggleLaboratorio(${consulta.id || consulta.Id})" title="Ver valores de laboratorio">
                        <i class="fas fa-flask"></i> Ver Laboratorio
                    </button>
                </div>
                
                <!-- Sección de laboratorio (inicialmente oculta) -->
                <div id="laboratorio-${consulta.id || consulta.Id}" class="laboratorio-section hidden">
                    <div class="laboratorio-grid">
                        ${renderLaboratorioValues(consulta)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    hcBody.innerHTML = consultasHtml;
}

// Función para alternar detalles de consulta
window.toggleConsultaDetalle = function(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.remove('expanded');
        content.classList.add('collapsed');
        icon.style.transform = 'rotate(0deg)';
    }
};

// Función para eliminar consulta
window.eliminarConsulta = async function(consultaId) {
    const patientId = getPatientIdFromUrl();
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta consulta?')) {
        return;
    }
    
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}/consultas/${consultaId}`, {
            method: 'DELETE',
            headers: headers
        });
        
        if (response.ok) {
            console.log('✅ Consulta eliminada exitosamente');
            // Recargar consultas
            await loadPatientConsultations(patientId);
        } else {
            console.error(`❌ Error al eliminar consulta: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Error al eliminar consulta:', error);
    }
};

// ===== FUNCIONALIDAD DEL MODAL DE NUEVA CONSULTA =====

// Variables globales para archivos
let archivosList = [];

// Inicializar funcionalidad del modal
function initializeModal() {
    console.log('🔧 Inicializando funcionalidad del modal de nueva consulta...');
    
    // Elementos del modal
    const modalNuevaConsulta = document.getElementById('modalNuevaConsulta');
    const btnNuevaConsulta = document.getElementById('btnNuevaConsulta');
    const closeModalNuevaConsulta = document.getElementById('closeModalNuevaConsulta');
    const cancelarNuevaConsulta = document.getElementById('cancelarNuevaConsulta');
    const formNuevaConsulta = document.getElementById('formNuevaConsulta');
    const fechaConsulta = document.getElementById('fechaConsulta');

    // Debug: Verificar que todos los elementos estén presentes
    console.log('🔍 Elementos del modal:', {
        modalNuevaConsulta: !!modalNuevaConsulta,
        btnNuevaConsulta: !!btnNuevaConsulta,
        closeModalNuevaConsulta: !!closeModalNuevaConsulta,
        cancelarNuevaConsulta: !!cancelarNuevaConsulta,
        formNuevaConsulta: !!formNuevaConsulta,
        fechaConsulta: !!fechaConsulta
    });

    // Configurar fecha por defecto (hoy)
    if (fechaConsulta) {
        const today = new Date().toISOString().split('T')[0];
        fechaConsulta.value = today;
        console.log('📅 Fecha configurada:', today);
    }

    // Abrir modal
    if (btnNuevaConsulta) {
        console.log('🔘 Botón Nueva Consulta encontrado, agregando event listener...');
        btnNuevaConsulta.addEventListener('click', () => {
            console.log('🖱️ Click en botón Nueva Consulta');
            if (modalNuevaConsulta) {
                console.log('📋 Modal encontrado, mostrando...');
                modalNuevaConsulta.classList.remove('hidden');
                modalNuevaConsulta.classList.add('show');
                // Enfocar el primer campo
                const motivoField = document.getElementById('motivoConsulta');
                if (motivoField) {
                    motivoField.focus();
                    console.log('🎯 Campo motivo enfocado');
                }
            } else {
                console.error('❌ Modal no encontrado');
            }
        });
    } else {
        console.error('❌ Botón Nueva Consulta no encontrado');
    }

    // Cerrar modal
    function closeModal() {
        if (modalNuevaConsulta) {
            modalNuevaConsulta.classList.remove('show');
            modalNuevaConsulta.classList.add('hidden');
            // Limpiar formulario
            if (formNuevaConsulta) formNuevaConsulta.reset();
            // Restaurar fecha por defecto
            if (fechaConsulta) {
                const today = new Date().toISOString().split('T')[0];
                fechaConsulta.value = today;
            }
            // Limpiar archivos
            archivosList = [];
            mostrarArchivosSeleccionados();
        }
    }

    // Event listeners para cerrar modal
    if (closeModalNuevaConsulta) {
        closeModalNuevaConsulta.addEventListener('click', closeModal);
    }

    if (cancelarNuevaConsulta) {
        cancelarNuevaConsulta.addEventListener('click', closeModal);
    }

    // Cerrar modal al hacer clic fuera
    if (modalNuevaConsulta) {
        modalNuevaConsulta.addEventListener('click', (e) => {
            if (e.target === modalNuevaConsulta) {
                closeModal();
            }
        });
    }

    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalNuevaConsulta && !modalNuevaConsulta.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Manejar envío del formulario
    if (formNuevaConsulta) {
        formNuevaConsulta.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = formNuevaConsulta.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            try {
                // Deshabilitar botón y mostrar loading
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                
                // Obtener datos del formulario
                const formData = new FormData(formNuevaConsulta);
                const consultaData = {
                    fecha: formData.get('fecha') || new Date().toISOString().split('T')[0],
                    motivo: formData.get('motivo'),
                    recetar: formData.get('recetar') || null,
                    ome: formData.get('ome') || null,
                    notas: formData.get('notas') || null,
                    // Valores de laboratorio completos
                    gr: formData.get('gr') ? parseFloat(formData.get('gr')) : null,
                    hto: formData.get('hto') ? parseFloat(formData.get('hto')) : null,
                    hb: formData.get('hb') ? parseFloat(formData.get('hb')) : null,
                    gb: formData.get('gb') ? parseFloat(formData.get('gb')) : null,
                    plaq: formData.get('plaq') ? parseFloat(formData.get('plaq')) : null,
                    gluc: formData.get('gluc') ? parseFloat(formData.get('gluc')) : null,
                    urea: formData.get('urea') ? parseFloat(formData.get('urea')) : null,
                    cr: formData.get('cr') ? parseFloat(formData.get('cr')) : null,
                    got: formData.get('got') ? parseFloat(formData.get('got')) : null,
                    gpt: formData.get('gpt') ? parseFloat(formData.get('gpt')) : null,
                    ct: formData.get('ct') ? parseFloat(formData.get('ct')) : null,
                    tg: formData.get('tg') ? parseFloat(formData.get('tg')) : null,
                    vitd: formData.get('vitd') ? parseFloat(formData.get('vitd')) : null,
                    fal: formData.get('fal') ? parseFloat(formData.get('fal')) : null,
                    col: formData.get('col') ? parseFloat(formData.get('col')) : null,
                    b12: formData.get('b12') ? parseFloat(formData.get('b12')) : null,
                    tsh: formData.get('tsh') ? parseFloat(formData.get('tsh')) : null,
                    orina: formData.get('orina') || null,
                    urico: formData.get('urico') ? parseFloat(formData.get('urico')) : null
                };

                // Validar motivo (requerido)
                if (!consultaData.motivo || consultaData.motivo.trim() === '') {
                    alert('El motivo de la consulta es requerido');
                    return;
                }

                console.log('📝 Creando nueva consulta:', consultaData);
                
                const patientId = getPatientIdFromUrl();
                
                // Enviar a la API
                const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}/consultas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify(consultaData)
                });

                if (response.ok) {
                    const nuevaConsulta = await response.json();
                    console.log('✅ Consulta creada exitosamente:', nuevaConsulta);
                    
                    // Mostrar mensaje de éxito
                    alert('Consulta creada exitosamente');
                    
                    // Cerrar modal
                    closeModal();
                    
                    // Recargar consultas para mostrar la nueva
                    await loadPatientConsultations(patientId);
                    
                } else {
                    const errorText = await response.text();
                    console.error('❌ Error al crear consulta:', response.status, errorText);
                    alert(`Error al crear consulta: ${errorText}`);
                }
                
            } catch (error) {
                console.error('❌ Error de conexión:', error);
                alert('Error de conexión al crear la consulta');
            } finally {
                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // ===== FUNCIONALIDAD PARA ARCHIVOS =====
    
    const archivosInput = document.getElementById('archivosConsulta');
    const archivosSeleccionados = document.getElementById('archivosSeleccionados');

    if (archivosInput) {
        archivosInput.addEventListener('change', handleArchivosSeleccionados);
    }

    function handleArchivosSeleccionados(event) {
        const files = Array.from(event.target.files);
        
        // Validar número máximo de archivos
        if (files.length > 5) {
            alert('Máximo 5 archivos permitidos');
            return;
        }

        // Validar tamaño de archivos (10MB cada uno)
        const maxSize = 10 * 1024 * 1024; // 10MB en bytes
        const archivosValidos = files.filter(file => {
            if (file.size > maxSize) {
                alert(`El archivo ${file.name} excede el tamaño máximo de 10MB`);
                return false;
            }
            return true;
        });

        // Agregar archivos válidos a la lista
        archivosValidos.forEach(file => {
            if (!archivosList.find(f => f.name === file.name)) {
                archivosList.push(file);
            }
        });

        // Actualizar la visualización
        mostrarArchivosSeleccionados();
    }

    function mostrarArchivosSeleccionados() {
        if (!archivosSeleccionados) return;

        if (archivosList.length === 0) {
            archivosSeleccionados.innerHTML = '';
            return;
        }

        const archivosHTML = archivosList.map((file, index) => {
            const iconClass = getIconClass(file.name);
            const fileSize = formatFileSize(file.size);
            
            return `
                <div class="archivo-item">
                    <div class="archivo-info">
                        <div class="archivo-icono ${iconClass}">
                            <i class="fas ${getIconName(file.name)}"></i>
                        </div>
                        <div>
                            <div class="archivo-nombre">${file.name}</div>
                            <div class="archivo-tamaño">${fileSize}</div>
                        </div>
                    </div>
                    <button type="button" class="btn-eliminar-archivo" onclick="eliminarArchivo(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        archivosSeleccionados.innerHTML = archivosHTML;
    }

    function getIconClass(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        if (['pdf'].includes(ext)) return 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image';
        if (['doc', 'docx', 'txt'].includes(ext)) return 'document';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
        return 'document';
    }

    function getIconName(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        if (['pdf'].includes(ext)) return 'fa-file-pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'fa-file-image';
        if (['doc', 'docx', 'txt'].includes(ext)) return 'fa-file-word';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'fa-file-excel';
        return 'fa-file';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Función global para eliminar archivos
    window.eliminarArchivo = function(index) {
        archivosList.splice(index, 1);
        mostrarArchivosSeleccionados();
        
        // Actualizar el input de archivos
        if (archivosInput) {
            const dt = new DataTransfer();
            archivosList.forEach(file => dt.items.add(file));
            archivosInput.files = dt.files;
        }
    };

    console.log('✅ Funcionalidad del modal de nueva consulta inicializada');
}

// Función para guardar campos editados del paciente
window.savePatientField = async function(fieldName, inputId) {
    const input = document.getElementById(inputId);
    const newValue = input.value.trim();
    const patientId = getPatientIdFromUrl();
    
    if (!patientId) {
        alert('Error: No se encontró ID del paciente');
        return;
    }
    
    try {
        // Mostrar loading en el botón
        const saveBtn = input.nextElementSibling;
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Preparar datos para actualizar
        const updateData = {
            [fieldName]: newValue
        };
        
        console.log(`📝 Actualizando campo ${fieldName}:`, updateData);
        
        // Enviar actualización a la API
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            console.log(`✅ Campo ${fieldName} actualizado exitosamente`);
            
            // Mostrar confirmación visual
            saveBtn.innerHTML = '<i class="fas fa-check"></i>';
            saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            // Restaurar botón después de 2 segundos
            setTimeout(() => {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
                saveBtn.style.background = '';
            }, 2000);
            
        } else {
            const errorText = await response.text();
            console.error(`❌ Error al actualizar ${fieldName}:`, response.status, errorText);
            alert(`Error al actualizar ${fieldName}: ${errorText}`);
            
            // Restaurar botón
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
        
    } catch (error) {
        console.error(`❌ Error de conexión al actualizar ${fieldName}:`, error);
        alert(`Error de conexión al actualizar ${fieldName}`);
        
        // Restaurar botón
        const saveBtn = input.nextElementSibling;
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
};

// Inicialización principal
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando aplicación de historia clínica...');
    
    // Inicializar modal
    initializeModal();
    
    // Cargar datos del paciente
    const patientId = getPatientIdFromUrl();
    if (patientId) {
        await loadPatientData(patientId);
    } else {
        console.error('❌ No se encontró ID de paciente en la URL');
        
        // Mostrar error en la interfaz
        const sidebarContent = document.getElementById('sidebar-content');
        if (sidebarContent) {
            sidebarContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Error: No se encontró ID de paciente en la URL</span>
                    <br><small>Por favor, regrese al listado de pacientes</small>
                </div>
            `;
        }
    }
});
