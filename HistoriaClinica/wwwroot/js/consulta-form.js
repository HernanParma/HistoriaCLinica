// Configuración del formulario de nueva consulta
class ConsultaForm {
    constructor() {
        this.form = null;
        this.patientId = null;
        this.init();
    }

    init() {
        console.log('🔧 Inicializando formulario de nueva consulta...');
        
        // Obtener el ID del paciente de la URL
        this.patientId = this.getPatientIdFromUrl();
        if (!this.patientId) {
            console.error('❌ No se encontró el ID del paciente en la URL');
            return;
        }

        // Configurar el formulario
        this.setupForm();
        
        console.log('✅ Formulario de nueva consulta inicializado correctamente');
    }

    getPatientIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const patientId = params.get('id');
        console.log('🔍 Patient ID extraído de la URL:', patientId);
        return patientId;
    }

    setupForm() {
        this.form = document.getElementById('nuevaConsultaForm');
        if (!this.form) {
            console.error('❌ No se encontró el formulario de nueva consulta');
            return;
        }

        // Agregar event listener para el submit
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        console.log('✅ Event listener del formulario configurado');
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log('📝 Procesando envío del formulario...');

        try {
            // Obtener datos del formulario
            const formData = this.getFormData();
            console.log('📝 Datos del formulario:', formData);

            // Validar datos
            if (!this.validateFormData(formData)) {
                return;
            }

            // Enviar al backend
            await this.submitConsulta(formData);

        } catch (error) {
            console.error('❌ Error al procesar el formulario:', error);
            this.showMessage('Error al procesar el formulario', 'error');
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        const consultaData = {};

        // Procesar campos del formulario
        formData.forEach((value, key) => {
            if (value !== null && value !== undefined && value !== '') {
                consultaData[key] = value;
            }
        });

        // Agregar archivos si existen
        if (window.getUploadedFiles) {
            const uploadedFiles = window.getUploadedFiles();
            if (uploadedFiles && uploadedFiles.length > 0) {
                consultaData.archivosJson = JSON.stringify(uploadedFiles);
                console.log('📁 Archivos incluidos:', uploadedFiles);
            }
        }

        // Agregar ID del paciente
        consultaData.pacienteId = this.patientId;

        return consultaData;
    }

    validateFormData(data) {
        // Validar campos requeridos
        if (!data.fecha || !data.motivo) {
            this.showMessage('La fecha y el motivo son campos obligatorios', 'error');
            return false;
        }

        // Validar formato de fecha
        if (!this.isValidDate(data.fecha)) {
            this.showMessage('La fecha ingresada no es válida', 'error');
            return false;
        }

        console.log('✅ Validación del formulario exitosa');
        return true;
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    async submitConsulta(consultaData) {
        const submitBtn = this.form.querySelector('.submit-btn');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Guardar Consulta';

        try {
            // Deshabilitar botón y mostrar estado de carga
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            }

            // Enviar al backend
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes/${this.patientId}/consultas`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    ...getAuthHeaders() 
                },
                body: JSON.stringify(consultaData)
            });

            if (response.ok) {
                console.log('✅ Consulta agregada exitosamente');
                this.handleSuccess();
            } else {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', errorText);
                this.showMessage(`Error del servidor: ${errorText}`, 'error');
            }

        } catch (error) {
            console.error('❌ Error de conexión:', error);
            this.showMessage('Error de conexión. Verifica tu internet.', 'error');
        } finally {
            // Restaurar botón
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    }

    handleSuccess() {
        // Mostrar mensaje de éxito
        this.showMessage('✅ Consulta guardada exitosamente', 'success');

        // Limpiar formulario
        this.form.reset();

        // Limpiar archivos subidos
        this.clearUploadedFiles();

        // Recargar consultas si están visibles
        this.reloadConsultas();

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
            this.clearMessage();
        }, 3000);
    }

    clearUploadedFiles() {
        const fileList = document.getElementById('fileList');
        if (fileList) {
            fileList.innerHTML = `
                <div class="file-list-placeholder">
                    <i class="fas fa-folder-open"></i>
                    <p>No hay archivos seleccionados</p>
                    <small>Los archivos aparecerán aquí después de seleccionarlos</small>
                </div>
            `;
        }

        // Reinicializar lista de archivos
        if (window.uploadedFiles) {
            window.uploadedFiles = [];
        }
    }

    reloadConsultas() {
        // Si las consultas están visibles, recargarlas
        const historialConsultas = document.getElementById('historialConsultas');
        if (historialConsultas && historialConsultas.style.display !== 'none') {
            setTimeout(() => {
                const btnMostrarHistorial = document.getElementById('btnMostrarHistorial');
                if (btnMostrarHistorial) {
                    btnMostrarHistorial.click();
                }
            }, 1000);
        }
    }

    showMessage(text, type = 'info') {
        const messageDiv = document.getElementById('consultaMessage');
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
        }

        // También mostrar notificación global si existe
        if (window.showNotification) {
            window.showNotification(text, type);
        }
    }

    clearMessage() {
        const messageDiv = document.getElementById('consultaMessage');
        if (messageDiv) {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }
    }
}

// Inicializar el formulario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando formulario de nueva consulta...');
    window.consultaForm = new ConsultaForm();
});

// Función global para obtener headers de autenticación
function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Función global para mostrar notificaciones
function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Crear notificación visual si no existe
    let notification = document.querySelector('.global-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'global-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    // Configurar estilos según el tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;

    // Mostrar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Ocultar después de 5 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
    }, 5000);
}
