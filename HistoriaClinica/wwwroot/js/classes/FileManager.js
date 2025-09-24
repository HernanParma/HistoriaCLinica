/**
 * Clase para manejar archivos y operaciones relacionadas
 */
class FileManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxFiles = 5;
        this.allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', '.txt'];
    }

    /**
     * Formatea el tamaño de un archivo
     */
    formatFileSize(bytes = 0) {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }

    /**
     * Obtiene el icono de un archivo según su extensión
     */
    getFileIcon(extension = '') {
        const ext = extension.toLowerCase();
        const iconMap = {
            '.pdf': 'fa-file-pdf',
            '.jpg': 'fa-file-image',
            '.jpeg': 'fa-file-image',
            '.png': 'fa-file-image',
            '.gif': 'fa-file-image',
            '.bmp': 'fa-file-image',
            '.doc': 'fa-file-word',
            '.docx': 'fa-file-word',
            '.xls': 'fa-file-excel',
            '.xlsx': 'fa-file-excel',
            '.csv': 'fa-file-excel',
            '.txt': 'fa-file-alt'
        };
        return iconMap[ext] || 'fa-file';
    }

    /**
     * Valida un archivo
     */
    validateFile(file) {
        const errors = [];

        // Verificar tamaño
        if (file.size > this.maxFileSize) {
            errors.push(`El archivo ${file.name} excede el tamaño máximo de ${this.formatFileSize(this.maxFileSize)}`);
        }

        // Verificar extensión
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.allowedExtensions.includes(extension)) {
            errors.push(`El archivo ${file.name} tiene una extensión no permitida`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida una lista de archivos
     */
    validateFiles(files) {
        const errors = [];

        // Verificar cantidad máxima
        if (files.length > this.maxFiles) {
            errors.push(`Máximo ${this.maxFiles} archivos permitidos`);
            return { isValid: false, errors };
        }

        // Validar cada archivo
        for (const file of files) {
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                errors.push(...validation.errors);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sube un archivo
     */
    async uploadFile(file) {
        const validation = this.validateFile(file);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        return await this.apiClient.uploadFile(file);
    }

    /**
     * Sube múltiples archivos
     */
    async uploadFiles(files) {
        const validation = this.validateFiles(files);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        return await this.apiClient.uploadFiles(files);
    }

    /**
     * Renderiza la lista de archivos adjuntos
     */
    renderAttachedFiles(archivos) {
        if (!Array.isArray(archivos) || !archivos.length) return '';

        const items = archivos.map(archivo => {
            const ext = (archivo.extension || archivo.Extension || '').toLowerCase();
            const icon = this.getFileIcon(ext);
            const size = this.formatFileSize(archivo.tamañoBytes || archivo.TamañoBytes);
            const name = archivo.nombreOriginal || archivo.NombreOriginal || 'archivo';
            const url = archivo.urlDescarga || archivo.UrlDescarga || `/api/pacientes/archivos/${archivo.nombreArchivo || archivo.NombreArchivo || ''}`;
            
            return `
                <div class="archivo-adjunto">
                    <div class="archivo-info">
                        <i class="fas ${icon}"></i>
                        <div class="archivo-details">
                            <a href="${url}" target="_blank" class="archivo-link">${name}</a>
                            <small class="archivo-size">${size}</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="archivos-section">
                <div class="detail-item">
                    <strong><i class="fas fa-paperclip"></i> Archivos Adjuntos (${archivos.length}):</strong>
                    <div class="archivos-lista">${items}</div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza la lista de archivos seleccionados para subir
     */
    renderSelectedFiles(files) {
        if (!files || !files.length) return '';

        return files.map((file, index) => `
            <div class="archivo-item">
                <div class="archivo-info">
                    <div class="archivo-icono">
                        <i class="fas ${this.getFileIcon('.' + file.name.split('.').pop())}"></i>
                    </div>
                    <div>
                        <div class="archivo-nombre">${file.name}</div>
                        <div class="archivo-tamaño">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button type="button" class="btn-eliminar-archivo" onclick="fileManager.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    /**
     * Maneja la selección de archivos
     */
    handleFileSelection(inputElement, filesList) {
        const files = Array.from(inputElement.files || []);
        
        // Validar archivos
        const validation = this.validateFiles(files);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // Agregar archivos únicos
        files.forEach(file => {
            if (!filesList.find(f => f.name === file.name)) {
                filesList.push(file);
            }
        });

        // Actualizar el input
        const dataTransfer = new DataTransfer();
        filesList.forEach(file => dataTransfer.items.add(file));
        inputElement.files = dataTransfer.files;

        return filesList;
    }

    /**
     * Remueve un archivo de la lista
     */
    removeFile(filesList, index, inputElement) {
        filesList.splice(index, 1);
        
        if (inputElement) {
            const dataTransfer = new DataTransfer();
            filesList.forEach(file => dataTransfer.items.add(file));
            inputElement.files = dataTransfer.files;
        }
        
        return filesList;
    }

    /**
     * Obtiene la URL de descarga de un archivo
     */
    getDownloadUrl(fileName) {
        return `${window.CONFIG?.API_BASE_URL || window.location.origin}/api/pacientes/archivos/${fileName}`;
    }

    /**
     * Descarga un archivo
     */
    async downloadFile(fileName) {
        const url = this.getDownloadUrl(fileName);
        const response = await fetch(url, {
            headers: this.apiClient.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error al descargar archivo: ${response.statusText}`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(downloadUrl);
    }
}
