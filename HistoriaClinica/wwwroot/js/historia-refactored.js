<script>
/* =========================
   CONFIGURACIÓN GLOBAL
========================= */
if (!window.CONFIG) {
    window.CONFIG = { API_BASE_URL: window.location.origin };
}

/* =========================
   INICIALIZACIÓN DE CLASES
========================= */
let apiClient, storageManager, uiManager, fileManager, labFieldsManager, consultaManager, patientManager, modalManager;

// Inicializar instancias globales
function initializeClasses() {
    apiClient = new ApiClient();
    storageManager = new StorageManager();
    uiManager = new UIManager();
    fileManager = new FileManager(apiClient);
    labFieldsManager = new LabFieldsManager();
    consultaManager = new ConsultaManager(apiClient, uiManager, fileManager, labFieldsManager);
    patientManager = new PatientManager(apiClient, uiManager);
    modalManager = new ModalManager(uiManager, fileManager, labFieldsManager, consultaManager);
}

/* =========================
   FUNCIONES GLOBALES (COMPATIBILIDAD)
========================= */
// Mantener compatibilidad con el código existente
window.toggleConsultaDetalle = (header) => consultaManager.toggleConsultaDetalle(header);
window.toggleLaboratorio = (consultaId, ev) => consultaManager.toggleLaboratorio(consultaId, ev);
window.editarConsulta = (consultaId) => consultaManager.editConsultation(consultaId);
window.eliminarConsulta = (consultaId) => consultaManager.deleteConsultation(consultaId);
window.saveSection = (section) => patientManager.saveSection(section);
window.abrirModalMedicacion = () => patientManager.openMedicationModal();
window.abrirModalAntecedentes = () => patientManager.openAntecedentsModal();
window.editarModalMedicacion = () => patientManager.editMedication();
window.editarModalAntecedentes = () => patientManager.editAntecedents();
window.guardarMedicacion = () => patientManager.saveMedication();
window.guardarAntecedentes = () => patientManager.saveAntecedents();

// Funciones de utilidad globales
window.getHighlightedFields = (root) => labFieldsManager.getHighlightedFields(root);
window.applyHighlightedFields = (fields, root) => labFieldsManager.applyHighlightedFields(fields, root);
window.clearHighlightedFields = (root) => labFieldsManager.clearHighlightedFields(root);
window.setupLabLabelClickHandlers = (root) => labFieldsManager.setupLabLabelClickHandlers(root);

// Funciones de archivos
window.eliminarArchivo = (index) => modalManager.removeFile(index);

/* =========================
   FUNCIONES DE INICIALIZACIÓN
========================= */
async function loadPatientData(patientId) {
    try {
        await patientManager.loadPatientData(patientId);
        await consultaManager.loadPatientConsultations(patientId);
    } catch (error) {
        console.error('Error loading patient data:', error);
    }
}

function initializeRevisionShortcuts() {
    // Botones para marcar como revisado
    const marcarRecetarBtn = document.getElementById('marcarRecetarRevisado');
    const marcarOmeBtn = document.getElementById('marcarOmeRevisado');
    
    if (marcarRecetarBtn) {
        marcarRecetarBtn.addEventListener('click', async () => {
            const patientId = storageManager.getPatientIdFromUrl();
            if (!patientId) return;
            
            try {
                const consultas = await apiClient.getPatientConsultations(patientId);
                if (consultas?.length) {
                    const primeraConsulta = consultas[0];
                    await consultaManager.markAsReviewed(primeraConsulta.id || primeraConsulta.Id, 'recetar');
                }
            } catch (error) {
                uiManager.toast(`Error: ${error.message}`, 'error');
            }
        });
    }
    
    if (marcarOmeBtn) {
        marcarOmeBtn.addEventListener('click', async () => {
            const patientId = storageManager.getPatientIdFromUrl();
            if (!patientId) return;
            
            try {
                const consultas = await apiClient.getPatientConsultations(patientId);
                if (consultas?.length) {
                    const primeraConsulta = consultas[0];
                    await consultaManager.markAsReviewed(primeraConsulta.id || primeraConsulta.Id, 'ome');
                }
            } catch (error) {
                uiManager.toast(`Error: ${error.message}`, 'error');
            }
        });
    }

    // Controles dinámicos para Recetar/OME
    const recetarTxt = document.getElementById('recetarConsulta');
    const omeTxt = document.getElementById('omeConsulta');
    
    const toggleControls = () => {
        const recetarControls = document.getElementById('recetarControls');
        const omeControls = document.getElementById('omeControls');
        
        if (recetarControls) {
            recetarControls.style.display = (recetarTxt?.value.trim()) ? 'flex' : 'none';
        }
        if (omeControls) {
            omeControls.style.display = (omeTxt?.value.trim()) ? 'flex' : 'none';
        }
    };
    
    recetarTxt?.addEventListener('input', toggleControls);
    omeTxt?.addEventListener('input', toggleControls);
    setTimeout(toggleControls, 400);

    // Inicializar shortcuts de revisión
    consultaManager.initRevisionShortcuts();
}

