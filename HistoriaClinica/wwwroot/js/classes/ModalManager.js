/**
 * Clase para manejar modales y sus operaciones
 */
class ModalManager {
    constructor(uiManager, fileManager, labFieldsManager, consultaManager) {
        this.uiManager = uiManager;
        this.fileManager = fileManager;
        this.labFieldsManager = labFieldsManager;
        this.consultaManager = consultaManager;
        this.selectedFiles = [];
    }

    /**
     * Inicializa el modal de nueva consulta
     */
    initializeNuevaConsultaModal() {
        const modal = document.getElementById('modalNuevaConsulta');
        const btnOpen = document.getElementById('btnNuevaConsulta');
        const btnClose = document.getElementById('closeModalNuevaConsulta');
        const btnCancel = document.getElementById('cancelarNuevaConsulta');
        const form = document.getElementById('formNuevaConsulta');
        const fecha = document.getElementById('fechaConsulta');
        const fileInput = document.getElementById('archivosConsulta');
        const fileList = document.getElementById('archivosSeleccionados');

        if (!modal || !form) return;

        // Configurar fecha por defecto
        if (fecha) {
            fecha.value = new Date().toISOString().split('T')[0];
        }

        // Reset del modal
        const resetModal = () => {
            modal.classList.remove('show');
            modal.classList.add('hidden');
            form.reset();
            this.selectedFiles = [];
            this.renderSelectedFiles(fileList);
            this.labFieldsManager.clearHighlightedFields(modal);
            if (fecha) {
                fecha.value = new Date().toISOString().split('T')[0];
            }
        };

        // Renderizar archivos seleccionados
        this.renderSelectedFiles = (container) => {
            if (!container) return;
            container.innerHTML = this.fileManager.renderSelectedFiles(this.selectedFiles);
        };

        // Event listeners
        btnOpen?.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.classList.add('show');
            document.getElementById('motivoConsulta')?.focus();
            this.labFieldsManager.setupLabLabelClickHandlers(modal);
            setTimeout(() => this.labFieldsManager.setupLabLabelClickHandlers(modal), 200);
        });

        btnClose?.addEventListener('click', resetModal);
        btnCancel?.addEventListener('click', resetModal);

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                resetModal();
            }
        });

        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) resetModal();
        });

        // Manejo de archivos
        fileInput?.addEventListener('change', (e) => {
            try {
                const files = Array.from(e.target.files || []);
                this.selectedFiles = this.fileManager.handleFileSelection(fileInput, this.selectedFiles);
                this.renderSelectedFiles(fileList);
            } catch (error) {
                this.uiManager.toast(error.message, 'error');
            }
        });

        // Máscara decimal para campos de laboratorio
        this.labFieldsManager.attachDecimalMask([
            'grConsulta', 'htoConsulta', 'hbConsulta', 'gbConsulta', 'plaqConsulta', 
            'glucConsulta', 'ureaConsulta', 'crConsulta', 'gotConsulta', 'gptConsulta', 
            'ctConsulta', 'tgConsulta', 'vitdConsulta', 'falConsulta', 'hdlConsulta', 
            'ldlConsulta', 'b12Consulta', 'tshConsulta', 't4lConsulta', 'uricoConsulta', 'psaConsulta', 
            'hba1cConsulta'
        ]);

        // Submit del formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleNuevaConsultaSubmit(form, modal, resetModal);
        });
    }

    /**
     * Maneja el envío del formulario de nueva consulta
     */
    async handleNuevaConsultaSubmit(form, modal, resetModal) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.innerHTML;

        try {
            this.uiManager.setButtonLoading(submitBtn, true, 'Guardando...');

            const patientId = this.getPatientIdFromUrl();
            if (!patientId) {
                throw new Error('No se encontró ID del paciente');
            }

            // Subir archivos si hay
            const uploadedFiles = this.selectedFiles.length ? 
                await this.fileManager.uploadFiles(this.selectedFiles) : [];

            // Construir payload
            const payload = this.labFieldsManager.buildLabPayload(form, modal);
            if (!payload.motivo?.trim()) {
                this.uiManager.toast('El motivo de la consulta es requerido', 'error');
                return;
            }

            payload.archivos = uploadedFiles;

            // Crear consulta
            await this.consultaManager.createConsultation(patientId, payload);
            resetModal();
        } catch (error) {
            this.uiManager.toast(`Error al crear consulta: ${error.message}`, 'error');
        } finally {
            this.uiManager.setButtonLoading(submitBtn, false, '', originalText);
        }
    }

    /**
     * Inicializa el modal de editar consulta
     */
    initializeEditarConsultaModal() {
        const modal = document.getElementById('modalEditarConsulta');
        const form = document.getElementById('formEditarConsulta');
        const btnClose = document.getElementById('closeModalEditarConsulta');
        const btnCancel = document.getElementById('cancelarEditarConsulta');

        if (!modal || !form) return;

        // Event listeners
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEditarConsultaSubmit(form);
        });

        btnClose?.addEventListener('click', () => this.closeEditarConsultaModal());
        btnCancel?.addEventListener('click', () => this.closeEditarConsultaModal());

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                this.closeEditarConsultaModal();
            }
        });

        // Cerrar al hacer clic fuera del modal - DESHABILITADO
        // modal.addEventListener('click', (e) => {
        //     if (e.target === modal) this.closeEditarConsultaModal();
        // });

        // Máscara decimal para campos de laboratorio
        this.labFieldsManager.attachDecimalMask([
            'grEditarConsulta', 'htoEditarConsulta', 'hbEditarConsulta', 'gbEditarConsulta', 
            'plaqEditarConsulta', 'glucEditarConsulta', 'ureaEditarConsulta', 'crEditarConsulta',
            'gotEditarConsulta', 'gptEditarConsulta', 'ctEditarConsulta', 'tgEditarConsulta', 
            'vitdEditarConsulta', 'falEditarConsulta', 'hdlEditarConsulta', 'ldlEditarConsulta',
            'b12EditarConsulta', 'tshEditarConsulta', 't4lEditarConsulta', 'uricoEditarConsulta', 'psaEditarConsulta', 
            'hba1cEditarConsulta'
        ]);
    }

    /**
     * Maneja el envío del formulario de editar consulta
     */
    async handleEditarConsultaSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.innerHTML;

        try {
            this.uiManager.setButtonLoading(submitBtn, true, 'Guardando...');

            const patientId = this.getPatientIdFromUrl();
            const modal = document.getElementById('modalEditarConsulta');
            const payload = this.labFieldsManager.buildLabPayload(form, modal);

            if (!payload.motivo?.trim()) {
                this.uiManager.toast('El motivo de la consulta es requerido', 'error');
                return;
            }

            await this.consultaManager.updateConsultation(patientId, this.consultaManager.currentEditingId, payload);
            this.closeEditarConsultaModal();
        } catch (error) {
            this.uiManager.toast(`Error al actualizar consulta: ${error.message}`, 'error');
        } finally {
            this.uiManager.setButtonLoading(submitBtn, false, '', originalText);
        }
    }

    /**
     * Cierra el modal de editar consulta
     */
    closeEditarConsultaModal() {
        const modal = document.getElementById('modalEditarConsulta');
        if (!modal) return;

        modal.classList.remove('show');
        modal.classList.add('hidden');
        document.getElementById('formEditarConsulta')?.reset();
        this.consultaManager.currentEditingId = null;
        this.labFieldsManager.clearHighlightedFields(modal);
    }

    /**
     * Inicializa los modales de medicación y antecedentes
     */
    initializeMedAnteModals() {
        const modalMed = document.getElementById('modalMedicacion');
        const modalAnte = document.getElementById('modalAntecedentes');
        const closeMed = document.getElementById('closeModalMedicacion');
        const closeAnte = document.getElementById('closeModalAntecedentes');
        const btnCloseMed = document.getElementById('cerrarModalMedicacion');
        const btnCloseAnte = document.getElementById('cerrarModalAntecedentes');

        const openModal = (modal) => {
            modal?.classList.remove('hidden');
            modal?.classList.add('show');
        };

        const closeModal = (modal) => {
            modal?.classList.remove('show');
            modal?.classList.add('hidden');
        };

        // Event listeners para medicación
        closeMed?.addEventListener('click', () => closeModal(modalMed));
        btnCloseMed?.addEventListener('click', () => closeModal(modalMed));
        // Cerrar modal al hacer clic fuera - DESHABILITADO
        // modalMed?.addEventListener('click', (e) => {
        //     if (e.target === modalMed) closeModal(modalMed);
        // });

        // Event listeners para antecedentes
        closeAnte?.addEventListener('click', () => closeModal(modalAnte));
        btnCloseAnte?.addEventListener('click', () => closeModal(modalAnte));
        // Cerrar modal al hacer clic fuera - DESHABILITADO
        // modalAnte?.addEventListener('click', (e) => {
        //     if (e.target === modalAnte) closeModal(modalAnte);
        // });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (modalMed && !modalMed.classList.contains('hidden')) closeModal(modalMed);
                if (modalAnte && !modalAnte.classList.contains('hidden')) closeModal(modalAnte);
            }
        });
    }

    /**
     * Remueve un archivo de la lista seleccionada
     */
    removeFile(index) {
        const fileInput = document.getElementById('archivosConsulta');
        this.selectedFiles = this.fileManager.removeFile(this.selectedFiles, index, fileInput);
        this.renderSelectedFiles(document.getElementById('archivosSeleccionados'));
    }

    /**
     * Obtiene el ID del paciente desde la URL
     */
    getPatientIdFromUrl() {
        return new URLSearchParams(window.location.search).get('id');
    }

    /**
     * Muestra un modal de confirmación
     */
    async showConfirmModal(message, title = 'Confirmar') {
        return await this.uiManager.showConfirmModal(message, title);
    }

    /**
     * Muestra un modal de información
     */
    showInfoModal(message, title = 'Información') {
        // Implementar si es necesario
        this.uiManager.toast(message, 'info');
    }

    /**
     * Muestra un modal de error
     */
    showErrorModal(message, title = 'Error') {
        // Implementar si es necesario
        this.uiManager.toast(message, 'error');
    }

    /**
     * Muestra un modal de éxito
     */
    showSuccessModal(message, title = 'Éxito') {
        // Implementar si es necesario
        this.uiManager.toast(message, 'success');
    }
}

