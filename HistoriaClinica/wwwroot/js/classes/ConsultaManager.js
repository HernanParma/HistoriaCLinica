/**
 * Clase para manejar operaciones de consultas
 */
class ConsultaManager {
    constructor(apiClient, uiManager, fileManager, labFieldsManager) {
        this.apiClient = apiClient;
        this.uiManager = uiManager;
        this.fileManager = fileManager;
        this.labFieldsManager = labFieldsManager;
        this.currentEditingId = null;
    }

    /**
     * Carga las consultas de un paciente
     */
    async loadPatientConsultations(patientId) {
        const hcBody = document.getElementById('hc-body');
        if (hcBody) {
            this.uiManager.showLoading(hcBody, 'Cargando historia clínica...');
        }

        try {
            const consultas = await this.apiClient.getPatientConsultations(patientId);
            this.renderConsultas(consultas);
            return consultas;
        } catch (error) {
            console.error('Error loading consultations:', error);
            if (hcBody) {
                this.uiManager.showError(hcBody, 'Ocurrió un error al cargar las consultas.', error.message);
            }
            throw error;
        }
    }

    /**
     * Renderiza la lista de consultas
     */
    renderConsultas(consultas) {
        const hcBody = document.getElementById('hc-body');
        if (!hcBody) return;

        if (!consultas?.length) {
            hcBody.innerHTML = `
                <div class="no-consultations">
                    <i class="fas fa-notes-medical"></i>
                    <span>No hay consultas registradas para este paciente</span>
                    <br><small>Puede agregar una nueva consulta cuando sea necesario</small>
                </div>`;
            return;
        }

        hcBody.innerHTML = consultas.map(consulta => this.renderConsultaItem(consulta)).join('');
    }

