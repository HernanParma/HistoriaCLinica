// Configuración global - Actualizado: 2025-09-22 23:40
if (typeof window.CONFIG === 'undefined') {
    // Detectar si estamos en Live Server (puerto 5500) y usar backend en 5000
    const currentPort = window.location.port;
    let apiBaseUrl;
    
    if (currentPort === '5500' || currentPort === '5501') {
        // Live Server detectado, usar backend en localhost:5000
        apiBaseUrl = 'http://localhost:5000';
        console.log('🔧 Live Server detectado, usando backend en:', apiBaseUrl);
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Localhost pero no Live Server, usar el mismo origen
        apiBaseUrl = window.location.origin;
        console.log('🔧 Localhost detectado, usando mismo origen:', apiBaseUrl);
    } else {
        // Producción u otro entorno
        apiBaseUrl = window.location.origin;
        console.log('🔧 Otro entorno, usando:', apiBaseUrl);
    }
    
    window.CONFIG = {
        API_BASE_URL: apiBaseUrl
    };
} else {
    // Si CONFIG ya existe pero está usando el puerto incorrecto, corregirlo
    const currentPort = window.location.port;
    if ((currentPort === '5500' || currentPort === '5501') && 
        window.CONFIG.API_BASE_URL.includes(':5500')) {
        window.CONFIG.API_BASE_URL = 'http://localhost:5000';
        console.log('🔧 Corregida URL del backend a:', window.CONFIG.API_BASE_URL);
    }
}

// ===== FUNCIONES GLOBALES PARA CAMPOS RESALTADOS (LAB) =====
function getHighlightedFields(root = document) {
  const highlighted = [];
  const labels = root.querySelectorAll('.lab-grid .form-group label.highlighted');

  const keyFrom = (label) => {
    // 1) data-key="gr" etc (recomendado en el HTML)
    if (label.dataset && label.dataset.key) return label.dataset.key.toLowerCase();

    // 2) for="grConsulta" → "gr"
    const f = label.getAttribute('for');
    if (f) return f.replace(/Consulta$/i, '').toLowerCase();

    // 3) fallback por texto (GR:, HTO:, HB:)
    const txt = (label.textContent || '').toLowerCase().replace(':', '').trim();
    // map explícito para evitar desmatches
    const map = ['gr','hto','hb','gb','plaq','gluc','urea','cr','vfg','got','gpt','ct','tg','vitd','fal','hdl','ldl','b12','tsh','t4l','orina','urico','psa','hba1c','valoresNoIncluidos'];
    const hit = map.find(k => txt.startsWith(k));
    return hit || txt;
  };

  labels.forEach(l => {
    const key = keyFrom(l);
    highlighted.push(key);
    console.log(`🔴 Campo resaltado detectado: ${key} (texto: "${l.textContent}")`);
  });
  
  console.log('🔴 Campos resaltados totales:', highlighted);
  return highlighted;
}

function applyHighlightedFields(highlightedFields, root = document) {
  if (!highlightedFields || !highlightedFields.length) return;
  const labels = root.querySelectorAll('.lab-grid .form-group label');
  labels.forEach(label => {
    // usar misma lógica de key que arriba para comparar
    const key = (label.dataset?.key || label.getAttribute('for')?.replace(/Consulta$/i,'') || label.textContent).toLowerCase().replace(':','').trim();
    if (highlightedFields.includes(key)) {
      label.classList.add('highlighted');
    }
  });
}

// Función helper para preservar saltos de línea en HTML
// Escapa HTML para seguridad y convierte \n a <br>
function formatTextWithLineBreaks(text) {
    if (!text) return '';
    // Primero escapar HTML para evitar XSS
    const div = document.createElement('div');
    div.textContent = text;
    const escaped = div.innerHTML;
    // Convertir saltos de línea a <br>
    return escaped.replace(/\n/g, '<br>');
}

function clearHighlightedFields(root = document) {
  root.querySelectorAll('.lab-grid .form-group label.highlighted')
    .forEach(l => l.classList.remove('highlighted'));
}

function setupLabLabelClickHandlers(root = document) {
  // Deshabilitar esta implementación para evitar conflictos
  // El sistema de destacado se maneja desde historia.html
  console.log('🔧 setupLabLabelClickHandlers llamado pero deshabilitado para evitar conflictos');
}

// Exponer explícitamente en window para compatibilidad
window.getHighlightedFields = getHighlightedFields;
window.applyHighlightedFields = applyHighlightedFields;
window.clearHighlightedFields = clearHighlightedFields;
window.setupLabLabelClickHandlers = setupLabLabelClickHandlers;

// Asegurar que la URL del backend sea correcta después de cargar config.js
(function() {
    const currentPort = window.location.port;
    if ((currentPort === '5500' || currentPort === '5501') && 
        window.CONFIG && window.CONFIG.API_BASE_URL) {
        // Si estamos en Live Server y la URL no es la del backend, corregirla
        if (!window.CONFIG.API_BASE_URL.includes('localhost:5000') && 
            !window.CONFIG.API_BASE_URL.includes('127.0.0.1:5000')) {
            window.CONFIG.API_BASE_URL = 'http://localhost:5000';
            console.log('🔧 URL del backend corregida a:', window.CONFIG.API_BASE_URL);
        }
    }
})();

console.log('🔧 Configuración de API:', window.CONFIG);
console.log('🔧 URL base del backend:', window.CONFIG?.API_BASE_URL);

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

// Helper genérico para POST/PUT/DELETE (compat con modo demo si lo necesitás luego)
async function makeApiCall(path, method = 'GET', data = null, extraHeaders = {}) {
  const url = `${window.CONFIG.API_BASE_URL}${path}`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...extraHeaders
  };

  const options = { method, headers };
  if (data !== null) options.body = JSON.stringify(data);

  const resp = await fetch(url, options);
  // Opcional: manejo uniforme de 401 como en apiGet
  if (resp.status === 401) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('jwtToken');
    window.location.replace('login.html');
    throw new Error('401 No autorizado');
  }
  return resp; // el caller ya está haciendo resp.ok / resp.text() / resp.json()
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

// Función para formatear fecha para input de tipo date
function formatDateForInput(dateValue) {
    if (!dateValue) return '';
    
    try {
        // Si ya es una fecha válida en formato ISO (YYYY-MM-DD)
        if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateValue;
        }
        
        // Si es una fecha ISO completa, extraer solo la parte de fecha
        if (typeof dateValue === 'string' && dateValue.includes('T')) {
            return dateValue.split('T')[0];
        }
        
        // Crear objeto Date y formatear
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';
        
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return '';
    }
}

