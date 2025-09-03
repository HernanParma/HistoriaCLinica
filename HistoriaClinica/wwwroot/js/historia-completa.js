// Configuración completa de la historia clínica
class HistoriaClinica {
    constructor() {
        this.patientId = null;
        this.historialVisible = false;
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Historia Clínica completa...');
        
        // Obtener el ID del paciente de la URL
        this.patientId = this.getPatientIdFromUrl();
        if (!this.patientId) {
            console.error('❌ No se encontró el ID del paciente en la URL');
            return;
        }

        // Configurar todas las funcionalidades
        this.setupConsultaForm();
        this.setupHistorialConsultas();
        this.setupFileUpload();
        
        console.log('✅ Historia Clínica inicializada correctamente');
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

        // Limpiar archivos subidos
        this.clearUploadedFiles();

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
                console.log('📋 Consultas obtenidas:', consultas);
                
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
        
        // Agregar motivo si existe
        if (consulta.motivo && consulta.motivo.trim() !== '') {
            contenido += `<p><strong>Motivo:</strong> ${consulta.motivo}</p>`;
        }
        
        // Agregar recetar si existe (verificar múltiples variaciones)
        if ((consulta.recetar && consulta.recetar.trim() !== '') || 
            (consulta.Recetar && consulta.Recetar.trim() !== '') ||
            (consulta.RECETAR && consulta.RECETAR.trim() !== '')) {
            const recetarValue = consulta.recetar || consulta.Recetar || consulta.RECETAR;
            contenido += `<p><strong>Recetar:</strong> ${recetarValue}</p>`;
        }
        
        // Agregar OME si existe (verificar múltiples variaciones)
        if ((consulta.ome && consulta.ome.trim() !== '') || 
            (consulta.Ome && consulta.Ome.trim() !== '') ||
            (consulta.OME && consulta.OME.trim() !== '')) {
            const omeValue = consulta.ome || consulta.Ome || consulta.OME;
            contenido += `<p><strong>OME:</strong> ${omeValue}</p>`;
        }
        
        // Agregar notas si existen
        if (consulta.notas && consulta.notas.trim() !== '') {
            contenido += `<p><strong>Notas:</strong> ${consulta.notas}</p>`;
        }
        
        // Agregar resultados de laboratorio si existen
        const labResults = this.generateLabResultsHtml(consulta);
        if (labResults) {
            contenido += labResults;
        }
        
        // Agregar archivos si existen
        if (consulta.archivosJson && consulta.archivosJson.trim() !== '') {
            const archivosHtml = this.generateArchivosHtml(consulta.archivosJson);
            if (archivosHtml) {
                contenido += archivosHtml;
            }
        }
        
        // Si no hay contenido, mostrar mensaje
        if (contenido.trim() === '') {
            contenido = '<p style="color: #6b7280; font-style: italic;">No hay datos adicionales para mostrar.</p>';
        }
        
        return contenido;
    }

    generateLabResultsHtml(consulta) {
        const labFields = ['gr', 'hto', 'hb', 'gb', 'plaq', 'gluc', 'urea', 'cr', 'got', 'gpt', 'ct', 'tg', 'vitd', 'fal', 'col', 'b12', 'tsh', 'urico', 'orina'];
        const labResults = labFields.filter(field => consulta[field] && consulta[field].toString().trim() !== '');
        
        if (labResults.length === 0) return '';
        
        let html = '<div class="lab-section"><h6><i class="fas fa-vials"></i> Laboratorio</h6><div class="lab-results-grid">';
        
        labResults.forEach(field => {
            html += `<div class="lab-item"><strong>${field.toUpperCase()}:</strong> ${consulta[field]}</div>`;
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
        // Función global para toggle de consultas
        window.toggleConsultaDetalle = (index) => {
            console.log(`🔄 Toggle consulta ${index}`);
            const content = document.getElementById(`consulta-content-${index}`);
            const icon = document.getElementById(`toggle-icon-${index}`);
            
            if (!content || !icon) {
                console.error(`❌ No se encontraron elementos para consulta ${index}`);
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

    // ===== UPLOAD DE ARCHIVOS =====
    setupFileUpload() {
        console.log('🔧 Configurando upload de archivos...');
        
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        
        if (!fileUploadArea || !fileInput || !fileList) {
            console.error('❌ No se encontraron elementos de upload de archivos');
            return;
        }

        let uploadedFiles = [];

        // Click en el área de upload
        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', (e) => {
            if (!fileUploadArea.contains(e.relatedTarget)) {
                fileUploadArea.classList.remove('dragover');
            }
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });

        // Selección de archivos
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFiles(files);
        });

        // Función para obtener archivos subidos
        window.getUploadedFiles = () => uploadedFiles;

        // Función para remover archivo
        window.removeFileItem = (button) => {
            const fileItem = button.closest('.file-item');
            const fileName = fileItem.querySelector('.file-name').textContent;
            
            uploadedFiles = uploadedFiles.filter(file => file.nombreOriginal !== fileName);
            fileItem.remove();
            
            if (fileList.children.length === 0) {
                fileList.innerHTML = `
                    <div class="file-list-placeholder">
                        <i class="fas fa-folder-open"></i>
                        <p>No hay archivos seleccionados</p>
                        <small>Los archivos aparecerán aquí después de seleccionarlos</small>
                    </div>
                `;
            }
        };

        console.log('✅ Upload de archivos configurado');
    }

    handleFiles(files) {
        const fileList = document.getElementById('fileList');
        
        // Limpiar placeholder si hay archivos
        const placeholder = fileList.querySelector('.file-list-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        files.forEach(file => {
            // Validar tamaño (10MB)
            if (file.size > 10 * 1024 * 1024) {
                this.showNotification(`El archivo ${file.name} es demasiado grande. Máximo 10MB`, 'error');
                return;
            }

            // Validar tipo
            const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!allowedTypes.includes(extension)) {
                this.showNotification(`Tipo de archivo no permitido: ${file.name}`, 'error');
                return;
            }

            this.uploadFile(file);
        });
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const fileList = document.getElementById('fileList');
        const fileItem = this.createFileItem(file, true);
        fileList.appendChild(fileItem);