    /**
     * Renderiza un elemento de consulta individual
     */
    renderConsultaItem(consulta) {
        const id = consulta.id || consulta.Id;
        const fecha = consulta.fecha || consulta.Fecha;
        const motivo = consulta.motivo || consulta.Motivo;
        const recetar = consulta.recetar || consulta.Recetar;
        const ome = consulta.ome || consulta.Ome;
        const notas = consulta.notas || consulta.Notas;
        const archivos = consulta.archivos || consulta.Archivos;

        return `
            <div class="consulta-item">
                <div class="consulta-header" onclick="consultaManager.toggleConsultaDetalle(this)">
                    <div class="consulta-fecha">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${new Date(fecha).toLocaleDateString()}</span>
                    </div>
                    <div class="consulta-actions">
                        <button class="btn-editar-consulta" onclick="consultaManager.editarConsulta(${id})" title="Editar consulta">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-eliminar-consulta" onclick="consultaManager.eliminarConsulta(${id})" title="Eliminar consulta">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                        <i class="fas fa-chevron-down toggle-icon"></i>
                    </div>
                </div>

                <div class="consulta-content collapsed">
                    <div class="consulta-details">
                        ${motivo ? `<div class="detail-item"><strong>Motivo:</strong> ${motivo}</div>` : ''}
                        ${this.renderCardConBoton('recetar', 'Recetar', 'linear-gradient(135deg,#fef3c7,#fde68a)', consulta)}
                        ${this.renderCardConBoton('ome', 'OME', 'linear-gradient(135deg,#fee2e2,#fecaca)', consulta)}
                        ${notas ? `<div class="detail-item"><strong>Notas:</strong> ${notas}</div>` : ''}
                        ${this.fileManager.renderAttachedFiles(archivos)}
                    </div>

                    <div class="consulta-actions-bottom">
                        <button class="btn-ver-laboratorio" onclick="consultaManager.toggleLaboratorio(${id}, event)" title="Ver valores de laboratorio">
                            <i class="fas fa-flask"></i> Ver Laboratorio
                        </button>
                    </div>

                    <div id="laboratorio-${id}" class="laboratorio-section hidden">
                        <div class="laboratorio-grid">${this.labFieldsManager.renderLaboratorioValues(consulta)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza una tarjeta con botón (para Recetar/OME)
     */
    renderCardConBoton(key, title, gradient, consulta) {
        const texto = consulta[key] || consulta[key.charAt(0).toUpperCase() + key.slice(1)];
        const revisado = consulta[`${key}Revisado`] || consulta[`${key.charAt(0).toUpperCase() + key.slice(1)}Revisado`];
        
        if (!texto || String(texto).trim() === '') return '';

        const id = consulta.id || consulta.Id;
        return `
            <div class="detail-item ${key}-item" style="display:flex;flex-direction:column;gap:12px;padding:16px;background:${gradient};border-left:4px solid rgba(0,0,0,.18);border-radius:8px;margin:8px 0;">
                <div style="display:flex;gap:12px;align-items:flex-start">
                    <div style="min-width:80px;font-weight:700;color:#111827;font-size:.95em;">${title}:</div>
                    <div style="flex:1;color:#111827;line-height:1.5;font-size:.95em;">${texto}</div>
                </div>
                ${
                    !revisado
                        ? `<div class="revision-controls-historial" style="display:flex;justify-content:flex-end;margin-top:8px;">
                             <button type="button" class="btn btn-success btn-sm marcar-revisado-btn" data-consulta-id="${id}" data-campo="${key}" style="padding:8px 16px;border-radius:6px;font-size:.85em;font-weight:600;background:linear-gradient(135deg,#10b981,#059669);border:none;color:#fff;cursor:pointer;box-shadow:0 2px 4px rgba(16,185,129,.3)">
                               <i class="fas fa-check"></i> Realizado
                             </button>
                           </div>`
                        : `<div class="revision-status-historial" style="display:flex;justify-content:flex-end;margin-top:8px;">
                             <span class="revision-status" style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);color:#065f46;border-radius:6px;font-size:.85em;font-weight:600;border:1px solid #a7f3d0;">
                               <i class="fas fa-check-circle"></i> Revisado
                             </span>
                           </div>`
                }
            </div>
        `;
    }

    /**
     * Alterna el detalle de una consulta
     */
    toggleConsultaDetalle(header) {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.toggle-icon');
        const isCollapsed = content.classList.contains('collapsed');
        
        content.classList.toggle('collapsed', !isCollapsed);
        content.classList.toggle('expanded', isCollapsed);
        icon.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    /**
     * Alterna la visualización del laboratorio
     */
    toggleLaboratorio(consultaId, event) {
        const lab = document.getElementById(`laboratorio-${consultaId}`);
        const btn = event?.target.closest('.btn-ver-laboratorio');
        const hidden = lab.classList.contains('hidden');
        
        lab.classList.toggle('hidden', !hidden);
        lab.classList.toggle('show', hidden);
        
        if (btn) {
            btn.innerHTML = hidden ? '<i class="fas fa-eye-slash"></i> Ocultar Laboratorio' : '<i class="fas fa-flask"></i> Ver Laboratorio';
            btn.classList.toggle('active', hidden);
        }
    }

    /**
     * Crea una nueva consulta
     */
    async createConsultation(patientId, data) {
        try {
            const response = await this.apiClient.createConsultation(patientId, data);
            this.uiManager.toast('Consulta creada exitosamente', 'success');
            await this.loadPatientConsultations(patientId);
            return response;
        } catch (error) {
            this.uiManager.toast(`Error al crear consulta: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Edita una consulta existente
     */
    async editConsultation(consultaId) {
        this.currentEditingId = consultaId;
        const modal = document.getElementById('modalEditarConsulta');
        const form = document.getElementById('formEditarConsulta');
        
        if (!modal || !form) return;

        try {
            const patientId = this.getPatientIdFromUrl();
            const consultas = await this.apiClient.getPatientConsultations(patientId);
            const consulta = consultas.find(x => (x.id || x.Id) == consultaId);
            
            if (!consulta) {
                this.uiManager.toast('No se encontró la consulta', 'error');
                return;
            }

            this.fillEditForm(consulta, form);
            this.labFieldsManager.clearHighlightedFields(modal);
            
            const camposRes = consulta.camposResaltados || consulta.CamposResaltados || [];
            if (camposRes.length) {
                this.labFieldsManager.applyHighlightedFields(camposRes, modal);
            }
            
            this.labFieldsManager.setupLabLabelClickHandlers(modal);
            setTimeout(() => this.labFieldsManager.setupLabLabelClickHandlers(modal), 200);

            modal.classList.remove('hidden');
            modal.classList.add('show');
        } catch (error) {
            this.uiManager.toast(`Error al cargar la consulta: ${error.message}`, 'error');
        }
    }

    /**
     * Llena el formulario de edición con los datos de la consulta
     */
    fillEditForm(consulta, form) {
        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value ?? '';
        };

        setValue('fechaEditarConsulta', consulta.fecha || consulta.Fecha || '');
        setValue('fechaLaboratorioEditarConsulta', consulta.fechaLaboratorio || consulta.FechaLaboratorio || '');
        setValue('motivoEditarConsulta', consulta.motivo || consulta.Motivo);
        setValue('recetarEditarConsulta', consulta.recetar || consulta.Recetar);
        setValue('omeEditarConsulta', consulta.ome || consulta.Ome);
        setValue('notasEditarConsulta', consulta.notas || consulta.Notas);

        // Campos de laboratorio
        const labFields = ['gr', 'hto', 'hb', 'gb', 'plaq', 'gluc', 'urea', 'cr', 'vfg', 
                          'got', 'gpt', 'ct', 'tg', 'vitd', 'fal', 'hdl', 'ldl', 'b12', 
                          'tsh', 't4l', 'urico', 'psa', 'hba1c', 'orina', 'valoresNoIncluidos'];
        
        labFields.forEach(field => {
            setValue(`${field}EditarConsulta`, consulta[field] ?? consulta[field?.toUpperCase()]);
        });
    }

