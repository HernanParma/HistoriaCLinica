// SOLUCIÓN COMPLETA PARA MOSTRAR CONTENIDO DE CONSULTAS
console.log('🚀 Cargando solución para mostrar contenido de consultas...');

// Configuración global
const CONFIG = {
    API_BASE_URL: window.location.origin
};

// Clase principal para manejar la historia clínica
class HistoriaClinicaSolucionada {
    constructor() {
        this.patientId = null;
        this.historialVisible = false;
        this.init();
    }

    init() {
        console.log('🔧 Inicializando Historia Clínica Solucionada...');
        
        // Obtener el ID del paciente de la URL
        this.patientId = this.getPatientIdFromUrl();
        if (!this.patientId) {
            console.error('❌ No se encontró el ID del paciente en la URL');
            return;
        }

        console.log('✅ Patient ID obtenido:', this.patientId);
        
        // Configurar todas las funcionalidades
        this.setupConsultaForm();
        this.setupHistorialConsultas();
        this.setupGlobalFunctions();
        
        console.log('✅ Historia Clínica Solucionada inicializada correctamente');
    }

    getPatientIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const patientId = params.get('id');
        console.log('🔍 Patient ID extraído de la URL:', patientId);
        return patientId;
    }

    // ===== FORMULARIO DE NUEVA CONSULTA =====
    setupConsultaForm() {
        console.log('🔧 Configurando formulario de nueva consulta...');
        
        const nuevaConsultaForm = document.getElementById('nuevaConsultaForm');
        if (!nuevaConsultaForm) {
            console.error('❌ No se encontró el formulario de nueva consulta');
            return;
        }

        // Agregar event listener para el submit
        nuevaConsultaForm.addEventListener('submit', (e) => this.handleSubmitConsulta(e));
        
        console.log('✅ Event listener del formulario configurado');
    }

    async handleSubmitConsulta(event) {
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
        const form = document.getElementById('nuevaConsultaForm');
        const formData = new FormData(form);
        const consultaData = {};

        // Procesar campos del formulario
        formData.forEach((value, key) => {
            if (value !== null && value !== undefined && value !== '') {
                consultaData[key] = value;
            }
        });

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

        console.log('✅ Validación del formulario exitosa');
        return true;
    }

    async submitConsulta(consultaData) {
        const form = document.getElementById('nuevaConsultaForm');
        const submitBtn = form.querySelector('.submit-btn');
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
                    ...this.getAuthHeaders() 
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
        const form = document.getElementById('nuevaConsultaForm');
        form.reset();

        // Recargar consultas si están visibles
        if (this.historialVisible) {
            setTimeout(() => {
                this.cargarConsultas();
            }, 1000);
        }

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
            this.clearMessage();
        }, 3000);
    }

    // ===== HISTORIAL DE CONSULTAS =====
    setupHistorialConsultas() {
        console.log('🔧 Configurando historial de consultas...');
        
        const btnMostrarHistorial = document.getElementById('btnMostrarHistorial');
        if (!btnMostrarHistorial) {
            console.error('❌ No se encontró el botón de mostrar historial');
            return;
        }

        btnMostrarHistorial.addEventListener('click', () => this.toggleHistorial());
        
        console.log('✅ Historial de consultas configurado');
    }

    async toggleHistorial() {
        if (!this.historialVisible) {
            await this.cargarConsultas();
            this.historialVisible = true;
            const btn = document.getElementById('btnMostrarHistorial');
            btn.innerHTML = '<i class="fas fa-eye-slash"></i> OCULTAR CONSULTAS';
        } else {
            this.ocultarHistorial();
            this.historialVisible = false;
            const btn = document.getElementById('btnMostrarHistorial');
            btn.innerHTML = '<i class="fas fa-history"></i> CONSULTAS ANTERIORES';
        }
    }

    async cargarConsultas() {
        console.log('📖 Cargando consultas del paciente...');
        
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes/${this.patientId}/consultas`, {
                headers: { ...this.getAuthHeaders() }
            });
            
            if (response.ok) {
                const consultas = await response.json();
                console.log('📋 Consultas obtenidas del backend:', consultas);
                
                if (consultas.length > 0) {
                    this.mostrarConsultas(consultas);
                } else {
                    this.mostrarMensajeNoConsultas();
                }
            } else {
                this.mostrarErrorConsultas();
            }
        } catch (error) {
            console.error('❌ Error al cargar consultas:', error);
            this.mostrarErrorConsultas();
        }
        
        this.mostrarHistorial();
    }

    mostrarConsultas(consultas) {
        const historialConsultas = document.getElementById('historialConsultas');
        if (!historialConsultas) return;

        const consultasHtml = consultas.map((c, index) => {
            console.log(`📝 Generando HTML para consulta ${index}:`, c);
            
            // Generar contenido completo de la consulta
            let consultaContent = this.generarContenidoConsulta(c);
            console.log(`📝 Contenido generado para consulta ${index}:`, consultaContent);
            
            return `
                <div class="consulta-item collapsed" data-consulta-id="${c.id}" data-consulta-index="${index}">
                    <div class="consulta-header" onclick="window.toggleConsultaDetalle(${index})" style="cursor: pointer;">
                        <h5><i class="fas fa-calendar-alt"></i> ${new Date(c.fecha).toLocaleDateString('es-ES')}</h5>
                        <span class="consulta-motivo">${c.motivo || 'Sin motivo'}</span>
                        <div class="consulta-actions">
                            <button class="btn-eliminar-consulta" onclick="event.stopPropagation(); window.eliminarConsulta(${c.id}, ${index})" title="Eliminar consulta">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            <i class="fas fa-chevron-down toggle-icon" id="toggle-icon-${index}"></i>
                        </div>
                    </div>
                    <div class="consulta-content" id="consulta-content-${index}" style="display: none;">
                        ${consultaContent}
                    </div>
                </div>
            `;
        }).join('');
        
        historialConsultas.innerHTML = consultasHtml;
        console.log('✅ HTML de consultas generado correctamente');
    }

    generarContenidoConsulta(consulta) {
        let contenido = '';
        
        console.log('🔍 Analizando consulta:', consulta);
        
        // Agregar motivo si existe
        if (consulta.motivo && consulta.motivo.trim() !== '') {
            contenido += `<p><strong>Motivo:</strong> ${consulta.motivo}</p>`;
            console.log('✅ Motivo agregado:', consulta.motivo);
        }
        
        // Agregar recetar si existe (verificar múltiples variaciones)
        if ((consulta.recetar && consulta.recetar.trim() !== '') || 
            (consulta.Recetar && consulta.Recetar.trim() !== '')) {
            const recetarValue = consulta.recetar || consulta.Recetar;
            contenido += `<p><strong>Recetar:</strong> ${recetarValue}</p>`;
            console.log('✅ Recetar agregado:', recetarValue);
        }
        
        // Agregar OME si existe (verificar múltiples variaciones)
        if ((consulta.ome && consulta.ome.trim() !== '') || 
            (consulta.Ome && consulta.Ome.trim() !== '')) {
            const omeValue = consulta.ome || consulta.Ome;
            contenido += `<p><strong>OME:</strong> ${omeValue}</p>`;
            console.log('✅ OME agregado:', omeValue);
        }
        
        // Agregar notas si existen
        if (consulta.notas && consulta.notas.trim() !== '') {
            contenido += `<p><strong>Notas:</strong> ${consulta.notas}</p>`;
            console.log('✅ Notas agregadas:', consulta.notas);
        }
        
        // Agregar resultados de laboratorio si existen
        const labResults = this.generateLabResultsHtml(consulta);
        if (labResults) {
            contenido += labResults;
            console.log('✅ Resultados de laboratorio agregados');
        }
        
        // Agregar archivos si existen
        if (consulta.archivosJson && consulta.archivosJson.trim() !== '') {
            const archivosHtml = this.generateArchivosHtml(consulta.archivosJson);
            if (archivosHtml) {
                contenido += archivosHtml;
                console.log('✅ Archivos agregados');
            }
        }
        
        // Si no hay contenido, mostrar mensaje
        if (contenido.trim() === '') {
            contenido = '<p style="color: #6b7280; font-style: italic;">No hay datos adicionales para mostrar.</p>';
            console.log('⚠️ No se encontraron datos para la consulta, mostrando mensaje por defecto');
        }
        
        console.log('📊 Contenido final generado:', contenido);
        return contenido;
    }

    generateLabResultsHtml(consulta) {
        // Mapear campos del modelo a nombres más legibles
        const labFields = [
            { key: 'gr', label: 'GR' },
            { key: 'hto', label: 'HTO' },
            { key: 'hb', label: 'HB' },
            { key: 'gb', label: 'GB' },
            { key: 'plaq', label: 'PLAQ' },
            { key: 'gluc', label: 'GLUC' },
            { key: 'urea', label: 'UREA' },
            { key: 'cr', label: 'CR' },
            { key: 'got', label: 'GOT' },
            { key: 'gpt', label: 'GPT' },
            { key: 'ct', label: 'CT' },
            { key: 'tg', label: 'TG' },
            { key: 'vitd', label: 'VITD' },
            { key: 'fal', label: 'FAL' },
            { key: 'col', label: 'COL' },
            { key: 'b12', label: 'B12' },
            { key: 'tsh', label: 'TSH' },
            { key: 'urico', label: 'URICO' },
            { key: 'orina', label: 'ORINA' }
        ];
        
        const labResults = labFields.filter(field => {
            const value = consulta[field.key];
            return value !== null && value !== undefined && value !== '' && value !== 0;
        });
        
        if (labResults.length === 0) return '';
        
        let html = '<div class="lab-section"><h6><i class="fas fa-vials"></i> Laboratorio</h6><div class="lab-results-grid">';
        
        labResults.forEach(field => {
            const value = consulta[field.key];
            html += `<div class="lab-item"><strong>${field.label}:</strong> ${value}</div>`;
        });
        
        html += '</div></div>';
        return html;
    }

    generateArchivosHtml(archivosJson) {
        try {
            const archivos = JSON.parse(archivosJson);
            if (!Array.isArray(archivos) || archivos.length === 0) return '';
            
            let html = `<div class="archivos-section"><h6><i class="fas fa-paperclip"></i> Archivos Adjuntos (${archivos.length})</h6><div class="archivos-lista">`;
            
            archivos.forEach(archivo => {
                html += `
                    <div class="archivo-item">
                        <i class="fas ${this.getFileIcon(archivo.extension)}"></i>
                        <a href="${archivo.rutaArchivo}" class="archivo-link" target="_blank">${archivo.nombreOriginal}</a>
                        <span class="archivo-size">${this.formatFileSize(archivo.tamañoBytes)}</span>
                    </div>
                `;
            });
            
            html += '</div></div>';
            return html;
        } catch (error) {
            console.error('❌ Error al parsear archivosJson:', error);
            return '';
        }
    }

    getFileIcon(extension) {
        const iconMap = {
            '.pdf': 'fa-file-pdf',
            '.doc': 'fa-file-word',
            '.docx': 'fa-file-word',
            '.jpg': 'fa-file-image',
            '.jpeg': 'fa-file-image',
            '.png': 'fa-file-image',
            '.gif': 'fa-file-image'
        };
        return iconMap[extension] || 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    mostrarMensajeNoConsultas() {
        const historialConsultas = document.getElementById('historialConsultas');
        if (historialConsultas) {
            historialConsultas.innerHTML = '<p class="no-consultas">No hay consultas registradas.</p>';
        }
    }

    mostrarErrorConsultas() {
        const historialConsultas = document.getElementById('historialConsultas');
        if (historialConsultas) {
            historialConsultas.innerHTML = '<p class="error">Error al cargar las consultas.</p>';
        }
    }

    mostrarHistorial() {
        const historialConsultas = document.getElementById('historialConsultas');
        if (historialConsultas) {
            historialConsultas.style.display = 'block';
        }
    }

    ocultarHistorial() {
        const historialConsultas = document.getElementById('historialConsultas');
        if (historialConsultas) {
            historialConsultas.style.display = 'none';
        }
    }

    // ===== FUNCIONES GLOBALES =====
    setupGlobalFunctions() {
        console.log('🔧 Configurando funciones globales...');
        
        // Función global para toggle de consultas
        window.toggleConsultaDetalle = (index) => {
            console.log(`🔄 Toggle consulta ${index}`);
            const content = document.getElementById(`consulta-content-${index}`);
            const icon = document.getElementById(`toggle-icon-${index}`);
            
            if (!content || !icon) {
                console.error(`❌ No se encontraron elementos para consulta ${index}:`, { content, icon });
                return;
            }
            
            if (content.style.display === 'none' || content.style.display === '') {
                console.log(`📖 Expandiendo consulta ${index}`);
                content.style.display = 'block';
                icon.className = 'fas fa-chevron-up toggle-icon';
                icon.style.transform = 'rotate(180deg)';
                content.parentElement.classList.add('expanded');
                content.parentElement.classList.remove('collapsed');
            } else {
                console.log(`📖 Colapsando consulta ${index}`);
                content.style.display = 'none';
                icon.className = 'fas fa-chevron-down toggle-icon';
                icon.style.transform = 'rotate(0deg)';
                content.parentElement.classList.add('collapsed');
                content.parentElement.classList.remove('expanded');
            }
        };

        // Función global para eliminar consultas
        window.eliminarConsulta = async (consultaId, index) => {
            if (!confirm('¿Estás seguro de que quieres eliminar esta consulta? Esta acción no se puede deshacer.')) {
                return;
            }
            
            try {
                console.log(`🗑️ Eliminando consulta ${consultaId} (índice ${index})`);
                
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes/${this.patientId}/consultas/${consultaId}`, {
                    method: 'DELETE',
                    headers: { ...this.getAuthHeaders() }
                });
                
                if (response.ok) {
                    console.log(`✅ Consulta ${consultaId} eliminada exitosamente`);
                    
                    // Eliminar el elemento del DOM
                    const consultaElement = document.querySelector(`[data-consulta-id="${consultaId}"]`);
                    if (consultaElement) {
                        consultaElement.remove();
                        console.log(`✅ Elemento DOM eliminado`);
                        
                        // Mostrar mensaje de éxito
                        this.mostrarMensajeEliminacion();
                    }
                } else {
                    console.error(`❌ Error al eliminar consulta: ${response.status}`);
                    alert('Error al eliminar la consulta. Por favor, inténtalo de nuevo.');
                }
            } catch (error) {
                console.error('❌ Error de conexión al eliminar consulta:', error);
                alert('Error de conexión. Por favor, verifica tu conexión a internet.');
            }
        };
        
        console.log('✅ Funciones globales configuradas');
    }

    mostrarMensajeEliminacion() {
        const mensaje = document.createElement('div');
        mensaje.className = 'message success';
        mensaje.textContent = 'Consulta eliminada exitosamente';
        mensaje.style.margin = '10px 0';
        
        const historialConsultas = document.getElementById('historialConsultas');
        if (historialConsultas) {
            historialConsultas.insertBefore(mensaje, historialConsultas.firstChild);
            
            // Remover el mensaje después de 3 segundos
            setTimeout(() => {
                if (mensaje.parentNode) {
                    mensaje.remove();
                }
            }, 3000);
        }
    }

    // ===== UTILIDADES =====
    getAuthHeaders() {
        const token = localStorage.getItem('jwtToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    showMessage(text, type = 'info') {
        const messageDiv = document.getElementById('consultaMessage');
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Historia Clínica Solucionada...');
    window.historiaClinica = new HistoriaClinicaSolucionada();
});

console.log('✅ Script de solución cargado correctamente');