        const progressBar = fileItem.querySelector('.upload-progress-bar');
        const fileSize = fileItem.querySelector('.file-size');

        try {
            // Simular progreso durante la carga
            let progress = 0;
            const progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.random() * 15;
                    progressBar.style.width = `${progress}%`;
                    fileSize.textContent = `Subiendo... ${Math.round(progress)}%`;
                }
            }, 200);

            const response = await fetch(`${CONFIG.API_BASE_URL}/api/Pacientes/upload-file`, {
                method: 'POST',
                headers: { ...this.getAuthHeaders() },
                body: formData
            });

            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            fileSize.textContent = 'Completado';

            await new Promise(resolve => setTimeout(resolve, 500));

            if (response.ok) {
                const uploadedFile = await response.json();
                window.uploadedFiles.push(uploadedFile);
                
                this.updateFileItem(fileItem, uploadedFile);
                this.showNotification(`✅ Archivo ${file.name} subido exitosamente`, 'success');
                
                console.log('📁 Archivo subido:', uploadedFile);
            } else {
                const error = await response.text();
                this.showNotification(`❌ Error al subir ${file.name}: ${error}`, 'error');
                fileList.removeChild(fileItem);
            }
        } catch (error) {
            this.showNotification(`❌ Error de conexión al subir ${file.name}`, 'error');
            fileList.removeChild(fileItem);
        }
    }

    createFileItem(file, isUploading = false) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        if (isUploading) {
            fileItem.innerHTML = `
                <div class="file-item-info">
                    <i class="fas fa-spinner fa-spin file-icon"></i>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">Subiendo...</div>
                    </div>
                </div>
                <div class="file-actions">
                    <div class="upload-progress">
                        <div class="upload-progress-bar" style="width: 0%"></div>
                    </div>
                </div>
            `;
        } else {
            fileItem.innerHTML = `
                <div class="file-item-info">
                    <i class="fas ${this.getFileIcon('.' + file.name.split('.').pop())} file-icon"></i>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn-remove-file" onclick="removeFileItem(this)">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            `;
        }
        
        return fileItem;
    }

    updateFileItem(fileItem, uploadedFile) {
        const fileIcon = fileItem.querySelector('.file-icon');
        const fileName = fileItem.querySelector('.file-name');
        const fileSize = fileItem.querySelector('.file-size');
        const fileActions = fileItem.querySelector('.file-actions');
        
        fileIcon.className = `fas ${this.getFileIcon(uploadedFile.extension)} file-icon`;
        fileName.textContent = uploadedFile.nombreOriginal;
        fileSize.textContent = this.formatFileSize(uploadedFile.tamañoBytes);
        
        fileItem.classList.add('upload-success');
        
        fileActions.style.transition = 'all 0.3s ease';
        fileActions.innerHTML = `
            <button class="btn-remove-file" onclick="removeFileItem(this)">
                <i class="fas fa-trash"></i>
                Eliminar
            </button>
        `;
        
        setTimeout(() => {
            fileItem.classList.remove('upload-success');
        }, 2000);
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

    showNotification(message, type = 'info') {
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

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Historia Clínica completa...');
    window.historiaClinica = new HistoriaClinica();
    
    // Configurar funciones globales después de la inicialización
    setTimeout(() => {
        if (window.historiaClinica) {
            window.historiaClinica.setupGlobalFunctions();
        }
    }, 100);
});