    /**
     * Actualiza una consulta
     */
    async updateConsultation(patientId, consultaId, data) {
        try {
            await this.apiClient.updateConsultation(patientId, consultaId, data);
            this.uiManager.toast('Consulta actualizada exitosamente', 'success');
            await this.loadPatientConsultations(patientId);
        } catch (error) {
            this.uiManager.toast(`Error al actualizar consulta: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Elimina una consulta
     */
    async deleteConsultation(consultaId) {
        const patientId = this.getPatientIdFromUrl();
        if (!patientId) return;

        const confirmed = await this.uiManager.confirm('¿Estás seguro de que quieres eliminar esta consulta?');
        if (!confirmed) return;

        try {
            await this.apiClient.deleteConsultation(patientId, consultaId);
            this.uiManager.toast('Consulta eliminada exitosamente', 'success');
            await this.loadPatientConsultations(patientId);
        } catch (error) {
            this.uiManager.toast(`Error al eliminar: ${error.message}`, 'error');
        }
    }

    /**
     * Marca una consulta como revisada
     */
    async markAsReviewed(consultaId, field) {
        const patientId = this.getPatientIdFromUrl();
        if (!patientId) {
            this.uiManager.toast('Error: sin paciente', 'error');
            return;
        }

        try {
            await this.apiClient.markAsReviewed(patientId, consultaId, field);
            this.uiManager.toast('Tarea realizada', 'success');
            
            // Actualizar la UI inmediatamente
            const btn = document.querySelector(`[data-consulta-id="${consultaId}"][data-campo="${field}"]`);
            if (btn) {
                const wrap = btn.closest('.revision-controls-historial');
                if (wrap) {
                    wrap.innerHTML = `
                        <div class="revision-status-historial">
                            <span class="revision-status">
                                <i class="fas fa-check-circle"></i> Revisado
                            </span>
                        </div>`;
                }
            }
        } catch (error) {
            this.uiManager.toast(`Error al marcar como revisado: ${error.message}`, 'error');
        }
    }

    /**
     * Obtiene el ID del paciente desde la URL
     */
    getPatientIdFromUrl() {
        return new URLSearchParams(window.location.search).get('id');
    }

    /**
     * Inicializa los manejadores de eventos para revisiones
     */
    initRevisionShortcuts() {
        // Delegación para botones "Realizado" dentro del historial
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('.marcar-revisado-btn');
            if (!btn) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const id = btn.getAttribute('data-consulta-id');
            const campo = btn.getAttribute('data-campo');
            
            await this.markAsReviewed(id, campo);
        });
    }
}