/* =========================
   INICIALIZACIÓN PRINCIPAL
========================= */
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar clases
    initializeClasses();
    
    // Inicializar modales
    modalManager.initializeNuevaConsultaModal();
    modalManager.initializeEditarConsultaModal();
    modalManager.initializeMedAnteModals();
    
    // Inicializar shortcuts de revisión
    initializeRevisionShortcuts();
    
    // Cargar datos del paciente
    const patientId = storageManager.getPatientIdFromUrl();
    if (patientId) {
        await loadPatientData(patientId);
    } else {
        const sidebarContent = document.getElementById('sidebar-content');
        if (sidebarContent) {
            uiManager.showError(sidebarContent, 'Error: No se encontró ID de paciente en la URL', 'Por favor, regrese al listado de pacientes');
        }
    }
});

/* =========================
   FUNCIONES DE COMPATIBILIDAD ADICIONALES
========================= */
// Mantener funciones que podrían ser llamadas desde HTML
window.toast = (message, type, duration) => uiManager.toast(message, type, duration);
window.showInlineMessage = (container, message, kind) => uiManager.showInlineMessage(container, message, kind);
window.formatFileSize = (bytes) => fileManager.formatFileSize(bytes);
window.fileIconByExt = (ext) => fileManager.getFileIcon(ext);
window.formatDateForInput = (value) => Utils.formatDateForInput(value);
window.tryISODate = (value) => Utils.tryISODate(value);
window.toFloatOrNull = (value) => Utils.toFloatOrNull(value);
window.getPatientIdFromUrl = () => storageManager.getPatientIdFromUrl();

// Funciones de API para compatibilidad
window.apiRequest = (path, options) => apiClient.request(path, options);
window.apiGet = (path) => apiClient.get(path);
window.apiPost = (path, data, headers) => apiClient.post(path, data, headers);
window.apiPut = (path, data) => apiClient.put(path, data);
window.apiDel = (path) => apiClient.delete(path);

// Funciones de utilidad DOM
window.$ = (sel, root) => Utils.$(sel, root);
window.$$ = (sel, root) => Utils.$$(sel, root);
window.byId = (id) => Utils.byId(id);
window.uniq = (arr) => Utils.uniq(arr);
window.clamp = (n, min, max) => Utils.clamp(n, min, max);

// Funciones de renderizado
window.renderLaboratorioValues = (consulta) => labFieldsManager.renderLaboratorioValues(consulta);
window.renderArchivosAdjuntos = (archivos) => fileManager.renderAttachedFiles(archivos);
window.renderConsultas = (consultas) => consultaManager.renderConsultas(consultas);
window.renderPatientSidebar = (patient) => patientManager.renderPatientSidebar(patient);

// Funciones de validación
window.normalizeKey = (raw) => labFieldsManager.normalizeKey(raw);
window.normalizeHighlighted = (input) => labFieldsManager.normalizeHighlighted(input);
window.getHighlightedFields = (root) => labFieldsManager.getHighlightedFields(root);
window.applyHighlightedFields = (fields, root) => labFieldsManager.applyHighlightedFields(fields, root);
window.clearHighlightedFields = (root) => labFieldsManager.clearHighlightedFields(root);
window.setupLabLabelClickHandlers = (root) => labFieldsManager.setupLabLabelClickHandlers(root);

// Funciones de carga
window.loadPatientData = loadPatientData;
window.loadPatientConsultations = (patientId) => consultaManager.loadPatientConsultations(patientId);

// Funciones de modales
window.initializeNuevaConsultaModal = () => modalManager.initializeNuevaConsultaModal();
window.initializeEditarConsultaModal = () => modalManager.initializeEditarConsultaModal();
window.initMedAnteModals = () => modalManager.initializeMedAnteModals();
window.initRevisionShortcuts = initializeRevisionShortcuts;

// Funciones de archivos
window.attachDecimalMask = (ids) => labFieldsManager.attachDecimalMask(ids);
window.buildConsultaPayload = (form, highlightedFromRoot) => labFieldsManager.buildLabPayload(form, highlightedFromRoot);
window.uploadArchivos = (files) => fileManager.uploadFiles(files);

// Funciones de edición
window.toggleEditMode = (section) => patientManager.toggleEditMode(section);
window.getSectionFields = (section) => patientManager.getSectionFields(section);

// Funciones de marcado como revisado
window.marcarConsultaComoRevisada = (consultaId, campo) => consultaManager.markAsReviewed(consultaId, campo);
window.marcarMasRecienteComoRevisado = async (campo) => {
    const patientId = storageManager.getPatientIdFromUrl();
    if (!patientId) return;
    
    try {
        const consultas = await apiClient.getPatientConsultations(patientId);
        if (consultas?.length) {
            const primeraConsulta = consultas[0];
            await consultaManager.markAsReviewed(primeraConsulta.id || primeraConsulta.Id, campo);
        }
    } catch (error) {
        uiManager.toast(`Error: ${error.message}`, 'error');
    }
};

// Funciones de modal de edición
window.cerrarModalEditarConsulta = () => modalManager.closeEditarConsultaModal();
window.guardarCambiosConsulta = (e) => modalManager.handleEditarConsultaSubmit(document.getElementById('formEditarConsulta'));

// Funciones de inicialización
window.initializeClasses = initializeClasses;
</script>