// Render de datos del paciente con nuevo sistema de edición por secciones
function renderPatientSidebar(p) {
    const box = document.getElementById('sidebar-content');
    if (!box) return;
    box.innerHTML = `
        <div class="patient-data-container">
            <div class="patient-section" data-section="personal">
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
                <div class="editable-field">
                    <label>Email:</label>
                    <input type="email" id="edit-email" value="${p.email || p.Email || ''}" placeholder="Email del paciente" disabled>
                </div>
                <div class="editable-field">
                    <label>Fecha de Nacimiento:</label>
                    <input type="date" id="edit-fechaNacimiento" value="${formatDateForInput(p.fechaNacimiento || p.FechaNacimiento)}" disabled>
                </div>
                <div class="editable-field">
                    <label>Edad:</label>
                    <input type="text" id="edit-edad" value="${p.edad || p.Edad || ''}" placeholder="Edad (calculada automáticamente)" readonly style="background-color: #f3f4f6; color: #6b7280;">
                </div>
                <div class="editable-field">
                    <label>Peso (kg):</label>
                    <input type="number" id="edit-peso" value="${p.peso || p.Peso || ''}" placeholder="Peso en kilogramos" disabled>
                </div>
                <div class="editable-field">
                    <label>Altura (cm):</label>
                    <input type="number" id="edit-altura" value="${p.altura || p.Altura || ''}" placeholder="Altura en centímetros" disabled>
                </div>
                <div class="editable-field">
                    <label>Particular:</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="edit-particular" ${(p.particular || p.Particular) ? 'checked' : ''} disabled style="transform: scale(1.2);">
                        <span style="color: #6b7280; font-size: 0.9em;">Marcar si es paciente particular</span>
                    </div>
                </div>
                <div class="editable-field">
                    <label>Médico de Cabecera:</label>
                    <select id="edit-doctorCabecera" disabled style="width: 100%; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background-color: #f9fafb; color: #6b7280;">
                        <option value="">Seleccione un doctor</option>
                        <option value="Florencia San Juan" ${(p.doctorCabecera || p.DoctorCabecera) === 'Florencia San Juan' ? 'selected' : ''}>Florencia San Juan</option>
                        <option value="Iñaki Gonzalez" ${(p.doctorCabecera || p.DoctorCabecera) === 'Iñaki Gonzalez' ? 'selected' : ''}>Iñaki Gonzalez</option>
                    </select>
                </div>
                <div class="section-actions hidden">
                    <button class="btn-save-section" onclick="saveSection('personal')">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
            
            <!-- Los botones de Medicación y Antecedentes ahora están en el header principal -->
            <textarea id="edit-medicacion" style="display: none;">${p.medicacion || p.Medicacion || ''}</textarea>
            <textarea id="edit-antecedentes" style="display: none;">${p.antecedentes || p.Antecedentes || ''}</textarea>
        </div>
    `;
    
    // Configurar eventos de edición
    setupEditEvents();
    
    // Configurar evento para calcular edad automáticamente
    const fechaNacimientoInput = document.getElementById('edit-fechaNacimiento');
    const edadInput = document.getElementById('edit-edad');
    
    if (fechaNacimientoInput && edadInput) {
        fechaNacimientoInput.addEventListener('change', function() {
            if (this.value) {
                const fechaNacimiento = new Date(this.value);
                const hoy = new Date();
                let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const mes = hoy.getMonth() - fechaNacimiento.getMonth();
                
                if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                    edad--;
                }
                
                edadInput.value = edad;
            } else {
                edadInput.value = '';
            }
        });
    }
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
    
    // Para la sección personal, el botón de editar está en el sidebar-header
    let editButton, saveButton;
    if (section === 'personal') {
        editButton = document.querySelector('.btn-edit-sidebar');
        saveButton = sectionElement.querySelector('.section-actions');
    } else {
        editButton = sectionElement.querySelector('.btn-edit-section');
        saveButton = sectionElement.querySelector('.section-actions');
    }
    
    const fields = getSectionFields(section);
    
    if (fields.length === 0) {
        console.error(`❌ No se encontraron campos para la sección: ${section}`);
        return;
    }
    
    const isEditing = !fields[0].disabled;
    
    if (isEditing) {
        // Cancelar edición
        fields.forEach(field => field.disabled = true);
        if (editButton) {
            editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
            editButton.classList.remove('editing');
        }
        if (saveButton) {
            saveButton.classList.add('hidden');
        }
        console.log(`❌ Edición cancelada para sección: ${section}`);
    } else {
        // Activar edición
        fields.forEach(field => field.disabled = false);
        if (editButton) {
            editButton.innerHTML = '<i class="fas fa-times"></i> Cancelar';
            editButton.classList.add('editing');
        }
        if (saveButton) {
            saveButton.classList.remove('hidden');
        }
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
                document.getElementById('edit-telefono'),
                document.getElementById('edit-email'),
                document.getElementById('edit-fechaNacimiento'),
                document.getElementById('edit-peso'),
                document.getElementById('edit-altura'),
                document.getElementById('edit-particular'),
                document.getElementById('edit-doctorCabecera')
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
    
    if (!patientId) {
        console.error('❌ No se encontró ID del paciente en la URL');
        showErrorMessage('Error: No se encontró ID del paciente');
        return;
    }
    
    switch (section) {
        case 'personal':
            sectionData.nombre = document.getElementById('edit-nombre')?.value?.trim() || '';
            sectionData.apellido = document.getElementById('edit-apellido')?.value?.trim() || '';
            sectionData.dni = document.getElementById('edit-dni')?.value?.trim() || '';
            sectionData.numeroAfiliado = document.getElementById('edit-numeroAfiliado')?.value?.trim() || null;
            sectionData.obraSocial = document.getElementById('edit-obraSocial')?.value?.trim() || null;
            sectionData.telefono = document.getElementById('edit-telefono')?.value?.trim() || null;
            sectionData.email = document.getElementById('edit-email')?.value?.trim() || null;
            sectionData.fechaNacimiento = document.getElementById('edit-fechaNacimiento')?.value || null;
            sectionData.peso = document.getElementById('edit-peso')?.value ? parseFloat(document.getElementById('edit-peso').value) : null;
            sectionData.altura = document.getElementById('edit-altura')?.value ? parseInt(document.getElementById('edit-altura').value) : null;
            sectionData.particular = document.getElementById('edit-particular')?.checked || false;
            sectionData.doctorCabecera = document.getElementById('edit-doctorCabecera')?.value?.trim() || null;
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
        
        // Mostrar QR del paciente si existe
        mostrarQrPaciente(paciente);
                
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

// Mostrar QR del paciente en la barra superior
function mostrarQrPaciente(paciente) {
    const qrDisplayContainer = document.getElementById('qrDisplayContainer');
    const qrDisplayImage = document.getElementById('qrDisplayImage');
    const btnQrPaciente = document.getElementById('btnQrPaciente');
    
    if (!qrDisplayContainer || !qrDisplayImage) return;
    
    const imagenQr = paciente.imagenQr || paciente.ImagenQr;
    if (imagenQr) {
        // Construir URL del QR
        const qrUrl = imagenQr.startsWith('http') 
            ? imagenQr 
            : `${window.CONFIG?.API_BASE_URL || window.location.origin}/api/pacientes/archivos/${imagenQr}`;
        
        qrDisplayImage.src = qrUrl;
        qrDisplayContainer.style.display = 'block';
        if (btnQrPaciente) {
            btnQrPaciente.innerHTML = '<i class="fas fa-edit"></i> Editar QR';
        }
        console.log('📷 QR del paciente cargado:', imagenQr);
    } else {
        qrDisplayContainer.style.display = 'none';
        if (btnQrPaciente) {
            btnQrPaciente.innerHTML = '<i class="fas fa-qrcode"></i> QR';
        }
    }
}

// Función global para abrir modal QR
window.abrirModalQr = function() {
    const modal = document.getElementById('modalQrPaciente');
    if (!modal) {
        console.error('❌ Modal QR no encontrado');
        return;
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('show');
    
    // Cargar QR existente si hay
    const patientId = getPatientIdFromUrl();
    if (patientId) {
        cargarQrExistente(patientId);
    }
};

// Cargar QR existente del paciente
async function cargarQrExistente(patientId) {
    try {
        const paciente = await apiGet(`/api/pacientes/${patientId}`);
        const imagenQr = paciente.imagenQr || paciente.ImagenQr;
        const qrExistenteContainer = document.getElementById('qrExistenteContainer');
        const qrExistenteImage = document.getElementById('qrExistenteImage');
        
        if (imagenQr && qrExistenteContainer && qrExistenteImage) {
            const qrUrl = imagenQr.startsWith('http') 
                ? imagenQr 
                : `${window.CONFIG?.API_BASE_URL || window.location.origin}/api/pacientes/archivos/${imagenQr}`;
            
            qrExistenteImage.src = qrUrl;
            qrExistenteImage.onclick = () => window.open(qrUrl, '_blank');
            qrExistenteContainer.style.display = 'block';
            document.getElementById('qrUploadText').textContent = 'Reemplazar imagen QR';
        } else {
            if (qrExistenteContainer) qrExistenteContainer.style.display = 'none';
            document.getElementById('qrUploadText').textContent = 'Seleccionar imagen QR desde galería';
        }
    } catch (error) {
        console.error('Error al cargar QR existente:', error);
    }
}

// Cargar consultas del paciente
async function loadPatientConsultations(patientId) {
    try {
        showHCLoading();
        
        // Intentar primero la ruta específica de consultas
        try {
            const consultas = await apiGet(`/api/pacientes/${patientId}/consultas`);
            console.log('🔍 Debug - Consultas obtenidas desde API específica:', consultas);
            renderConsultas(consultas);
            return;
        } catch (err) {
            console.log('⚠️ Ruta específica falló, intentando desde datos del paciente...', err);
        }
        
        // Si falla, intentar obtener las consultas desde los datos del paciente
        const paciente = await apiGet(`/api/pacientes/${patientId}`);
        console.log('🔍 Debug - Paciente obtenido:', paciente);
        if (paciente && paciente.consultas) {
            console.log('🔍 Debug - Consultas desde datos del paciente:', paciente.consultas);
            renderConsultas(paciente.consultas);
            } else {
            console.log('⚠️ No se encontraron consultas en los datos del paciente');
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

// Función para verificar si una consulta tiene valores de laboratorio
function tieneValoresLaboratorio(consulta) {
    const labKeys = [
        'gr', 'GR', 'hto', 'HTO', 'hb', 'HB', 'gb', 'GB', 'plaq', 'PLAQ',
        'gluc', 'GLUC', 'urea', 'UREA', 'cr', 'CR', 'vfg', 'VFG', 'got', 'GOT',
        'gpt', 'GPT', 'ct', 'CT', 'tg', 'TG', 'vitd', 'VITD', 'fal', 'FAL',
        'hdl', 'HDL', 'ldl', 'LDL', 'b12', 'B12', 'tsh', 'TSH', 't4l', 'T4L',
        'orina', 'ORINA', 'urico', 'URICO', 'psa', 'PSA', 'hba1c', 'HBA1C',
        'valoresNoIncluidos', 'ValoresNoIncluidos'
    ];
    
    // Verificar si hay algún valor de laboratorio presente
    for (const key of labKeys) {
        const value = consulta[key];
        if (value !== null && value !== undefined && value !== '') {
            return true;
        }
    }
    
    return false;
}

// Función para renderizar valores de laboratorio
function renderLaboratorioValues(consulta) {
    
    // Función auxiliar para obtener el valor de laboratorio
    function coalesce(obj, keys) {
        for (const k of keys) {
            const v = obj?.[k];
            if (v !== undefined && v !== null && v !== '') return v;
        }
        return null;
    }

    function getLabValue(consulta, ...keys) {
        const variants = new Set();

        for (const k of keys) {
            // variantes básicas
            variants.add(k);
            variants.add(k.toLowerCase());
            variants.add(k.toUpperCase());

            // casos especiales
            if (k.toLowerCase() === 'hba1c') {
                ['HbA1c','HbA1C','hbA1C'].forEach(v => variants.add(v));
            }
            if (k.toLowerCase() === 't4l') {
                ['T4L','t4L'].forEach(v => variants.add(v));
            }
            if (k.toLowerCase() === 'ct') { // colesterol total
                ['col','Col','COL'].forEach(v => variants.add(v));
            }
        }

        for (const v of variants) {
            const val = consulta?.[v];
            if (val !== undefined && val !== null && val !== '') return val;
        }
        return null;
    }
    
    const labValues = [
        { key: 'gr', label: 'GR (Glóbulos Rojos)', value: getLabValue(consulta, 'gr', 'GR') },
        { key: 'hto', label: 'HTO (Hematocrito)', value: getLabValue(consulta, 'hto', 'HTO') },
        { key: 'hb', label: 'HB (Hemoglobina)', value: getLabValue(consulta, 'hb', 'HB') },
        { key: 'gb', label: 'GB (Glóbulos Blancos)', value: getLabValue(consulta, 'gb', 'GB') },
        { key: 'plaq', label: 'PLAQ (Plaquetas)', value: getLabValue(consulta, 'plaq', 'PLAQ') },
        { key: 'gluc', label: 'GLUC (Glucosa)', value: getLabValue(consulta, 'gluc', 'GLUC') },
        { key: 'urea', label: 'UREA', value: getLabValue(consulta, 'urea', 'UREA') },
        { key: 'cr', label: 'CR (Creatinina)', value: getLabValue(consulta, 'cr', 'CR') },
        { key: 'vfg', label: 'VFG (Velocidad de Filtración Glomerular)', value: getLabValue(consulta, 'vfg', 'VFG') },
        { key: 'got', label: 'GOT', value: getLabValue(consulta, 'got', 'GOT') },
        { key: 'gpt', label: 'GPT', value: getLabValue(consulta, 'gpt', 'GPT') },
        { key: 'ct', label: 'CT (Colesterol Total)', value: getLabValue(consulta, 'ct', 'CT', 'col', 'Col', 'COL') },
        { key: 'tg', label: 'TG (Triglicéridos)', value: getLabValue(consulta, 'tg', 'TG') },
        { key: 'vitd', label: 'VITD (Vitamina D)', value: getLabValue(consulta, 'vitd', 'VITD') },
        { key: 'fal', label: 'FAL (Fosfatasa Alcalina)', value: getLabValue(consulta, 'fal', 'FAL') },
        { key: 'hdl', label: 'HDL (Colesterol HDL)', value: getLabValue(consulta, 'hdl', 'HDL') },
        { key: 'ldl', label: 'LDL (Colesterol LDL)', value: getLabValue(consulta, 'ldl', 'LDL') },
        { key: 'b12', label: 'B12 (Vitamina B12)', value: getLabValue(consulta, 'b12', 'B12') },
        { key: 'tsh', label: 'TSH', value: getLabValue(consulta, 'tsh', 'TSH') },
        { key: 't4l', label: 'T4L', value: getLabValue(consulta, 't4l', 'T4L', 't4L') },
        { key: 'orina', label: 'ORINA', value: getLabValue(consulta, 'orina', 'ORINA') },
        { key: 'urico', label: 'URICO (Ácido Úrico)', value: getLabValue(consulta, 'urico', 'URICO') },
        { key: 'psa', label: 'PSA (Antígeno Prostático Específico)', value: getLabValue(consulta, 'psa', 'PSA') },
        { key: 'hba1c', label: 'HBA1C (Hemoglobina Glicosilada)', value: getLabValue(consulta, 'hba1c', 'HBA1C', 'HbA1c', 'HbA1C', 'hbA1C') },
        { key: 'valoresNoIncluidos', label: 'Valores no incluidos', value: getLabValue(consulta, 'valoresNoIncluidos', 'ValoresNoIncluidos') }
    ];

    // Filtrar valores que tienen datos
    const valoresConDatos = labValues.filter(item => item.value !== null && item.value !== undefined && item.value !== '');

    // Obtener campos resaltados de la consulta
    const camposResaltados = consulta.camposResaltados || consulta.CamposResaltados || [];
    console.log('🔍 Campos resaltados en consulta:', camposResaltados);
    console.log('🔍 Consulta completa:', consulta);
    
    // Obtener fecha del laboratorio
    const fechaLaboratorio = consulta.fechaLaboratorio || consulta.FechaLaboratorio;
    const fechaLabHTML = fechaLaboratorio ? 
        `<div class="lab-date-info"><strong>Fecha del Laboratorio:</strong> ${new Date(fechaLaboratorio).toLocaleDateString()}</div>` : '';
    
    const labHTML = fechaLabHTML + valoresConDatos
        .map(item => {
            // Verificar si este campo está resaltado
            const isHighlighted = camposResaltados.includes(item.key.toLowerCase());
            const labelClass = isHighlighted ? 'lab-label highlighted' : 'lab-label';
            
            if (isHighlighted) {
                console.log(`🔴 Campo ${item.key} está resaltado - aplicando clase: ${labelClass}`);
            }
            
            return `
                <div class="lab-value-item">
                    <span class="${labelClass}">${item.label}:</span>
                    <span class="lab-value">${item.value}</span>
                    </div>
                `;
        }).join('');

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

// Renderizar archivos adjuntos
function renderArchivosAdjuntos(archivos) {
    if (!archivos || !Array.isArray(archivos) || archivos.length === 0) {
        return '';
    }
    
    // Separar archivos QR de otros archivos
    const archivosQr = archivos.filter(a => a.esQr || (a.extension && ['.jpg', '.jpeg', '.png', '.gif'].includes(a.extension.toLowerCase()) && (a.nombreOriginal || a.NombreOriginal || '').toLowerCase().includes('qr')));
    const otrosArchivos = archivos.filter(a => !archivosQr.includes(a));
    
    let html = '';
    
    // Mostrar imagen QR primero si existe
    if (archivosQr.length > 0) {
        const qrHtml = archivosQr.map(archivo => {
            const fileSize = formatFileSize(archivo.tamañoBytes || archivo.TamañoBytes);
            const fileName = archivo.nombreOriginal || archivo.NombreOriginal;
            const downloadUrl = archivo.urlDescarga || archivo.UrlDescarga || `/api/pacientes/archivos/${archivo.nombreArchivo || archivo.NombreArchivo}`;
            const imageUrl = `${window.CONFIG?.API_BASE_URL || window.location.origin}${downloadUrl}`;
            
            return `
                <div class="archivo-qr-item" style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%); border-radius: 12px; border: 2px solid #667eea;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                        <i class="fas fa-qrcode" style="font-size: 1.5em; color: #667eea;"></i>
                        <div style="flex: 1;">
                            <strong style="color: #667eea; display: block;">Imagen QR</strong>
                            <small style="color: #6b7280;">${fileName} (${fileSize})</small>
                        </div>
                        <a href="${downloadUrl}" target="_blank" class="btn btn-primary btn-sm" style="text-decoration: none;">
                            <i class="fas fa-download"></i> Ver/Descargar
                        </a>
                    </div>
                    <div style="text-align: center; margin-top: 10px;">
                        <img src="${imageUrl}" alt="QR Code" style="max-width: 200px; max-height: 200px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer;" onclick="window.open('${downloadUrl}', '_blank')">
                    </div>
                </div>
            `;
        }).join('');
        
        html += `
            <div class="qr-section" style="margin-bottom: 20px;">
                <strong><i class="fas fa-qrcode"></i> Imagen QR:</strong>
                ${qrHtml}
            </div>
        `;
    }
    
    // Mostrar otros archivos
    if (otrosArchivos.length > 0) {
        const archivosHtml = otrosArchivos.map(archivo => {
            const iconClass = getFileIcon(archivo.extension || archivo.Extension);
            const fileSize = formatFileSize(archivo.tamañoBytes || archivo.TamañoBytes);
            const fileName = archivo.nombreOriginal || archivo.NombreOriginal;
            const downloadUrl = archivo.urlDescarga || archivo.UrlDescarga || `/api/pacientes/archivos/${archivo.nombreArchivo || archivo.NombreArchivo}`;
            
            return `
                <div class="archivo-adjunto">
                    <div class="archivo-info">
                        <i class="fas ${iconClass}"></i>
                        <div class="archivo-details">
                            <a href="${downloadUrl}" target="_blank" class="archivo-link">${fileName}</a>
                            <small class="archivo-size">${fileSize}</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        html += `
            <div class="archivos-section">
                <div class="detail-item">
                    <strong><i class="fas fa-paperclip"></i> Archivos Adjuntos (${otrosArchivos.length}):</strong>
                    <div class="archivos-lista">
                        ${archivosHtml}
                    </div>
                </div>
            </div>
        `;
    }
    
    return html;
}
        
// Obtener icono según extensión del archivo
function getFileIcon(extension) {
    if (!extension) return 'fa-file';
    
    const ext = extension.toLowerCase();
    if (ext === '.pdf') return 'fa-file-pdf';
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) return 'fa-file-image';
    if (['.doc', '.docx'].includes(ext)) return 'fa-file-word';
    if (['.xls', '.xlsx'].includes(ext)) return 'fa-file-excel';
    if (['.txt'].includes(ext)) return 'fa-file-alt';
    return 'fa-file';
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para renderizar RECETAR con botón de confirmación
function renderRecetarConBoton(consulta) {
    const recetar = consulta.recetar || consulta.Recetar;
    const recetarRevisado = consulta.recetarRevisado || consulta.RecetarRevisado;
    
    if (!recetar || recetar.trim() === '') {
        return '';
    }
    
    let html = `<div class="detail-item recetar-item" style="display: flex; flex-direction: column; gap: 12px; padding: 16px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px; margin: 8px 0;">`;
    
    // Contenido principal con mejor estructura
    html += `<div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="min-width: 80px; font-weight: 700; color: #92400e; font-size: 0.95em;">Recetar:</div>
        <div style="flex: 1; color: #451a03; line-height: 1.5; font-size: 0.95em; white-space: pre-wrap;">${formatTextWithLineBreaks(recetar)}</div>
    </div>`;
    
    // Controles de revisión con mejor alineación
    if (!recetarRevisado) {
        const consultaId = consulta.id || consulta.Id;
        console.log(`🔧 Generando botón RECETAR para consulta ${consultaId}`);
        html += `<div class="revision-controls-historial" style="display: flex; justify-content: flex-end; margin-top: 8px;">
            <button type="button" class="btn btn-success btn-sm marcar-revisado-btn" data-consulta-id="${consultaId}" data-campo="recetar" style="padding: 8px 16px; border-radius: 6px; font-size: 0.85em; font-weight: 600; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: white; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                <i class="fas fa-check"></i> Realizado
            </button>
        </div>`;
            } else {
        html += `<div class="revision-status-historial" style="display: flex; justify-content: flex-end; margin-top: 8px;">
            <span class="revision-status" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; border-radius: 6px; font-size: 0.85em; font-weight: 600; border: 1px solid #a7f3d0;">
                <i class="fas fa-check-circle"></i>
                Revisado
            </span>
        </div>`;
    }
    
    html += `</div>`;
    return html;
}

// Función para renderizar OME con botón de confirmación
function renderOmeConBoton(consulta) {
    const ome = consulta.ome || consulta.Ome;
    const omeRevisado = consulta.omeRevisado || consulta.OmeRevisado;
    
    if (!ome || ome.trim() === '') {
        return '';
    }
    
    let html = `<div class="detail-item ome-item" style="display: flex; flex-direction: column; gap: 12px; padding: 16px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #ef4444; border-radius: 8px; margin: 8px 0;">`;
    
    // Contenido principal con mejor estructura
    html += `<div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="min-width: 80px; font-weight: 700; color: #dc2626; font-size: 0.95em;">OME:</div>
        <div style="flex: 1; color: #7f1d1d; line-height: 1.5; font-size: 0.95em; white-space: pre-wrap;">${formatTextWithLineBreaks(ome)}</div>
    </div>`;
    
    // Controles de revisión con mejor alineación
    if (!omeRevisado) {
        const consultaId = consulta.id || consulta.Id;
        console.log(`🔧 Generando botón OME para consulta ${consultaId}`);
        html += `<div class="revision-controls-historial" style="display: flex; justify-content: flex-end; margin-top: 8px;">
            <button type="button" class="btn btn-success btn-sm marcar-revisado-btn" data-consulta-id="${consultaId}" data-campo="ome" style="padding: 8px 16px; border-radius: 6px; font-size: 0.85em; font-weight: 600; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: white; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                <i class="fas fa-check"></i> Realizado
            </button>
        </div>`;
    } else {
        html += `<div class="revision-status-historial" style="display: flex; justify-content: flex-end; margin-top: 8px;">
            <span class="revision-status" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; border-radius: 6px; font-size: 0.85em; font-weight: 600; border: 1px solid #a7f3d0;">
                <i class="fas fa-check-circle"></i>
                Revisado
            </span>
        </div>`;
    }
    
    html += `</div>`;
    return html;
}

// Renderizar consultas
function renderConsultas(consultas) {
    console.log('🎨 Renderizando consultas:', consultas);
    const hcBody = document.getElementById('hc-body');
    if (!hcBody) {
        console.error('❌ No se encontró el elemento hc-body');
        return;
    }
        
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
        
        // Ordenar consultas por fecha (más recientes primero)
        const consultasOrdenadas = [...consultas].sort((a, b) => {
            const fechaA = new Date(a.fecha || a.Fecha || 0);
            const fechaB = new Date(b.fecha || b.Fecha || 0);
            return fechaB - fechaA; // Orden descendente (más reciente primero)
        });
        
        console.log('📋 Consultas ordenadas:', consultasOrdenadas);
        window._consultasActuales = consultasOrdenadas;
        const consultasHtml = consultasOrdenadas.map(consulta => `
            <div class="consulta-item">
                <div class="consulta-header" onclick="toggleConsultaDetalle(this)">
                    <div class="consulta-fecha">
                        <i class="fas fa-calendar-alt"></i>
                    <span>${new Date(consulta.fecha || consulta.Fecha).toLocaleDateString()}</span>
                    </div>
                    <div class="consulta-actions">
                    <button class="btn-modalidad-consulta ${(consulta.modalidad || consulta.Modalidad || 'Presencial').toLowerCase() === 'virtual' ? 'btn-modalidad-virtual' : ''}" onclick="toggleModalidad(event, ${consulta.id || consulta.Id})" title="Cambiar modalidad">
                        <i class="fas fa-${(consulta.modalidad || consulta.Modalidad || 'Presencial').toLowerCase() === 'virtual' ? 'video' : 'user'}"></i>
                        <span class="modalidad-texto">${consulta.modalidad || consulta.Modalidad || 'Presencial'}</span>
                    </button>
                    <button class="btn-editar-consulta" onclick="editarConsulta(${consulta.id || consulta.Id})" title="Editar consulta">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-eliminar-consulta" onclick="eliminarConsulta(${consulta.id || consulta.Id})" title="Eliminar consulta">
                        <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                        <i class="fas fa-chevron-down toggle-icon"></i>
                    </div>
                </div>
                <div class="consulta-content collapsed">
                    <div class="consulta-details">
                    ${consulta.motivo || consulta.Motivo ? `<div class="detail-item"><strong>Motivo:</strong> <span style="white-space: pre-wrap;">${formatTextWithLineBreaks(consulta.motivo || consulta.Motivo)}</span></div>` : ''}
                    ${renderRecetarConBoton(consulta)}
                    ${renderOmeConBoton(consulta)}
                    ${consulta.notas || consulta.Notas ? `<div class="detail-item"><strong>Notas:</strong> <span style="white-space: pre-wrap;">${formatTextWithLineBreaks(consulta.notas || consulta.Notas)}</span></div>` : ''}
                    
                    <!-- Archivos adjuntos -->
                    ${renderArchivosAdjuntos(consulta.archivos || consulta.Archivos)}
                    </div>
                
                ${tieneValoresLaboratorio(consulta) ? `
                <!-- Botón para ver valores de laboratorio (solo si hay valores) -->
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
                ` : ''}
                </div>
            </div>
        `).join('');
        
        hcBody.innerHTML = consultasHtml;
        console.log('✅ Consultas renderizadas exitosamente. HTML generado:', consultasHtml.length, 'caracteres');
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

    // Función para alternar modalidad Presencial/Virtual
    window.toggleModalidad = async function(event, consultaId) {
        event.stopPropagation();
        const patientId = getPatientIdFromUrl();
        const btn = event.currentTarget;
        const span = btn.querySelector('.modalidad-texto');
        const icon = btn.querySelector('i');
        const actual = (span?.textContent || 'Presencial').trim();
        const nueva = actual.toLowerCase() === 'presencial' ? 'Virtual' : 'Presencial';
        try {
            const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}/consultas/${consultaId}/modalidad`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ modalidad: nueva })
            });
            if (!response.ok) throw new Error('Error al actualizar modalidad');
            if (span) span.textContent = nueva;
            if (icon) icon.className = nueva === 'Virtual' ? 'fas fa-video' : 'fas fa-user';
            btn.classList.toggle('btn-modalidad-virtual', nueva === 'Virtual');
            // Actualizar en el estado local de consultas si existe
            const consultas = window._consultasActuales || [];
            const idx = consultas.findIndex(c => (c.id || c.Id) === consultaId);
            if (idx >= 0) {
                consultas[idx].modalidad = consultas[idx].Modalidad = nueva;
            }
        } catch (err) {
            console.error('Error al cambiar modalidad:', err);
            alert('No se pudo actualizar la modalidad. Intente de nuevo.');
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
let archivosListEditar = []; // Archivos nuevos seleccionados para subir
let archivosExistentesEditar = []; // Archivos que ya están en el servidor

// Funciones globales para manejo de archivos en modal de editar
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

function mostrarArchivosSeleccionadosEditar() {
    const archivosSeleccionadosEditar = document.getElementById('archivosSeleccionadosEditar');
    if (!archivosSeleccionadosEditar) return;

    // Combinar archivos existentes y nuevos
    const todosLosArchivos = [];
    
    // Agregar archivos existentes (ya en el servidor)
    archivosExistentesEditar.forEach((archivo, index) => {
        todosLosArchivos.push({
            ...archivo,
            esExistente: true,
            indice: index
        });
    });
    
    // Agregar archivos nuevos (seleccionados para subir)
    archivosListEditar.forEach((file, index) => {
        todosLosArchivos.push({
            name: file.name,
            size: file.size,
            esExistente: false,
            indice: index,
            file: file // Mantener referencia al File object
        });
    });

    if (todosLosArchivos.length === 0) {
        archivosSeleccionadosEditar.innerHTML = '';
        return;
    }

    const archivosHTML = todosLosArchivos.map((item, index) => {
        const iconClass = item.esExistente 
            ? getIconClass(item.nombreOriginal || item.NombreOriginal || item.name)
            : getIconClass(item.name);
        const fileSize = item.esExistente
            ? formatFileSize(item.tamañoBytes || item.TamañoBytes || 0)
            : formatFileSize(item.size);
        const fileName = item.esExistente
            ? (item.nombreOriginal || item.NombreOriginal || item.name)
            : item.name;
        const badge = item.esExistente 
            ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; margin-left: 8px;">Existente</span>'
            : '<span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; margin-left: 8px;">Nuevo</span>';
        
        return `
            <div class="archivo-item">
                <div class="archivo-info">
                    <div class="archivo-icono ${iconClass}">
                        <i class="fas ${item.esExistente 
                            ? getIconName(item.nombreOriginal || item.NombreOriginal || item.name)
                            : getIconName(item.name)}"></i>
                    </div>
                    <div>
                        <div class="archivo-nombre">${fileName} ${badge}</div>
                        <div class="archivo-tamaño">${fileSize}</div>
                    </div>
                </div>
                <button type="button" class="btn-eliminar-archivo" onclick="eliminarArchivoEditar(${index}, ${item.esExistente ? 'true' : 'false'})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');

    archivosSeleccionadosEditar.innerHTML = archivosHTML;
}

function handleArchivosSeleccionadosEditar(event) {
    const files = Array.from(event.target.files);
    
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
        if (!archivosListEditar.find(f => f.name === file.name)) {
            archivosListEditar.push(file);
        }
    });

    // Actualizar la visualización
    mostrarArchivosSeleccionadosEditar();
}

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

    // Toggle secciones desplegables (Planilla Parkinson, Valores de Laboratorio)
    document.addEventListener('click', function(e) {
        const header = e.target.closest('.collapsible-header');
        if (!header) return;
        const targetId = header.getAttribute('data-toggle');
        if (!targetId) return;
        const content = document.getElementById(targetId);
        const chevron = header.querySelector('.toggle-chevron');
        if (content) {
            const isHidden = content.style.display === 'none' || content.style.display === '';
            content.style.display = isHidden ? 'block' : 'none';
            if (chevron) chevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
        }
    });

    // Función para plegar laboratorio y planilla al abrir el modal
    window.colapsarSeccionesNuevaConsulta = function() {
        ['labGridNuevaConsultaWrap', 'planillaParkinsonContent', 'qrUploadNuevaConsultaWrap'].forEach(id => {
            const el = document.getElementById(id);
            const header = document.querySelector('.collapsible-header[data-toggle="' + id + '"]');
            if (el) el.style.display = 'none';
            if (header) {
                const ch = header.querySelector('.toggle-chevron');
                if (ch) ch.style.transform = 'rotate(-90deg)';
            }
        });
    };

    // Configurar manejo de imagen QR
    const imagenQrInput = document.getElementById('imagenQrConsulta');
    const qrPreviewContainer = document.getElementById('qrPreviewContainer');
    const qrPreview = document.getElementById('qrPreview');
    const eliminarQrBtn = document.getElementById('eliminarQr');

    if (imagenQrInput) {
        imagenQrInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validar que sea una imagen
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecciona un archivo de imagen válido');
                    e.target.value = '';
                    return;
                }

                // Validar tamaño (10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    alert('La imagen es demasiado grande. El tamaño máximo es 10MB');
                    e.target.value = '';
                    return;
                }

                // Mostrar vista previa
                const reader = new FileReader();
                reader.onload = function(e) {
                    qrPreview.src = e.target.result;
                    qrPreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
                console.log('📷 Imagen QR seleccionada:', file.name);
            }
        });
    }

    // Botón para eliminar imagen QR
    if (eliminarQrBtn) {
        eliminarQrBtn.addEventListener('click', function() {
            if (imagenQrInput) {
                imagenQrInput.value = '';
            }
            if (qrPreview) {
                qrPreview.src = '';
            }
            if (qrPreviewContainer) {
                qrPreviewContainer.style.display = 'none';
            }
            console.log('🗑️ Imagen QR eliminada');
        });
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
                if (window.colapsarSeccionesNuevaConsulta) window.colapsarSeccionesNuevaConsulta();
                // Enfocar el primer campo
                const motivoField = document.getElementById('motivoConsulta');
                if (motivoField) {
                    motivoField.focus();
                    console.log('🎯 Campo motivo enfocado');
                }
                
                // Configurar event listeners para los campos de laboratorio en el modal
                setTimeout(() => {
                    if (window.setupLabLabelClickHandlers) window.setupLabLabelClickHandlers(modalNuevaConsulta);
                }, 100);
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
            // Limpiar imagen QR
            const imagenQrInput = document.getElementById('imagenQrConsulta');
            const qrPreviewContainer = document.getElementById('qrPreviewContainer');
            const qrPreview = document.getElementById('qrPreview');
            if (imagenQrInput) imagenQrInput.value = '';
            if (qrPreview) qrPreview.src = '';
            if (qrPreviewContainer) qrPreviewContainer.style.display = 'none';
            // Limpiar campos resaltados
            clearHighlightedFields();
        }
    }

    // Event listeners para cerrar modal
    if (closeModalNuevaConsulta) {
        closeModalNuevaConsulta.addEventListener('click', closeModal);
    }

    if (cancelarNuevaConsulta) {
        cancelarNuevaConsulta.addEventListener('click', closeModal);
    }

    // Cerrar modal al hacer clic fuera - DESHABILITADO
    // if (modalNuevaConsulta) {
    //     modalNuevaConsulta.addEventListener('click', (e) => {
    //         if (e.target === modalNuevaConsulta) {
    //             closeModal();
    //         }
    //     });
    // }

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
                
                // Procesar archivos adjuntos primero
                const archivosSubidos = [];
                const archivosInput = document.getElementById('archivosConsulta');
                
                if (archivosInput && archivosInput.files && archivosInput.files.length > 0) {
                    console.log(`📎 Subiendo ${archivosInput.files.length} archivos...`);
                    
                    for (let i = 0; i < archivosInput.files.length; i++) {
                        const archivo = archivosInput.files[i];
                        
                        // Crear FormData para subir el archivo
                        const archivoFormData = new FormData();
                        archivoFormData.append('archivo', archivo);
                        
                        try {
                            const uploadResponse = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/archivos/subir`, {
                                method: 'POST',
                                headers: getAuthHeaders(),
                                body: archivoFormData
                            });
                            
                            if (uploadResponse.ok) {
                                const archivoSubido = await uploadResponse.json();
                                archivosSubidos.push(archivoSubido);
                                console.log(`✅ Archivo subido: ${archivoSubido.nombreOriginal}`);
                            } else {
                                const errorText = await uploadResponse.text();
                                console.error(`❌ Error al subir archivo ${archivo.name}:`, errorText);
                                alert(`Error al subir archivo ${archivo.name}: ${errorText}`);
                                return;
                            }
                        } catch (error) {
                            console.error(`❌ Error de conexión al subir archivo ${archivo.name}:`, error);
                            alert(`Error de conexión al subir archivo ${archivo.name}`);
                            return;
                        }
                    }
                }

                // Procesar imagen QR si existe
                const imagenQrInput = document.getElementById('imagenQrConsulta');
                if (imagenQrInput && imagenQrInput.files && imagenQrInput.files.length > 0) {
                    const imagenQr = imagenQrInput.files[0];
                    console.log(`📷 Subiendo imagen QR: ${imagenQr.name}`);
                    
                    const qrFormData = new FormData();
                    qrFormData.append('archivo', imagenQr);
                    
                    try {
                        const uploadQrResponse = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/archivos/subir`, {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            body: qrFormData
                        });
                        
                        if (uploadQrResponse.ok) {
                            const qrSubido = await uploadQrResponse.json();
                            // Marcar como QR para identificarlo
                            qrSubido.esQr = true;
                            archivosSubidos.push(qrSubido);
                            console.log(`✅ Imagen QR subida: ${qrSubido.nombreOriginal}`);
                        } else {
                            const errorText = await uploadQrResponse.text();
                            console.error(`❌ Error al subir imagen QR:`, errorText);
                            alert(`Error al subir imagen QR: ${errorText}`);
                            return;
                        }
                    } catch (error) {
                        console.error(`❌ Error de conexión al subir imagen QR:`, error);
                        alert(`Error de conexión al subir imagen QR`);
                        return;
                    }
                }
                
                const consultaData = {
                    fecha: formData.get('fecha') || new Date().toISOString().split('T')[0],
                    fechaLaboratorio: formData.get('fechaLaboratorio') ? new Date(formData.get('fechaLaboratorio')).toISOString() : null,
                    motivo: formData.get('motivo'),
                    recetar: formData.get('recetar') || null,
                    ome: formData.get('ome') || null,
                    notas: formData.get('notas') || null,
                    // Valores de laboratorio completos (convertir comas a puntos para el backend)
                    gr: formData.get('gr') ? parseFloat(formData.get('gr').replace(',', '.')) : null,
                    hto: formData.get('hto') ? parseFloat(formData.get('hto').replace(',', '.')) : null,
                    hb: formData.get('hb') ? parseFloat(formData.get('hb').replace(',', '.')) : null,
                    gb: formData.get('gb') ? parseFloat(formData.get('gb').replace(',', '.')) : null,
                    plaq: formData.get('plaq') ? parseFloat(formData.get('plaq').replace(',', '.')) : null,
                    gluc: formData.get('gluc') ? parseFloat(formData.get('gluc').replace(',', '.')) : null,
                    urea: formData.get('urea') ? parseFloat(formData.get('urea').replace(',', '.')) : null,
                    cr: formData.get('cr') ? parseFloat(formData.get('cr').replace(',', '.')) : null,
                    vfg: formData.get('vfg') ? parseFloat(formData.get('vfg').replace(',', '.')) : null,
                    got: formData.get('got') ? parseFloat(formData.get('got').replace(',', '.')) : null,
                    gpt: formData.get('gpt') ? parseFloat(formData.get('gpt').replace(',', '.')) : null,
                    ct: formData.get('ct') ? parseFloat(formData.get('ct').replace(',', '.')) : null,
                    tg: formData.get('tg') ? parseFloat(formData.get('tg').replace(',', '.')) : null,
                    vitd: formData.get('vitd') ? parseFloat(formData.get('vitd').replace(',', '.')) : null,
                    fal: formData.get('fal') ? parseFloat(formData.get('fal').replace(',', '.')) : null,
                    hdl: formData.get('hdl') ? parseFloat(formData.get('hdl').replace(',', '.')) : null,
                    b12: formData.get('b12') ? parseFloat(formData.get('b12').replace(',', '.')) : null,
                    tsh: formData.get('tsh') ? parseFloat(formData.get('tsh').replace(',', '.')) : null,
                    t4l: formData.get('t4l') ? parseFloat(formData.get('t4l').replace(',', '.')) : null,
                    orina: formData.get('orina') || null,
                    urico: formData.get('urico') ? parseFloat(formData.get('urico').replace(',', '.')) : null,
                    ldl: formData.get('ldl') ? parseFloat(formData.get('ldl').replace(',', '.')) : null,
                    psa: formData.get('psa') ? parseFloat(formData.get('psa').replace(',', '.')) : null,
                    hba1c: formData.get('hba1c') ? parseFloat(formData.get('hba1c').replace(',', '.')) : null,
                    valoresNoIncluidos: formData.get('valoresNoIncluidos') || null,
                    // Incluir archivos subidos
                    archivos: archivosSubidos,
                    // Incluir campos resaltados (valores fuera de rango)
                    camposResaltados: window.getHighlightedFields ? window.getHighlightedFields(formNuevaConsulta) : []
                };

                // Validar motivo (requerido)
                if (!consultaData.motivo || consultaData.motivo.trim() === '') {
                    alert('El motivo de la consulta es requerido');
                    return;
                }

                console.log('📝 Creando nueva consulta:', consultaData);
                
                const patientId = getPatientIdFromUrl();
                
                // Enviar a la API usando makeApiCall para manejar modo demo
                const response = await makeApiCall(`/api/pacientes/${patientId}/consultas`, 'POST', consultaData);

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

    // Las funciones getIconClass, getIconName y formatFileSize
    // están declaradas globalmente arriba, fuera de esta función

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

    // ===== FUNCIONALIDAD DE ARCHIVOS PARA MODAL DE EDITAR CONSULTA =====
    // Las funciones handleArchivosSeleccionadosEditar y mostrarArchivosSeleccionadosEditar
    // están declaradas globalmente arriba, fuera de esta función
    
    // Función global para eliminar archivos en modal de editar
    window.eliminarArchivoEditar = function(index, esExistente) {
        if (esExistente) {
            // Eliminar de archivos existentes
            // El índice corresponde directamente al array de existentes
            archivosExistentesEditar.splice(index, 1);
            console.log('🗑️ Archivo existente eliminado. Restantes:', archivosExistentesEditar.length);
        } else {
            // Eliminar de archivos nuevos
            // El índice en el array combinado es: cantidad de existentes + índice en nuevos
            // Entonces el índice en el array de nuevos es: index - cantidad de existentes
            const indiceNuevo = index - archivosExistentesEditar.length;
            if (indiceNuevo >= 0 && indiceNuevo < archivosListEditar.length) {
                archivosListEditar.splice(indiceNuevo, 1);
                console.log('🗑️ Archivo nuevo eliminado. Restantes:', archivosListEditar.length);
            }
            
            // Actualizar el input de archivos
            const archivosInputEditar = document.getElementById('archivosEditarConsulta');
            if (archivosInputEditar) {
                const dt = new DataTransfer();
                archivosListEditar.forEach(file => dt.items.add(file));
                archivosInputEditar.files = dt.files;
            }
        }
        mostrarArchivosSeleccionadosEditar();
    };

    console.log('✅ Funcionalidad del modal de nueva consulta inicializada');
    
    // ===== FUNCIONALIDAD PARA FORMATO DE DECIMALES =====
    
    // Lista de todos los campos numéricos de laboratorio
    const camposLaboratorio = [
        'grConsulta', 'htoConsulta', 'hbConsulta', 'gbConsulta',
        'plaqConsulta', 'glucConsulta', 'ureaConsulta', 'crConsulta',
        'gotConsulta', 'gptConsulta', 'ctConsulta', 'tgConsulta',
        'vitdConsulta', 'falConsulta', 'hdlConsulta', 'ldlConsulta', 'b12Consulta',
        'tshConsulta', 't4lConsulta', 'uricoConsulta', 'psaConsulta', 'hba1cConsulta'
    ];
    
    // Función para formatear a 2 decimales
    function formatearADosDecimales(input) {
        if (input.value && input.value.trim() !== '') {
            // Limpiar el valor: solo números y comas
            let valorLimpio = input.value.replace(/[^0-9,]/g, '');
            
            // Si hay múltiples comas, tomar solo la primera
            const partes = valorLimpio.split(',');
            if (partes.length > 2) {
                valorLimpio = partes[0] + ',' + partes.slice(1).join('');
            }
            
            // Convertir a número
            const valor = parseFloat(valorLimpio.replace(',', '.'));
            if (!isNaN(valor) && valor >= 0) {
                input.value = valor.toFixed(2).replace('.', ',');
            } else if (valorLimpio !== '') {
                // Si no es un número válido, limpiar el campo
                input.value = '';
            }
        }
    }
    
    // Agregar event listeners a todos los campos de laboratorio
    camposLaboratorio.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            // Formatear cuando el usuario presiona Enter
            campo.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    formatearADosDecimales(this);
                    this.blur();
                }
            });
            
            // Validación de entrada en tiempo real
            campo.addEventListener('input', function(e) {
                let valor = e.target.value;
                
                // Reemplazar punto por coma automáticamente
                if (valor.includes('.')) {
                    valor = valor.replace('.', ',');
                }
                
                // Permitir solo números y comas
                valor = valor.replace(/[^0-9,]/g, '');
                
                // Limitar a una sola coma
                const partes = valor.split(',');
                if (partes.length > 2) {
                    // Si hay más de una coma, mantener solo la primera
                    valor = partes[0] + ',' + partes.slice(1).join('');
                }
                
                // Limitar decimales a máximo 2 dígitos
                if (partes.length === 2 && partes[1].length > 2) {
                    valor = partes[0] + ',' + partes[1].substring(0, 2);
                }
                
                e.target.value = valor;
            });
            
            // Validación adicional al perder el foco
            campo.addEventListener('blur', function() {
                formatearADosDecimales(this);
            });
        }
    });
    
    console.log('✅ Formato de decimales configurado para campos de laboratorio');
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

// ===== FUNCIONALIDAD DE MODALES DE MEDICACIÓN Y ANTECEDENTES =====

// Función para abrir modal de medicación
window.abrirModalMedicacion = function() {
    console.log('💊 Abriendo modal de medicación...');
    
    const modal = document.getElementById('modalMedicacion');
    const medicacionField = document.getElementById('edit-medicacion');
    const editarBtn = document.getElementById('editarModalMedicacion');
    
    if (!modal || !medicacionField || !editarBtn) {
        console.error('❌ Elementos del modal de medicación no encontrados');
        return;
    }
    
    // Asegurar que el modal esté en estado inicial
    restaurarEstadoModalMedicacion();
    
    // Obtener el elemento de texto (puede ser párrafo o textarea)
    let medicacionTexto = document.getElementById('medicacionTexto');
    
    // Si no existe el párrafo, crearlo
    if (!medicacionTexto) {
        const textarea = modal.querySelector('textarea');
        if (textarea) {
            // Crear nuevo párrafo
            medicacionTexto = document.createElement('p');
            medicacionTexto.id = 'medicacionTexto';
            textarea.parentNode.replaceChild(medicacionTexto, textarea);
        } else {
            // Buscar el contenedor y crear el párrafo
            const contenedor = modal.querySelector('.medicacion-info');
            if (contenedor) {
                medicacionTexto = document.createElement('p');
                medicacionTexto.id = 'medicacionTexto';
                contenedor.appendChild(medicacionTexto);
            }
        }
    }
    
    if (medicacionTexto) {
        // Obtener el texto de medicación
        const medicacion = medicacionField.value.trim();
        
        if (medicacion) {
            medicacionTexto.textContent = medicacion;
            medicacionTexto.style.color = '#374151';
            medicacionTexto.style.fontStyle = 'normal';
        } else {
            medicacionTexto.textContent = 'No hay información de medicación registrada.';
            medicacionTexto.style.color = '#9ca3af';
            medicacionTexto.style.fontStyle = 'italic';
        }
    }
    
    // Asegurar que el botón esté en estado "Editar"
    editarBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
    editarBtn.disabled = false;
    
    // Mostrar modal
    modal.classList.remove('hidden');
    modal.classList.add('show');
    
    console.log('✅ Modal de medicación abierto correctamente');
}

// Función para editar medicación
window.editarModalMedicacion = function(event) {
    console.log('✏️ Editando medicación...');
    
    // Prevenir la propagación del evento para evitar que se cierre el modal
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const medicacionTexto = document.getElementById('medicacionTexto');
    const editarBtn = document.getElementById('editarModalMedicacion');
    
    console.log('🔍 Elementos encontrados:', {
        medicacionTexto: !!medicacionTexto,
        editarBtn: !!editarBtn
    });
    
    if (!medicacionTexto || !editarBtn) {
        console.error('❌ Elementos para editar medicación no encontrados');
        return;
    }
    
    // Crear textarea para edición
    const textarea = document.createElement('textarea');
    textarea.value = medicacionTexto.textContent === 'No hay información de medicación registrada.' ? '' : medicacionTexto.textContent;
    textarea.style.width = '100%';
    textarea.style.minHeight = '150px';
    textarea.style.padding = '15px';
    textarea.style.border = '2px solid #667eea';
    textarea.style.borderRadius = '8px';
    textarea.style.fontSize = '1em';
    textarea.style.fontFamily = 'inherit';
    textarea.style.resize = 'vertical';
    textarea.placeholder = 'Ingrese la medicación actual del paciente...';
    
    // Reemplazar el párrafo con el textarea
    medicacionTexto.parentNode.replaceChild(textarea, medicacionTexto);
    
    // Cambiar botón a "Guardar"
    editarBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    
    // Enfocar el textarea
    textarea.focus();
    
    console.log('✅ Modo de edición activado para medicación');
}

// Función para guardar medicación
window.guardarMedicacion = async function(event) {
    console.log('💾 Guardando medicación...');
    
    // Prevenir la propagación del evento para evitar que se cierre el modal
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const textarea = document.querySelector('#modalMedicacion textarea');
    const editarBtn = document.getElementById('editarModalMedicacion');
    const medicacionField = document.getElementById('edit-medicacion');
    
    if (!textarea || !editarBtn || !medicacionField) {
        console.error('❌ Elementos para guardar medicación no encontrados');
        return;
    }
    
    const nuevaMedicacion = textarea.value.trim();
    
    try {
        // Mostrar loading en el botón
        editarBtn.disabled = true;
        editarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        // Actualizar el campo oculto
        medicacionField.value = nuevaMedicacion;
        
        // Guardar en la base de datos
        const patientId = getPatientIdFromUrl();
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}/actualizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ medicacion: nuevaMedicacion })
        });
        
        if (response.ok) {
            // Crear nuevo párrafo con el contenido actualizado
            const nuevoParrafo = document.createElement('p');
            nuevoParrafo.id = 'medicacionTexto';
            
            if (nuevaMedicacion) {
                nuevoParrafo.textContent = nuevaMedicacion;
                nuevoParrafo.style.color = '#374151';
                nuevoParrafo.style.fontStyle = 'normal';
            } else {
                nuevoParrafo.textContent = 'No hay información de medicación registrada.';
                nuevoParrafo.style.color = '#9ca3af';
                nuevoParrafo.style.fontStyle = 'italic';
            }
            
            // Reemplazar textarea con el párrafo
            textarea.parentNode.replaceChild(nuevoParrafo, textarea);
            
            // Restaurar botón
            editarBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
            editarBtn.disabled = false;
            
            console.log('✅ Medicación guardada exitosamente');
        } else {
            throw new Error('Error al guardar medicación');
        }
        
    } catch (error) {
        console.error('❌ Error al guardar medicación:', error);
        alert('Error al guardar la medicación');
        
        // Restaurar botón
        editarBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
        editarBtn.onclick = editarModalMedicacion;
        editarBtn.disabled = false;
    }
}

// Función para abrir modal de antecedentes
window.abrirModalAntecedentes = function() {
    console.log('📋 Abriendo modal de antecedentes...');
    
    const modal = document.getElementById('modalAntecedentes');
    const antecedentesField = document.getElementById('edit-antecedentes');
    const editarBtn = document.getElementById('editarModalAntecedentes');
    
    if (!modal || !antecedentesField || !editarBtn) {
        console.error('❌ Elementos del modal de antecedentes no encontrados');
        return;
    }
    
    // Asegurar que el modal esté en estado inicial
    restaurarEstadoModalAntecedentes();
    
    // Obtener el elemento de texto (puede ser párrafo o textarea)
    let antecedentesTexto = document.getElementById('antecedentesTexto');
    
    // Si no existe el párrafo, crearlo
    if (!antecedentesTexto) {
        const textarea = modal.querySelector('textarea');
        if (textarea) {
            // Crear nuevo párrafo
            antecedentesTexto = document.createElement('p');
            antecedentesTexto.id = 'antecedentesTexto';
            textarea.parentNode.replaceChild(antecedentesTexto, textarea);
        } else {
            // Buscar el contenedor y crear el párrafo
            const contenedor = modal.querySelector('.antecedentes-info');
            if (contenedor) {
                antecedentesTexto = document.createElement('p');
                antecedentesTexto.id = 'antecedentesTexto';
                contenedor.appendChild(antecedentesTexto);
            }
        }
    }
    
    if (antecedentesTexto) {
        // Obtener el texto de antecedentes
        const antecedentes = antecedentesField.value.trim();
        
        if (antecedentes) {
            antecedentesTexto.textContent = antecedentes;
            antecedentesTexto.style.color = '#374151';
            antecedentesTexto.style.fontStyle = 'normal';
        } else {
            antecedentesTexto.textContent = 'No hay antecedentes médicos registrados.';
            antecedentesTexto.style.color = '#9ca3af';
            antecedentesTexto.style.fontStyle = 'italic';
        }
    }
    
    // Asegurar que el botón esté en estado "Editar"
    editarBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
    editarBtn.disabled = false;
    
    // Mostrar modal
    modal.classList.remove('hidden');
    modal.classList.add('show');
    
    console.log('✅ Modal de antecedentes abierto correctamente');
}

// Función para editar antecedentes
window.editarModalAntecedentes = function(event) {
    console.log('✏️ Editando antecedentes...');
    
    // Prevenir la propagación del evento para evitar que se cierre el modal
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const antecedentesTexto = document.getElementById('antecedentesTexto');
    const editarBtn = document.getElementById('editarModalAntecedentes');
    
    console.log('🔍 Elementos encontrados:', {
        antecedentesTexto: !!antecedentesTexto,
        editarBtn: !!editarBtn
    });
    
    if (!antecedentesTexto || !editarBtn) {
        console.error('❌ Elementos para editar antecedentes no encontrados');
        return;
    }
    
    // Crear textarea para edición
    const textarea = document.createElement('textarea');
    textarea.value = antecedentesTexto.textContent === 'No hay antecedentes médicos registrados.' ? '' : antecedentesTexto.textContent;
    textarea.style.width = '100%';
    textarea.style.minHeight = '150px';
    textarea.style.padding = '15px';
    textarea.style.border = '2px solid #667eea';
    textarea.style.borderRadius = '8px';
    textarea.style.fontSize = '1em';
    textarea.style.fontFamily = 'inherit';
    textarea.style.resize = 'vertical';
    textarea.placeholder = 'Ingrese los antecedentes médicos del paciente...';
    
    // Reemplazar el párrafo con el textarea
    antecedentesTexto.parentNode.replaceChild(textarea, antecedentesTexto);
    
    // Cambiar botón a "Guardar"
    editarBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    
    // Enfocar el textarea
    textarea.focus();
    
    console.log('✅ Modo de edición activado para antecedentes');
}

// Función para guardar antecedentes
window.guardarAntecedentes = async function(event) {
    console.log('💾 Guardando antecedentes...');
    
    // Prevenir la propagación del evento para evitar que se cierre el modal
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const textarea = document.querySelector('#modalAntecedentes textarea');
    const editarBtn = document.getElementById('editarModalAntecedentes');
    const antecedentesField = document.getElementById('edit-antecedentes');
    
    if (!textarea || !editarBtn || !antecedentesField) {
        console.error('❌ Elementos para guardar antecedentes no encontrados');
        return;
    }
    
    const nuevosAntecedentes = textarea.value.trim();
    
    try {
        // Mostrar loading en el botón
        editarBtn.disabled = true;
        editarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        // Actualizar el campo oculto
        antecedentesField.value = nuevosAntecedentes;
        
        // Guardar en la base de datos
        const patientId = getPatientIdFromUrl();
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}/actualizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ antecedentes: nuevosAntecedentes })
        });
        
        if (response.ok) {
            // Crear nuevo párrafo con el contenido actualizado
            const nuevoParrafo = document.createElement('p');
            nuevoParrafo.id = 'antecedentesTexto';
            
            if (nuevosAntecedentes) {
                nuevoParrafo.textContent = nuevosAntecedentes;
                nuevoParrafo.style.color = '#374151';
                nuevoParrafo.style.fontStyle = 'normal';
            } else {
                nuevoParrafo.textContent = 'No hay antecedentes médicos registrados.';
                nuevoParrafo.style.color = '#9ca3af';
                nuevoParrafo.style.fontStyle = 'italic';
            }
            
            // Reemplazar textarea con el párrafo
            textarea.parentNode.replaceChild(nuevoParrafo, textarea);
            
            // Restaurar botón
            editarBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
            editarBtn.onclick = editarModalAntecedentes;
            editarBtn.disabled = false;
            
            console.log('✅ Antecedentes guardados exitosamente');
        } else {
            throw new Error('Error al guardar antecedentes');
        }
        
    } catch (error) {
        console.error('❌ Error al guardar antecedentes:', error);
        alert('Error al guardar los antecedentes');
        
        // Restaurar botón
        editarBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
        editarBtn.onclick = editarModalAntecedentes;
        editarBtn.disabled = false;
    }
}

// Función para cerrar modal de medicación
function cerrarModalMedicacion() {
    const modal = document.getElementById('modalMedicacion');
    if (modal) {
        modal.classList.remove('show');
        modal.classList.add('hidden');
        
        // Restaurar el estado original del modal
        restaurarEstadoModalMedicacion();
    }
}

// Función para restaurar el estado original del modal de medicación
function restaurarEstadoModalMedicacion() {
    console.log('🔄 Restaurando estado del modal de medicación...');
    
    const modal = document.getElementById('modalMedicacion');
    const editarBtn = document.getElementById('editarModalMedicacion');
    const medicacionField = document.getElementById('edit-medicacion');
    
    if (!modal || !editarBtn || !medicacionField) {
        console.error('❌ Elementos para restaurar modal de medicación no encontrados');
        return;
    }
    
    // Verificar si hay un textarea (modo edición) y restaurarlo a párrafo
    const textarea = modal.querySelector('textarea');
    if (textarea) {
        console.log('📝 Restaurando textarea a párrafo...');
        
        // Crear nuevo párrafo
        const nuevoParrafo = document.createElement('p');
        nuevoParrafo.id = 'medicacionTexto';
        
        const medicacion = textarea.value.trim();
        if (medicacion) {
            nuevoParrafo.textContent = medicacion;
            nuevoParrafo.style.color = '#374151';
            nuevoParrafo.style.fontStyle = 'normal';
        } else {
            nuevoParrafo.textContent = 'No hay información de medicación registrada.';
            nuevoParrafo.style.color = '#9ca3af';
            nuevoParrafo.style.fontStyle = 'italic';
        }
        
        // Reemplazar textarea con párrafo
        textarea.parentNode.replaceChild(nuevoParrafo, textarea);
    }
    
    // Restaurar botón a estado "Editar"
    editarBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
    editarBtn.onclick = editarModalMedicacion;
    editarBtn.disabled = false;
    
    console.log('✅ Estado del modal de medicación restaurado');
}

// Función para cerrar modal de antecedentes
function cerrarModalAntecedentes() {
    const modal = document.getElementById('modalAntecedentes');
    if (modal) {
        modal.classList.remove('show');
        modal.classList.add('hidden');
        
        // Restaurar el estado original del modal
        restaurarEstadoModalAntecedentes();
    }
}

// Función para restaurar el estado original del modal de antecedentes
function restaurarEstadoModalAntecedentes() {
    console.log('🔄 Restaurando estado del modal de antecedentes...');
    
    const modal = document.getElementById('modalAntecedentes');
    const editarBtn = document.getElementById('editarModalAntecedentes');
    const antecedentesField = document.getElementById('edit-antecedentes');
    
    if (!modal || !editarBtn || !antecedentesField) {
        console.error('❌ Elementos para restaurar modal de antecedentes no encontrados');
        return;
    }
    
    // Verificar si hay un textarea (modo edición) y restaurarlo a párrafo
    const textarea = modal.querySelector('textarea');
    if (textarea) {
        console.log('📝 Restaurando textarea a párrafo...');
        
        // Crear nuevo párrafo
        const nuevoParrafo = document.createElement('p');
        nuevoParrafo.id = 'antecedentesTexto';
        
        const antecedentes = textarea.value.trim();
        if (antecedentes) {
            nuevoParrafo.textContent = antecedentes;
            nuevoParrafo.style.color = '#374151';
            nuevoParrafo.style.fontStyle = 'normal';
        } else {
            nuevoParrafo.textContent = 'No hay antecedentes médicos registrados.';
            nuevoParrafo.style.color = '#9ca3af';
            nuevoParrafo.style.fontStyle = 'italic';
        }
        
        // Reemplazar textarea con párrafo
        textarea.parentNode.replaceChild(nuevoParrafo, textarea);
    }
    
    // Restaurar botón a estado "Editar"
    editarBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
    editarBtn.onclick = editarModalAntecedentes;
    editarBtn.disabled = false;
    
    console.log('✅ Estado del modal de antecedentes restaurado');
}

// Configurar eventos de los modales
function initializeModalesMedicacionAntecedentes() {
    console.log('🔧 Inicializando modales de medicación y antecedentes...');
    
    // Modal de medicación
    const modalMedicacion = document.getElementById('modalMedicacion');
    const closeModalMedicacion = document.getElementById('closeModalMedicacion');
    const cerrarModalMedicacionBtn = document.getElementById('cerrarModalMedicacion');
    const editarModalMedicacionBtn = document.getElementById('editarModalMedicacion');
    
    // Modal de antecedentes
    const modalAntecedentes = document.getElementById('modalAntecedentes');
    const closeModalAntecedentes = document.getElementById('closeModalAntecedentes');
    const cerrarModalAntecedentesBtn = document.getElementById('cerrarModalAntecedentes');
    const editarModalAntecedentesBtn = document.getElementById('editarModalAntecedentes');
    
    // Event listeners para modal de medicación
    if (closeModalMedicacion) {
        closeModalMedicacion.addEventListener('click', cerrarModalMedicacion);
    }
    
    if (cerrarModalMedicacionBtn) {
        cerrarModalMedicacionBtn.addEventListener('click', cerrarModalMedicacion);
    }
    
    if (editarModalMedicacionBtn) {
        editarModalMedicacionBtn.addEventListener('click', function(event) {
            // Verificar el estado del botón para determinar qué función ejecutar
            if (editarModalMedicacionBtn.innerHTML.includes('Guardar')) {
                guardarMedicacion(event);
            } else {
                editarModalMedicacion(event);
            }
        });
        console.log('✅ Event listener agregado para botón editar medicación');
    }
    
    // Cerrar modal al hacer clic fuera - DESHABILITADO
    // if (modalMedicacion) {
    //     modalMedicacion.addEventListener('click', (e) => {
    //         if (e.target === modalMedicacion) {
    //             cerrarModalMedicacion();
    //         }
    //     });
    // }
    
    // Event listeners para modal de antecedentes
    if (closeModalAntecedentes) {
        closeModalAntecedentes.addEventListener('click', cerrarModalAntecedentes);
    }
    
    if (cerrarModalAntecedentesBtn) {
        cerrarModalAntecedentesBtn.addEventListener('click', cerrarModalAntecedentes);
    }
    
    if (editarModalAntecedentesBtn) {
        editarModalAntecedentesBtn.addEventListener('click', function(event) {
            // Verificar el estado del botón para determinar qué función ejecutar
            if (editarModalAntecedentesBtn.innerHTML.includes('Guardar')) {
                guardarAntecedentes(event);
            } else {
                editarModalAntecedentes(event);
            }
        });
        console.log('✅ Event listener agregado para botón editar antecedentes');
    }
    
    // Cerrar modal al hacer clic fuera - DESHABILITADO
    // if (modalAntecedentes) {
    //     modalAntecedentes.addEventListener('click', (e) => {
    //         if (e.target === modalAntecedentes) {
    //             cerrarModalAntecedentes();
    //         }
    //     });
    // }
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modalMedicacion && !modalMedicacion.classList.contains('hidden')) {
                cerrarModalMedicacion();
            }
            if (modalAntecedentes && !modalAntecedentes.classList.contains('hidden')) {
                cerrarModalAntecedentes();
            }
        }
    });
    
    console.log('✅ Modales de medicación y antecedentes inicializados');
}

// Inicializar modal QR del paciente
function initializeModalQr() {
    console.log('🔧 Inicializando modal QR del paciente...');
    
    const modal = document.getElementById('modalQrPaciente');
    const closeModalQr = document.getElementById('closeModalQr');
    const cancelarQrPaciente = document.getElementById('cancelarQrPaciente');
    const guardarQrPaciente = document.getElementById('guardarQrPaciente');
    const imagenQrPaciente = document.getElementById('imagenQrPaciente');
    const qrPreviewContainerPaciente = document.getElementById('qrPreviewContainerPaciente');
    const qrPreviewPaciente = document.getElementById('qrPreviewPaciente');
    const eliminarQrPreviewPaciente = document.getElementById('eliminarQrPreviewPaciente');
    const eliminarQrPaciente = document.getElementById('eliminarQrPaciente');
    
    // Cerrar modal
    function cerrarModalQr() {
        if (modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
            // Limpiar preview si hay
            if (imagenQrPaciente) imagenQrPaciente.value = '';
            if (qrPreviewPaciente) qrPreviewPaciente.src = '';
            if (qrPreviewContainerPaciente) qrPreviewContainerPaciente.style.display = 'none';
        }
    }
    
    if (closeModalQr) {
        closeModalQr.addEventListener('click', cerrarModalQr);
    }
    
    if (cancelarQrPaciente) {
        cancelarQrPaciente.addEventListener('click', cerrarModalQr);
    }
    
    // Manejar selección de imagen QR
    if (imagenQrPaciente) {
        imagenQrPaciente.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validar que sea una imagen
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecciona un archivo de imagen válido');
                    e.target.value = '';
                    return;
                }

                // Validar tamaño (10MB)
                const maxSize = 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    alert('La imagen es demasiado grande. El tamaño máximo es 10MB');
                    e.target.value = '';
                    return;
                }

                // Mostrar vista previa
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (qrPreviewPaciente) qrPreviewPaciente.src = e.target.result;
                    if (qrPreviewContainerPaciente) qrPreviewContainerPaciente.style.display = 'block';
                };
                reader.readAsDataURL(file);
                console.log('📷 Nueva imagen QR seleccionada para paciente:', file.name);
            }
        });
    }
    
    // Eliminar preview de nueva imagen
    if (eliminarQrPreviewPaciente) {
        eliminarQrPreviewPaciente.addEventListener('click', function() {
            if (imagenQrPaciente) imagenQrPaciente.value = '';
            if (qrPreviewPaciente) qrPreviewPaciente.src = '';
            if (qrPreviewContainerPaciente) qrPreviewContainerPaciente.style.display = 'none';
        });
    }
    
    // Guardar QR del paciente
    if (guardarQrPaciente) {
        guardarQrPaciente.addEventListener('click', async function() {
            const patientId = getPatientIdFromUrl();
            if (!patientId) {
                alert('Error: No se encontró ID del paciente');
                return;
            }
            
            const submitBtn = guardarQrPaciente;
            const originalText = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                
                let qrFileName = null;
                
                // Si hay una nueva imagen seleccionada, subirla
                if (imagenQrPaciente && imagenQrPaciente.files && imagenQrPaciente.files.length > 0) {
                    const imagenQr = imagenQrPaciente.files[0];
                    console.log(`📷 Subiendo imagen QR del paciente: ${imagenQr.name}`);
                    
                    const qrFormData = new FormData();
                    qrFormData.append('archivo', imagenQr);
                    
                    const uploadQrResponse = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/archivos/subir`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: qrFormData
                    });
                    
                    if (uploadQrResponse.ok) {
                        const qrSubido = await uploadQrResponse.json();
                        qrFileName = qrSubido.nombreArchivo || qrSubido.NombreArchivo;
                        console.log(`✅ Imagen QR subida: ${qrFileName}`);
                    } else {
                        const errorText = await uploadQrResponse.text();
                        console.error(`❌ Error al subir imagen QR:`, errorText);
                        alert(`Error al subir imagen QR: ${errorText}`);
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                        return;
                    }
                }
                
                // Actualizar paciente con el QR
                const updateData = {};
                if (qrFileName) {
                    updateData.imagenQr = qrFileName;
                } else {
                    // No hay cambios (no se seleccionó nueva imagen ni se eliminó)
                    cerrarModalQr();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    return;
                }
                
                const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify(updateData)
                });
                
                if (response.ok) {
                    console.log('✅ QR del paciente actualizado exitosamente');
                    alert('QR del paciente guardado exitosamente');
                    
                    // Recargar datos del paciente para mostrar el nuevo QR
                    await loadPatientData(patientId);
                    
                    cerrarModalQr();
                } else {
                    const errorText = await response.text();
                    console.error('❌ Error al actualizar QR:', errorText);
                    alert(`Error al guardar QR: ${errorText}`);
                }
            } catch (error) {
                console.error('❌ Error de conexión:', error);
                alert(`Error de conexión: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    // Eliminar QR existente
    if (eliminarQrPaciente) {
        eliminarQrPaciente.addEventListener('click', async function() {
            if (!confirm('¿Estás seguro de que deseas eliminar el QR del paciente?')) {
                return;
            }
            
            const patientId = getPatientIdFromUrl();
            if (!patientId) {
                alert('Error: No se encontró ID del paciente');
                return;
            }
            
            const submitBtn = this;
            const originalText = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';
                
                // Enviar cadena vacía para eliminar el QR
                const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({ imagenQr: "" })
                });
                
                if (response.ok) {
                    console.log('✅ QR del paciente eliminado exitosamente');
                    alert('QR del paciente eliminado exitosamente');
                    
                    // Recargar datos del paciente
                    await loadPatientData(patientId);
                    
                    cerrarModalQr();
                } else {
                    const errorText = await response.text();
                    console.error('❌ Error al eliminar QR:', errorText);
                    alert(`Error al eliminar QR: ${errorText}`);
                }
            } catch (error) {
                console.error('❌ Error de conexión:', error);
                alert(`Error de conexión: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    console.log('✅ Modal QR del paciente inicializado');
}

// Inicialización principal
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando aplicación de historia clínica...');
    
    // Inicializar modales
    initializeModal();
    initializeModalesMedicacionAntecedentes();
    initializeModalQr();
    
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

    // ===== FUNCIONALIDAD PARA BOTONES DE CONFIRMACIÓN =====
    
    // Función para mostrar/ocultar controles de revisión
    function toggleRevisionControls() {
        const recetarTextarea = document.getElementById('recetarConsulta');
        const omeTextarea = document.getElementById('omeConsulta');
        const recetarControls = document.getElementById('recetarControls');
        const omeControls = document.getElementById('omeControls');
        
        // Mostrar controles para RECETAR si tiene contenido
        if (recetarTextarea && recetarTextarea.value.trim() !== '') {
            recetarControls.style.display = 'flex';
        } else {
            recetarControls.style.display = 'none';
        }
        
        // Mostrar controles para OME si tiene contenido
        if (omeTextarea && omeTextarea.value.trim() !== '') {
            omeControls.style.display = 'flex';
        } else {
            omeControls.style.display = 'none';
        }
    }
    
    // Función para marcar consulta específica como revisada (desde historial)
    async function marcarConsultaComoRevisada(consultaId, campo) {
        console.log(`🔧 Iniciando marcarConsultaComoRevisada - consultaId: ${consultaId}, campo: ${campo}`);
        
        const pacienteId = getPatientIdFromUrl();
        if (!pacienteId) {
            console.error('No se encontró ID de paciente');
            showNotification('Error: No se encontró ID de paciente', 'error');
            return;
        }
        
        console.log(`🔧 Paciente ID: ${pacienteId}`);
        
        try {
            const url = `${window.CONFIG.API_BASE_URL}/api/pacientes/${pacienteId}/consultas/${consultaId}/marcar-revisado`;
            console.log(`🔧 URL: ${url}`);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ campo: campo })
            });
            
            console.log(`🔧 Response status: ${response.status}`);
            
            if (response.ok) {
                console.log(`✅ Campo ${campo} marcado como revisado para consulta ${consultaId}`);
                
                // Actualizar la lista de pacientes en la página principal si está abierta
                if (window.opener && window.opener.loadPatients) {
                    console.log('🔄 Actualizando lista de pacientes en ventana principal...');
                    window.opener.loadPatients();
                } else {
                    console.log('⚠️ No se pudo actualizar la lista de pacientes - window.opener no disponible');
                }
            } else {
                const errorText = await response.text();
                console.error('Error al marcar como revisado:', errorText);
                showNotification(`Error al marcar como revisado: ${errorText}`, 'error');
                
                // Si hay error, revertir el botón
                const controlsDiv = document.querySelector(`[data-consulta-id="${consultaId}"][data-campo="${campo}"]`)?.closest('.revision-controls-historial');
                if (controlsDiv) {
                    controlsDiv.innerHTML = `
                        <button type="button" class="btn btn-success btn-sm marcar-revisado-btn" data-consulta-id="${consultaId}" data-campo="${campo}">
                            <i class="fas fa-check"></i> Realizado
                        </button>
                    `;
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            showNotification(`Error de conexión: ${error.message}`, 'error');
        }
    }

    // Función para marcar como revisado
    async function marcarComoRevisado(campo) {
        const pacienteId = getPatientIdFromUrl();
        if (!pacienteId) {
            console.error('No se encontró ID de paciente');
            return;
        }
        
        // Obtener la consulta más reciente (asumiendo que es la que se está editando)
        const consultas = await apiGet(`/api/pacientes/${pacienteId}/consultas`);
        if (!consultas || consultas.length === 0) {
            console.error('No se encontraron consultas para el paciente');
            return;
        }
        
        const consultaMasReciente = consultas[0]; // La primera es la más reciente
        
        try {
            const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${pacienteId}/consultas/${consultaMasReciente.id}/marcar-revisado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ campo: campo })
            });
            
            if (response.ok) {
                console.log(`✅ Campo ${campo} marcado como revisado`);
                
                // Mostrar mensaje de éxito
                showNotification('Tarea realizada', 'success');
                
                // Ocultar el botón y mostrar estado de revisado
                const controls = document.getElementById(`${campo}Controls`);
                if (controls) {
                    controls.innerHTML = `
                        <span class="revision-status">
                            <i class="fas fa-check-circle"></i>
                            Revisado
                        </span>
                    `;
                }
                
                // Actualizar la lista de pacientes en la página principal si está abierta
                if (window.opener && window.opener.loadPatients) {
                    window.opener.loadPatients();
                }
            } else {
                const errorText = await response.text();
                console.error('Error al marcar como revisado:', errorText);
                showNotification(`Error al marcar como revisado: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            showNotification(`Error de conexión: ${error.message}`, 'error');
        }
    }
    
    // Función para mostrar notificación
    function showNotification(message, type = 'info') {
        console.log(`🔔 Mostrando notificación: ${message} (tipo: ${type})`);
        
        // Remover notificaciones existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 20px 30px;
            border-radius: 15px;
            color: white;
            font-weight: 700;
            font-size: 16px;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-width: 350px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            transform: translateX(100%);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            ${type === 'success' ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%);' : ''}
            ${type === 'error' ? 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);' : ''}
            ${type === 'info' ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' : ''}
        `;
        
        notification.innerHTML = `
            <div style="font-size: 24px;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            </div>
            <div style="font-size: 18px; font-weight: 800;">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remove después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 3000);
    }
    
    // Event listeners para los botones de confirmación
    const marcarRecetarBtn = document.getElementById('marcarRecetarRevisado');
    const marcarOmeBtn = document.getElementById('marcarOmeRevisado');
    const recetarTextarea = document.getElementById('recetarConsulta');
    const omeTextarea = document.getElementById('omeConsulta');
    
    if (marcarRecetarBtn) {
        marcarRecetarBtn.addEventListener('click', () => marcarComoRevisado('recetar'));
    }
    
    if (marcarOmeBtn) {
        marcarOmeBtn.addEventListener('click', () => marcarComoRevisado('ome'));
    }
    
    // Mostrar/ocultar controles cuando cambie el contenido
    if (recetarTextarea) {
        recetarTextarea.addEventListener('input', toggleRevisionControls);
    }
    
    if (omeTextarea) {
        omeTextarea.addEventListener('input', toggleRevisionControls);
    }
    
    // Verificar controles al cargar la página
    setTimeout(toggleRevisionControls, 500);

    // Event listener global para botones de "Realizado" usando delegación de eventos
    document.addEventListener('click', async function(event) {
        // Verificar si el elemento clickeado es un botón de "Realizado"
        if (event.target.closest('.marcar-revisado-btn')) {
            event.preventDefault();
            event.stopPropagation();
            
            const boton = event.target.closest('.marcar-revisado-btn');
            const consultaId = boton.getAttribute('data-consulta-id');
            const campo = boton.getAttribute('data-campo');
            
            console.log(`🔧 Botón clickeado - consultaId: ${consultaId}, campo: ${campo}`);
            
            if (consultaId && campo) {
                // Cambiar inmediatamente el botón a "Revisado"
                const controlsDiv = boton.closest('.revision-controls-historial');
                if (controlsDiv) {
                    controlsDiv.innerHTML = `
                        <div class="revision-status-historial">
                            <span class="revision-status">
                                <i class="fas fa-check-circle"></i>
                                Revisado
                            </span>
                        </div>
                    `;
                }
                
                // Mostrar notificación
                showNotification('Tarea realizada', 'success');
                
                // Llamar a la función para actualizar la base de datos
                await marcarConsultaComoRevisada(consultaId, campo);
            } else {
                console.error('❌ Datos faltantes - consultaId:', consultaId, 'campo:', campo);
                showNotification('Error: Datos faltantes', 'error');
            }
        }
    });

    // ===== FUNCIONALIDAD PARA EDITAR CONSULTAS =====
    
    // Variable global para almacenar el ID de la consulta que se está editando
    let consultaEditandoId = null;
    
    // Función para abrir el modal de edición de consulta
    window.editarConsulta = async function(consultaId) {
        console.log('✏️ Editando consulta:', consultaId);
        
        consultaEditandoId = consultaId;
        const modal = document.getElementById('modalEditarConsulta');
        const form = document.getElementById('formEditarConsulta');
        
        if (!modal || !form) {
            console.error('❌ Modal o formulario de edición no encontrados');
            return;
        }
        
        try {
            // Obtener datos de la consulta
            const patientId = getPatientIdFromUrl();
            const consultas = await apiGet(`/api/pacientes/${patientId}/consultas`);
            const consulta = consultas.find(c => (c.id || c.Id) == consultaId);
            
            if (!consulta) {
                console.error('❌ Consulta no encontrada');
                alert('Error: No se encontró la consulta');
                return;
            }
            
            // Llenar el formulario con los datos actuales
            llenarFormularioEdicion(consulta);
            
            // Mostrar modal
            modal.classList.remove('hidden');
            modal.classList.add('show');
            
            // Configurar event listeners para los campos de laboratorio en el modal
            setTimeout(() => {
                if (window.setupLabLabelClickHandlers) window.setupLabLabelClickHandlers(modal);
            }, 100);
            
        } catch (error) {
            console.error('❌ Error al cargar datos de la consulta:', error);
            alert('Error al cargar los datos de la consulta');
        }
    };
    
    // Función para llenar el formulario con los datos de la consulta
    function llenarFormularioEdicion(consulta) {
        // Función auxiliar para coalesce
        function coalesce(obj, keys) {
            for (const k of keys) {
                const v = obj?.[k];
                if (v !== undefined && v !== null && v !== '') return v;
            }
            return null;
        }
        
        // Campos básicos (la fecha se muestra pero no se puede modificar)
        document.getElementById('fechaEditarConsulta').value = consulta.fecha || consulta.Fecha || '';
        document.getElementById('fechaLaboratorioEditarConsulta').value = consulta.fechaLaboratorio || consulta.FechaLaboratorio || '';
        document.getElementById('motivoEditarConsulta').value = consulta.motivo || consulta.Motivo || '';
        document.getElementById('recetarEditarConsulta').value = consulta.recetar || consulta.Recetar || '';
        document.getElementById('omeEditarConsulta').value = consulta.ome || consulta.Ome || '';
        document.getElementById('notasEditarConsulta').value = consulta.notas || consulta.Notas || '';
        
        // Valores de laboratorio
        document.getElementById('grEditarConsulta').value = consulta.gr || consulta.GR || '';
        document.getElementById('htoEditarConsulta').value = consulta.hto || consulta.HTO || '';
        document.getElementById('hbEditarConsulta').value = consulta.hb || consulta.HB || '';
        document.getElementById('gbEditarConsulta').value = consulta.gb || consulta.GB || '';
        document.getElementById('plaqEditarConsulta').value = consulta.plaq || consulta.PLAQ || '';
        document.getElementById('glucEditarConsulta').value = consulta.gluc || consulta.GLUC || '';
        document.getElementById('ureaEditarConsulta').value = consulta.urea || consulta.UREA || '';
        document.getElementById('crEditarConsulta').value = consulta.cr || consulta.CR || '';
        document.getElementById('vfgEditarConsulta').value = consulta.vfg || consulta.VFG || '';
        document.getElementById('gotEditarConsulta').value = consulta.got || consulta.GOT || '';
        document.getElementById('gptEditarConsulta').value = consulta.gpt || consulta.GPT || '';
        document.getElementById('ctEditarConsulta').value = coalesce(consulta, ['ct','CT','col','Col','COL']) || '';
        document.getElementById('tgEditarConsulta').value = consulta.tg || consulta.TG || '';
        document.getElementById('vitdEditarConsulta').value = consulta.vitd || consulta.VITD || '';
        document.getElementById('falEditarConsulta').value = consulta.fal || consulta.FAL || '';
        document.getElementById('hdlEditarConsulta').value = consulta.hdl || consulta.HDL || '';
        document.getElementById('ldlEditarConsulta').value = consulta.ldl || consulta.LDL || '';
        document.getElementById('b12EditarConsulta').value = consulta.b12 || consulta.B12 || '';
        document.getElementById('tshEditarConsulta').value = consulta.tsh || consulta.TSH || '';
        document.getElementById('t4lEditarConsulta').value = coalesce(consulta, ['t4l','T4L','t4L']) || '';
        document.getElementById('uricoEditarConsulta').value = consulta.urico || consulta.URICO || '';
        document.getElementById('psaEditarConsulta').value = consulta.psa || consulta.PSA || '';
        document.getElementById('hba1cEditarConsulta').value = coalesce(consulta, ['hba1c','HBA1C','HbA1c','HbA1C','hbA1C']) || '';
        document.getElementById('orinaEditarConsulta').value = consulta.orina || consulta.ORINA || '';
        document.getElementById('valoresNoIncluidosEditarConsulta').value = consulta.valoresNoIncluidos || consulta.ValoresNoIncluidos || '';
        
        // Aplicar campos resaltados si existen
        const camposResaltados = consulta.camposResaltados || consulta.CamposResaltados || [];
        if (camposResaltados.length > 0) {
            // Limpiar campos resaltados primero
            const modal = document.getElementById('modalEditarConsulta');
            if (window.clearHighlightedFields) window.clearHighlightedFields(modal);
            // Aplicar los campos resaltados en el contexto del modal de edición
            if (window.applyHighlightedFields) window.applyHighlightedFields(camposResaltados, modal);
        }
        
        // Cargar archivos existentes de la consulta
        archivosExistentesEditar = [];
        archivosListEditar = [];
        const archivos = consulta.archivos || consulta.Archivos || [];
        if (archivos && archivos.length > 0) {
            // Si archivos es un string JSON, parsearlo
            if (typeof archivos === 'string') {
                try {
                    archivosExistentesEditar = JSON.parse(archivos);
                } catch (e) {
                    console.error('Error al parsear archivos JSON:', e);
                    archivosExistentesEditar = [];
                }
            } else if (Array.isArray(archivos)) {
                archivosExistentesEditar = archivos;
            }
            console.log('📎 Archivos existentes cargados:', archivosExistentesEditar);
        }
        
        // Cargar imagen QR existente si hay
        const imagenQrEditar = document.getElementById('imagenQrEditarConsulta');
        const qrPreviewContainerEditar = document.getElementById('qrPreviewContainerEditar');
        const qrPreviewEditar = document.getElementById('qrPreviewEditar');
        
        // Buscar imagen QR en los archivos existentes
        const qrExistente = archivosExistentesEditar.find(a => 
            a.esQr || (a.extension && ['.jpg', '.jpeg', '.png', '.gif'].includes(a.extension.toLowerCase()) && 
            (a.nombreOriginal || a.NombreOriginal || '').toLowerCase().includes('qr'))
        );
        
        if (qrExistente && qrPreviewEditar && qrPreviewContainerEditar) {
            const qrUrl = qrExistente.urlDescarga || qrExistente.UrlDescarga || 
                         `/api/pacientes/archivos/${qrExistente.nombreArchivo || qrExistente.NombreArchivo}`;
            const fullUrl = `${window.CONFIG?.API_BASE_URL || window.location.origin}${qrUrl}`;
            qrPreviewEditar.src = fullUrl;
            qrPreviewContainerEditar.style.display = 'block';
            console.log('📷 Imagen QR existente cargada');
        } else if (qrPreviewContainerEditar) {
            qrPreviewContainerEditar.style.display = 'none';
        }
        
        // Configurar manejo de nueva imagen QR en modal de editar
        if (imagenQrEditar) {
            imagenQrEditar.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Validar que sea una imagen
                    if (!file.type.startsWith('image/')) {
                        alert('Por favor, selecciona un archivo de imagen válido');
                        e.target.value = '';
                        return;
                    }

                    // Validar tamaño (10MB)
                    const maxSize = 10 * 1024 * 1024;
                    if (file.size > maxSize) {
                        alert('La imagen es demasiado grande. El tamaño máximo es 10MB');
                        e.target.value = '';
                        return;
                    }

                    // Mostrar vista previa
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (qrPreviewEditar) qrPreviewEditar.src = e.target.result;
                        if (qrPreviewContainerEditar) qrPreviewContainerEditar.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                    console.log('📷 Nueva imagen QR seleccionada para editar:', file.name);
                }
            });
        }

        // Botón para eliminar imagen QR en modal de editar
        const eliminarQrEditarBtn = document.getElementById('eliminarQrEditar');
        if (eliminarQrEditarBtn) {
            eliminarQrEditarBtn.addEventListener('click', function() {
                if (imagenQrEditar) imagenQrEditar.value = '';
                if (qrPreviewEditar) qrPreviewEditar.src = '';
                if (qrPreviewContainerEditar) qrPreviewContainerEditar.style.display = 'none';
                console.log('🗑️ Imagen QR eliminada en edición');
            });
        }
        
        // Mostrar archivos en el modal
        mostrarArchivosSeleccionadosEditar();
    }
    
    // Función para cerrar el modal de edición
    function cerrarModalEditarConsulta() {
        const modal = document.getElementById('modalEditarConsulta');
        if (modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
            // Limpiar formulario
            document.getElementById('formEditarConsulta').reset();
            consultaEditandoId = null;
            // Limpiar campos resaltados
            clearHighlightedFields();
            // Limpiar archivos seleccionados y existentes
            archivosListEditar = [];
            archivosExistentesEditar = [];
            // Limpiar imagen QR
            const imagenQrEditar = document.getElementById('imagenQrEditarConsulta');
            const qrPreviewContainerEditar = document.getElementById('qrPreviewContainerEditar');
            const qrPreviewEditar = document.getElementById('qrPreviewEditar');
            if (imagenQrEditar) imagenQrEditar.value = '';
            if (qrPreviewEditar) qrPreviewEditar.src = '';
            if (qrPreviewContainerEditar) qrPreviewContainerEditar.style.display = 'none';
            // Llamar a la función solo si existe
            if (typeof mostrarArchivosSeleccionadosEditar === 'function') {
                mostrarArchivosSeleccionadosEditar();
            }
            // Limpiar input de archivos
            const archivosInputEditar = document.getElementById('archivosEditarConsulta');
            if (archivosInputEditar) {
                archivosInputEditar.value = '';
            }
        }
    }
    
    // Función para mostrar el modal de error con formato amigable
    function showErrorModal(errorData) {
        const modal = document.getElementById('modalError');
        const errorMainMessage = document.getElementById('errorMainMessage');
        const errorDetails = document.getElementById('errorDetails');
        const closeBtn = document.getElementById('closeModalError');
        const acceptBtn = document.getElementById('acceptErrorBtn');

        if (!modal || !errorMainMessage || !errorDetails) {
            console.error('❌ Elementos del modal de error no encontrados');
            // Fallback a alert si el modal no existe
            alert(typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
            return;
        }

        // Formatear el mensaje principal
        let mainMessage = 'Se encontraron errores de validación';
        let detailsHtml = '';

        // Si es un string, mostrar directamente
        if (typeof errorData === 'string') {
            mainMessage = errorData;
        } 
        // Si es un objeto JSON con errores de validación
        else if (errorData && typeof errorData === 'object') {
            // Intentar obtener el mensaje principal
            if (errorData.title) {
                mainMessage = errorData.title;
            } else if (errorData.mensaje) {
                mainMessage = errorData.mensaje;
            } else if (errorData.error) {
                mainMessage = errorData.error;
            }

            // Formatear los errores de validación
            if (errorData.errors) {
                const errors = errorData.errors;
                const errorList = [];

                // Procesar cada campo con errores
                Object.keys(errors).forEach(field => {
                    const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
                    
                    fieldErrors.forEach(errorMsg => {
                        // Traducir nombres de campos técnicos a nombres amigables
                        let friendlyFieldName = field;
                        if (field === 'actualizarConsultaDto') {
                            friendlyFieldName = 'Datos de la consulta';
                        } else if (field === 'fechaLaboratorio') {
                            friendlyFieldName = 'Fecha de Laboratorio';
                        } else if (field.startsWith('$.')) {
                            friendlyFieldName = field.replace('$.', '').replace(/([A-Z])/g, ' $1').trim();
                        }

                        // Formatear el mensaje de error
                        let formattedError = errorMsg;
                        if (errorMsg.includes('could not be converted')) {
                            formattedError = 'El formato de la fecha no es válido. Por favor, ingrese una fecha válida (ej: YYYY-MM-DD)';
                        } else if (errorMsg.includes('is required')) {
                            formattedError = 'Este campo es obligatorio';
                        }

                        errorList.push({
                            field: friendlyFieldName,
                            message: formattedError
                        });
                    });
                });

                // Generar HTML de los detalles
                if (errorList.length > 0) {
                    detailsHtml = '<ul>';
                    errorList.forEach(error => {
                        detailsHtml += `<li><span class="error-field">${error.field}:</span> ${error.message}</li>`;
                    });
                    detailsHtml += '</ul>';
                }
            }
        }

        // Actualizar el contenido del modal
        errorMainMessage.textContent = mainMessage;
        errorDetails.innerHTML = detailsHtml || '';

        // Mostrar el modal
        modal.classList.remove('hidden');
        modal.classList.add('show');

        // Función para cerrar el modal
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        };

        // Event listeners
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        if (acceptBtn) {
            acceptBtn.onclick = closeModal;
        }

        // Cerrar al hacer clic fuera del modal
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };

        // Cerrar con la tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Función para guardar los cambios de la consulta
    async function guardarCambiosConsulta(event) {
        event.preventDefault();
        
        if (!consultaEditandoId) {
            console.error('❌ No hay consulta seleccionada para editar');
            return;
        }
        
        const form = document.getElementById('formEditarConsulta');
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Deshabilitar botón y mostrar loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            
            // Preparar datos para actualizar
            const consultaData = {
                fecha: formData.get('fecha') ? new Date(formData.get('fecha')).toISOString() : null,
                fechaLaboratorio: formData.get('fechaLaboratorio') ? new Date(formData.get('fechaLaboratorio')).toISOString() : null,
                motivo: formData.get('motivo'),
                recetar: formData.get('recetar') || null,
                ome: formData.get('ome') || null,
                notas: formData.get('notas') || null,
                // Valores de laboratorio (convertir comas a puntos para el backend)
                gr: formData.get('gr') ? parseFloat(formData.get('gr').replace(',', '.')) : null,
                hto: formData.get('hto') ? parseFloat(formData.get('hto').replace(',', '.')) : null,
                hb: formData.get('hb') ? parseFloat(formData.get('hb').replace(',', '.')) : null,
                gb: formData.get('gb') ? parseFloat(formData.get('gb').replace(',', '.')) : null,
                plaq: formData.get('plaq') ? parseFloat(formData.get('plaq').replace(',', '.')) : null,
                gluc: formData.get('gluc') ? parseFloat(formData.get('gluc').replace(',', '.')) : null,
                urea: formData.get('urea') ? parseFloat(formData.get('urea').replace(',', '.')) : null,
                cr: formData.get('cr') ? parseFloat(formData.get('cr').replace(',', '.')) : null,
                vfg: formData.get('vfg') ? parseFloat(formData.get('vfg').replace(',', '.')) : null,
                got: formData.get('got') ? parseFloat(formData.get('got').replace(',', '.')) : null,
                gpt: formData.get('gpt') ? parseFloat(formData.get('gpt').replace(',', '.')) : null,
                ct: formData.get('ct') ? parseFloat(formData.get('ct').replace(',', '.')) : null,
                tg: formData.get('tg') ? parseFloat(formData.get('tg').replace(',', '.')) : null,
                vitd: formData.get('vitd') ? parseFloat(formData.get('vitd').replace(',', '.')) : null,
                fal: formData.get('fal') ? parseFloat(formData.get('fal').replace(',', '.')) : null,
                hdl: formData.get('hdl') ? parseFloat(formData.get('hdl').replace(',', '.')) : null,
                b12: formData.get('b12') ? parseFloat(formData.get('b12').replace(',', '.')) : null,
                tsh: formData.get('tsh') ? parseFloat(formData.get('tsh').replace(',', '.')) : null,
                t4l: formData.get('t4l') ? parseFloat(formData.get('t4l').replace(',', '.')) : null,
                orina: formData.get('orina') || null,
                urico: formData.get('urico') ? parseFloat(formData.get('urico').replace(',', '.')) : null,
                ldl: formData.get('ldl') ? parseFloat(formData.get('ldl').replace(',', '.')) : null,
                psa: formData.get('psa') ? parseFloat(formData.get('psa').replace(',', '.')) : null,
                hba1c: formData.get('hba1c') ? parseFloat(formData.get('hba1c').replace(',', '.')) : null,
                valoresNoIncluidos: formData.get('valoresNoIncluidos') || null,
                // Incluir campos resaltados (valores fuera de rango)
                camposResaltados: (() => {
                    const highlighted = window.getHighlightedFields ? window.getHighlightedFields(form) : [];
                    console.log('🔍 Campos resaltados detectados para guardar:', highlighted);
                    return highlighted;
                })()
            };

            // Validar motivo (requerido)
            if (!consultaData.motivo || consultaData.motivo.trim() === '') {
                alert('El motivo de la consulta es requerido');
                // Restaurar botón antes de salir
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                return;
            }

            // Subir archivos nuevos si hay archivos seleccionados
            let archivosSubidos = [];
            if (archivosListEditar.length > 0) {
                console.log('📎 Subiendo archivos nuevos para la consulta editada...');
                try {
                    for (const archivo of archivosListEditar) {
                        const formDataArchivo = new FormData();
                        formDataArchivo.append('archivo', archivo);
                        
                        const responseArchivo = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/archivos/subir`, {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            body: formDataArchivo
                        });
                        
                        if (responseArchivo.ok) {
                            const archivoDto = await responseArchivo.json();
                            archivosSubidos.push(archivoDto);
                            console.log('✅ Archivo nuevo subido:', archivoDto.nombreOriginal);
                        } else {
                            console.error('❌ Error al subir archivo:', archivo.name);
                        }
                    }
                } catch (error) {
                    console.error('❌ Error al subir archivos:', error);
                }
            }

            // Procesar imagen QR nueva si existe
            const imagenQrEditar = document.getElementById('imagenQrEditarConsulta');
            if (imagenQrEditar && imagenQrEditar.files && imagenQrEditar.files.length > 0) {
                const imagenQr = imagenQrEditar.files[0];
                console.log(`📷 Subiendo nueva imagen QR para consulta editada: ${imagenQr.name}`);
                
                const qrFormData = new FormData();
                qrFormData.append('archivo', imagenQr);
                
                try {
                    const uploadQrResponse = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/archivos/subir`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: qrFormData
                    });
                    
                    if (uploadQrResponse.ok) {
                        const qrSubido = await uploadQrResponse.json();
                        // Marcar como QR para identificarlo
                        qrSubido.esQr = true;
                        archivosSubidos.push(qrSubido);
                        console.log(`✅ Nueva imagen QR subida: ${qrSubido.nombreOriginal}`);
                    } else {
                        const errorText = await uploadQrResponse.text();
                        console.error(`❌ Error al subir imagen QR:`, errorText);
                        alert(`Error al subir imagen QR: ${errorText}`);
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                        return;
                    }
                } catch (error) {
                    console.error(`❌ Error de conexión al subir imagen QR:`, error);
                    alert(`Error de conexión al subir imagen QR`);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    return;
                }
            }

            // Combinar archivos existentes (que no se eliminaron) con los nuevos
            // Filtrar QR existente si se subió uno nuevo (reemplazar)
            let archivosExistentesFinales = archivosExistentesEditar;
            if (imagenQrEditar && imagenQrEditar.files && imagenQrEditar.files.length > 0) {
                // Si se subió un QR nuevo, eliminar el QR existente de los archivos existentes
                archivosExistentesFinales = archivosExistentesEditar.filter(a => 
                    !(a.esQr || (a.extension && ['.jpg', '.jpeg', '.png', '.gif'].includes(a.extension.toLowerCase()) && 
                    (a.nombreOriginal || a.NombreOriginal || '').toLowerCase().includes('qr')))
                );
            }
            
            const todosLosArchivos = [...archivosExistentesFinales, ...archivosSubidos];
            console.log('📎 Archivos totales para guardar:', todosLosArchivos.length);
            console.log('   - Existentes:', archivosExistentesEditar.length);
            console.log('   - Nuevos:', archivosSubidos.length);

            // Agregar archivos al payload
            consultaData.archivos = todosLosArchivos;

            console.log('📝 Actualizando consulta:', consultaData);
            console.log('🔍 Payload completo para actualizar:', JSON.stringify(consultaData, null, 2));
            
            const patientId = getPatientIdFromUrl();
            
            // Enviar actualización a la API
            const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/pacientes/${patientId}/consultas/${consultaEditandoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(consultaData)
            });

            if (response.ok) {
                console.log('✅ Consulta actualizada exitosamente');
                
                // Recargar consultas para mostrar los cambios ANTES de cerrar el modal
                console.log('🔄 Recargando listado de consultas...');
                try {
                    await loadPatientConsultations(patientId);
                    console.log('✅ Listado de consultas recargado exitosamente');
                    
                    // Cerrar modal después de recargar exitosamente
                    cerrarModalEditarConsulta();
                    
                    // Mostrar mensaje de éxito
                    alert('Consulta actualizada exitosamente');
                } catch (reloadError) {
                    console.error('❌ Error al recargar consultas:', reloadError);
                    
                    // Cerrar modal aunque haya error en la recarga
                    cerrarModalEditarConsulta();
                    
                    // Mostrar mensaje de éxito pero avisar que puede necesitar recargar manualmente
                    alert('Consulta actualizada exitosamente. Si no ves los cambios, recarga la página.');
                }
                
            } else {
                let errorText;
                try {
                    errorText = await response.text();
                } catch (parseError) {
                    errorText = `Error HTTP ${response.status}`;
                }
                console.error('❌ Error al actualizar consulta:', response.status, errorText);
                
                // Intentar parsear como JSON para obtener un mensaje más amigable
                let errorData = `Error al actualizar consulta: ${errorText}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorData = errorJson; // Usar el objeto JSON completo para mejor formateo
                } catch (e) {
                    // Si no es JSON, usar el mensaje de texto plano
                }
                
                showErrorModal(errorData);
            }
            
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            
            // Mostrar mensaje de error más específico
            let errorMessage = 'Error de conexión al actualizar la consulta';
            if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            
            showErrorModal(errorMessage);
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    // Configurar eventos del modal de edición
    function initializeModalEditarConsulta() {
        console.log('🔧 Inicializando modal de editar consulta...');
        
        const modal = document.getElementById('modalEditarConsulta');
        const form = document.getElementById('formEditarConsulta');
        const closeBtn = document.getElementById('closeModalEditarConsulta');
        const cancelBtn = document.getElementById('cancelarEditarConsulta');
        
        // Event listener para el formulario
        if (form) {
            form.addEventListener('submit', guardarCambiosConsulta);
        }
        
        // Event listeners para cerrar modal
        if (closeBtn) {
            closeBtn.addEventListener('click', cerrarModalEditarConsulta);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', cerrarModalEditarConsulta);
        }
        
        // Cerrar modal al hacer clic fuera - DESHABILITADO
        // if (modal) {
        //     modal.addEventListener('click', (e) => {
        //         if (e.target === modal) {
        //             cerrarModalEditarConsulta();
        //         }
        //     });
        // }
        
        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                cerrarModalEditarConsulta();
            }
        });
        
        // Configurar formato de decimales para campos de laboratorio
        const camposLaboratorioEditar = [
            'grEditarConsulta', 'htoEditarConsulta', 'hbEditarConsulta', 'gbEditarConsulta',
            'plaqEditarConsulta', 'glucEditarConsulta', 'ureaEditarConsulta', 'crEditarConsulta',
            'gotEditarConsulta', 'gptEditarConsulta', 'ctEditarConsulta', 'tgEditarConsulta',
            'vitdEditarConsulta', 'falEditarConsulta', 'hdlEditarConsulta', 'ldlEditarConsulta', 'b12EditarConsulta',
            'tshEditarConsulta', 't4lEditarConsulta', 'uricoEditarConsulta', 'psaEditarConsulta', 'hba1cEditarConsulta'
        ];
        
        camposLaboratorioEditar.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                // Formatear cuando el usuario presiona Enter
                campo.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        formatearADosDecimales(this);
                        this.blur();
                    }
                });
                
                // Validación de entrada en tiempo real
                campo.addEventListener('input', function(e) {
                    let valor = e.target.value;
                    
                    // Reemplazar punto por coma automáticamente
                    if (valor.includes('.')) {
                        valor = valor.replace('.', ',');
                    }
                    
                    // Permitir solo números y comas
                    valor = valor.replace(/[^0-9,]/g, '');
                    
                    // Limitar a una sola coma
                    const partes = valor.split(',');
                    if (partes.length > 2) {
                        valor = partes[0] + ',' + partes.slice(1).join('');
                    }
                    
                    // Limitar decimales a máximo 2 dígitos
                    if (partes.length === 2 && partes[1].length > 2) {
                        valor = partes[0] + ',' + partes[1].substring(0, 2);
                    }
                    
                    e.target.value = valor;
                });
                
                // Validación adicional al perder el foco
                campo.addEventListener('blur', function() {
                    formatearADosDecimales(this);
                });
            }
        });
        
        // Configurar event listener para archivos en modal de editar consulta
        const archivosInputEditar = document.getElementById('archivosEditarConsulta');
        const archivosSeleccionadosEditar = document.getElementById('archivosSeleccionadosEditar');

        if (archivosInputEditar) {
            archivosInputEditar.addEventListener('change', function(event) {
                handleArchivosSeleccionadosEditar(event);
            });
        }
        
        console.log('✅ Modal de editar consulta inicializado');
    }
    
    // Inicializar el modal de edición
    initializeModalEditarConsulta();
    
    // Configurar los event listeners cuando se abre el modal
    const originalOpenModal = document.getElementById('btnNuevaConsulta');
    if (originalOpenModal) {
        originalOpenModal.addEventListener('click', function() {
            setTimeout(() => {
                setupLabLabelClickHandlers();
            }, 100);
        });
    }

    // ===== FUNCIONALIDAD DEL MODAL DE PLANILLAS =====
    const planillasBtnNav = document.getElementById('planillasBtnNav');
    const modalPlanillas = document.getElementById('modalPlanillas');
    const closeModalPlanillas = document.getElementById('closeModalPlanillas');
    const cerrarPlanillas = document.getElementById('cerrarPlanillas');
    const planillaOptionBtns = document.querySelectorAll('.planilla-option-btn');

    // Función para abrir el modal de planillas
    function abrirModalPlanillas() {
        if (modalPlanillas) {
            modalPlanillas.classList.remove('hidden');
            modalPlanillas.classList.add('show');
            // Mostrar contenido por defecto al abrir
            mostrarPlanilla('default');
        }
    }

    // Función para cerrar el modal de planillas
    function cerrarModalPlanillas() {
        if (modalPlanillas) {
            modalPlanillas.classList.remove('show');
            modalPlanillas.classList.add('hidden');
        }
    }

    // Función para mostrar el contenido de una planilla específica
    function mostrarPlanilla(planillaId) {
        // Ocultar todos los contenidos
        const allContents = document.querySelectorAll('.planilla-detail');
        allContents.forEach(content => {
            content.style.display = 'none';
        });

        // Remover clase active de todos los botones
        planillaOptionBtns.forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar el contenido correspondiente
        if (planillaId === 'parkinson') {
            const parkinsonContent = document.getElementById('planillaParkinsonContent');
            if (parkinsonContent) {
                parkinsonContent.style.display = 'block';
            }
            // Activar el botón correspondiente
            const parkinsonBtn = document.querySelector('[data-planilla="parkinson"]');
            if (parkinsonBtn) {
                parkinsonBtn.classList.add('active');
            }
        } else {
            // Mostrar contenido por defecto
            const defaultContent = document.getElementById('planillaDefaultContent');
            if (defaultContent) {
                defaultContent.style.display = 'block';
            }
        }
    }

    // Event listeners
    if (planillasBtnNav) {
        planillasBtnNav.addEventListener('click', abrirModalPlanillas);
    }

    if (closeModalPlanillas) {
        closeModalPlanillas.addEventListener('click', cerrarModalPlanillas);
    }

    if (cerrarPlanillas) {
        cerrarPlanillas.addEventListener('click', cerrarModalPlanillas);
    }

    // Event listeners para los botones de opciones de planillas
    planillaOptionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const planillaId = this.getAttribute('data-planilla');
            if (planillaId) {
                mostrarPlanilla(planillaId);
            }
        });
    });

    // Cerrar modal al hacer clic fuera de él
    if (modalPlanillas) {
        modalPlanillas.addEventListener('click', function(e) {
            if (e.target === modalPlanillas) {
                cerrarModalPlanillas();
            }
        });
    }

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalPlanillas && !modalPlanillas.classList.contains('hidden')) {
            cerrarModalPlanillas();
        }
    });
});
