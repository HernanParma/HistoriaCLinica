/**
 * Clase para manejar notificaciones y mensajes de la UI
 */
class UIManager {
    constructor() {
        this.notificationContainer = null;
    }

    /**
     * Muestra una notificación toast
     */
    toast(message, type = 'info', duration = 3000) {
        // Remover notificaciones existentes
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 18px 24px;
            border-radius: 14px;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            z-index: 10000;
            display: flex;
            gap: 12px;
            transform: translateX(110%);
            transition: transform .35s cubic-bezier(.34,1.56,.64,1);
            box-shadow: 0 10px 30px rgba(0,0,0,.3);
        `;

        // Color de fondo según el tipo
        const colors = {
            success: 'linear-gradient(135deg,#10b981,#059669)',
            error: 'linear-gradient(135deg,#ef4444,#dc2626)',
            warning: 'linear-gradient(135deg,#f59e0b,#d97706)',
            info: 'linear-gradient(135deg,#667eea,#764ba2)'
        };
        notification.style.background = colors[type] || colors.info;

        // Icono según el tipo
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div style="font-size: 20px">
                <i class="fas ${icons[type] || icons.info}"></i>
            </div>
            <div>${message}</div>
        `;

        document.body.appendChild(notification);

        // Animación de entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            notification.style.transform = 'translateX(110%)';
            setTimeout(() => notification.remove(), 350);
        }, duration);
    }

    /**
     * Muestra un mensaje inline en un contenedor
     */
    showInlineMessage(containerSelector, message, kind = 'error') {
        const container = typeof containerSelector === 'string' 
            ? document.querySelector(containerSelector) 
            : containerSelector;
        
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `${kind}-message`;
        messageDiv.innerHTML = `
            <i class="fas ${kind === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.prepend(messageDiv);
        
        // Auto-remover
        const duration = kind === 'error' ? 5000 : 3000;
        setTimeout(() => messageDiv.remove(), duration);
    }

    /**
     * Muestra un loading spinner
     */
    showLoading(containerSelector, message = 'Cargando...') {
        const container = typeof containerSelector === 'string' 
            ? document.querySelector(containerSelector) 
            : containerSelector;
        
        if (!container) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>${message}</span>
        `;
        
        container.innerHTML = '';
        container.appendChild(loadingDiv);
    }

    /**
     * Muestra un mensaje de error
     */
    showError(containerSelector, message, details = '') {
        const container = typeof containerSelector === 'string' 
            ? document.querySelector(containerSelector) 
            : containerSelector;
        
        if (!container) return;

        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                ${details ? `<small>${details}</small>` : ''}
            </div>
        `;
    }

    /**
     * Muestra un mensaje de "sin datos"
     */
    showNoData(containerSelector, message = 'No hay datos disponibles', icon = 'fa-inbox') {
        const container = typeof containerSelector === 'string' 
            ? document.querySelector(containerSelector) 
            : containerSelector;
        
        if (!container) return;

        container.innerHTML = `
            <div class="no-data">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
        `;
    }

    /**
     * Confirma una acción con el usuario
     */
    confirm(message, title = 'Confirmar') {
        return new Promise((resolve) => {
            const result = window.confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }

    /**
     * Muestra un modal de confirmación personalizado
     */
    showConfirmModal(message, title = 'Confirmar') {
        return new Promise((resolve) => {
            // Crear modal si no existe
            let modal = document.getElementById('confirmModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'confirmModal';
                modal.className = 'modal hidden';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="confirmTitle">${title}</h3>
                            <button type="button" class="close-btn" id="confirmClose">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p id="confirmMessage">${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="confirmCancel">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirmOk">Aceptar</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            // Actualizar contenido
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;

            // Mostrar modal
            modal.classList.remove('hidden');
            modal.classList.add('show');

            // Event listeners
            const cleanup = () => {
                modal.classList.remove('show');
                modal.classList.add('hidden');
                document.getElementById('confirmOk').removeEventListener('click', onOk);
                document.getElementById('confirmCancel').removeEventListener('click', onCancel);
                document.getElementById('confirmClose').removeEventListener('click', onCancel);
                modal.removeEventListener('click', onBackdrop);
            };

            const onOk = () => {
                cleanup();
                resolve(true);
            };

            const onCancel = () => {
                cleanup();
                resolve(false);
            };

            const onBackdrop = (e) => {
                if (e.target === modal) onCancel();
            };

            document.getElementById('confirmOk').addEventListener('click', onOk);
            document.getElementById('confirmCancel').addEventListener('click', onCancel);
            document.getElementById('confirmClose').addEventListener('click', onCancel);
            modal.addEventListener('click', onBackdrop);
        });
    }

    /**
     * Actualiza el estado de un botón durante una operación
     */
    setButtonLoading(button, loading = true, loadingText = 'Cargando...', originalText = '') {
        if (!button) return;

        if (loading) {
            button.dataset.originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
        } else {
            button.disabled = false;
            button.innerHTML = originalText || button.dataset.originalText || button.innerHTML;
        }
    }
}
