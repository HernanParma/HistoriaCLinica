/**
 * Clase para manejar operaciones de pacientes
 */
class PatientManager {
    constructor(apiClient, uiManager) {
        this.apiClient = apiClient;
        this.uiManager = uiManager;
    }

    /**
     * Carga los datos de un paciente
     */
    async loadPatientData(patientId) {
        try {
            const paciente = await this.apiClient.getPatient(patientId);
            this.renderPatientSidebar(paciente);
            document.getElementById('hc-card')?.classList.remove('hidden');
            return paciente;
        } catch (error) {
            console.error('Error loading patient data:', error);
            const sidebarContent = document.getElementById('sidebar-content');
            if (sidebarContent) {
                this.uiManager.showError(sidebarContent, 'Error al cargar datos del paciente', error.message);
            }
            throw error;
        }
    }

    /**
     * Renderiza la barra lateral del paciente
     */
    renderPatientSidebar(patient) {
        const sidebarContent = document.getElementById('sidebar-content');
        if (!sidebarContent) return;

        sidebarContent.innerHTML = `
            <div class="patient-data-container">
                <div class="patient-section" data-section="personal">
                    ${this.renderEditableField('Nombre', 'edit-nombre', patient.nombre || patient.Nombre)}
                    ${this.renderEditableField('Apellido', 'edit-apellido', patient.apellido || patient.Apellido)}
                    ${this.renderEditableField('DNI', 'edit-dni', patient.dni || patient.DNI)}
                    ${this.renderEditableField('N° Afiliado', 'edit-numeroAfiliado', patient.numeroAfiliado || patient.NumeroAfiliado)}
                    ${this.renderEditableField('Obra Social', 'edit-obraSocial', patient.obraSocial || patient.ObraSocial)}
                    ${this.renderEditableField('Teléfono', 'edit-telefono', patient.telefono || patient.Telefono, 'tel')}
                    ${this.renderEditableField('Email', 'edit-email', patient.email || patient.Email, 'email')}
                    ${this.renderDateField('Fecha de Nacimiento', 'edit-fechaNacimiento', patient.fechaNacimiento || patient.FechaNacimiento)}
                    ${this.renderReadOnlyField('Edad', 'edit-edad', patient.edad || patient.Edad || '')}
                    ${this.renderEditableField('Peso (kg)', 'edit-peso', patient.peso || patient.Peso, 'number')}
                    ${this.renderEditableField('Altura (cm)', 'edit-altura', patient.altura || patient.Altura, 'number')}
                    ${this.renderCheckboxField('Particular', 'edit-particular', patient.particular || patient.Particular)}
                    <div class="section-actions hidden">
                        <button class="btn-save-section" onclick="patientManager.saveSection('personal')">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </div>
                <textarea id="edit-medicacion" style="display:none;">${patient.medicacion || patient.Medicacion || ''}</textarea>
                <textarea id="edit-antecedentes" style="display:none;">${patient.antecedentes || patient.Antecedentes || ''}</textarea>
            </div>
        `;

        this.setupAgeCalculation();
    }

    /**
     * Renderiza un campo editable
     */
    renderEditableField(label, id, value = '', type = 'text') {
        return `
            <div class="editable-field">
                <label>${label}:</label>
                <input type="${type}" id="${id}" value="${value || ''}" placeholder="${label}" disabled>
            </div>
        `;
    }

    /**
     * Renderiza un campo de fecha
     */
    renderDateField(label, id, value) {
        return `
            <div class="editable-field">
                <label>${label}:</label>
                <input type="date" id="${id}" value="${this.formatDateForInput(value)}" disabled>
            </div>
        `;
    }

    /**
     * Renderiza un campo de solo lectura
     */
    renderReadOnlyField(label, id, value) {
        return `
            <div class="editable-field">
                <label>${label}:</label>
                <input type="text" id="${id}" value="${value || ''}" readonly style="background:#f3f4f6;color:#6b7280;">
            </div>
        `;
    }

    /**
     * Renderiza un campo de checkbox
     */
    renderCheckboxField(label, id, checked) {
        return `
            <div class="editable-field">
                <label>${label}:</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} disabled style="transform:scale(1.2);">
                    <span style="color:#6b7280;font-size:.9em;">Marcar si es paciente particular</span>
                </div>
            </div>
        `;
    }

    /**
     * Configura el cálculo automático de edad
     */
    setupAgeCalculation() {
        const fechaNacimiento = document.getElementById('edit-fechaNacimiento');
        const edad = document.getElementById('edit-edad');

        if (fechaNacimiento && edad) {
            fechaNacimiento.addEventListener('change', () => {
                if (!fechaNacimiento.value) {
                    edad.value = '';
                    return;
                }

                const birthDate = new Date(fechaNacimiento.value);
                const now = new Date();
                let age = now.getFullYear() - birthDate.getFullYear();
                const monthDiff = now.getMonth() - birthDate.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
                    age--;
                }

                edad.value = age;
            });
        }
    }

    /**
     * Alterna el modo de edición de una sección
     */
    toggleEditMode(section) {
        const sectionElement = document.querySelector(`[data-section="${section}"]`);
        if (!sectionElement) return;

        const fields = this.getSectionFields(section);
        if (!fields.length) return;

        const isEditing = !fields[0].disabled;
        const editBtn = section === 'personal' ? 
            document.querySelector('.btn-edit-sidebar') : 
            document.querySelector('.btn-edit-section', sectionElement);
        const saveWrap = sectionElement.querySelector('.section-actions');

        fields.forEach(field => field.disabled = isEditing);

        if (editBtn) {
            editBtn.innerHTML = isEditing ? 
                '<i class="fas fa-edit"></i> Editar' : 
                '<i class="fas fa-times"></i> Cancelar';
            editBtn.classList.toggle('editing', !isEditing);
        }

        if (saveWrap) {
            saveWrap.classList.toggle('hidden', isEditing);
        }
    }

    /**
     * Obtiene los campos de una sección
     */
    getSectionFields(section) {
        const fieldIds = {
            personal: [
                'edit-nombre', 'edit-apellido', 'edit-dni', 'edit-numeroAfiliado', 
                'edit-obraSocial', 'edit-telefono', 'edit-email', 'edit-fechaNacimiento', 
                'edit-peso', 'edit-altura', 'edit-particular'
            ],
            medicacion: ['edit-medicacion'],
            antecedentes: ['edit-antecedentes']
        };

        const ids = fieldIds[section] || [];
        return ids.map(id => document.getElementById(id)).filter(Boolean);
    }

    /**
     * Guarda una sección del paciente
     */
    async saveSection(section) {
        const patientId = this.getPatientIdFromUrl();
        if (!patientId) {
            this.uiManager.toast('Error: No se encontró ID del paciente', 'error');
            return;
        }

        const data = this.buildSectionData(section);
        if (!data) {
            this.uiManager.toast('Sección no reconocida', 'error');
            return;
        }

        try {
            await this.apiClient.updatePatient(patientId, data);
            this.uiManager.toast('Guardado con éxito', 'success');
            this.toggleEditMode(section);
        } catch (error) {
            this.uiManager.toast(error.message || 'Error al guardar', 'error');
        }
    }

    /**
     * Construye los datos de una sección
     */
    buildSectionData(section) {
        const getValue = (id) => document.getElementById(id)?.value?.trim() || '';
        const getFloatValue = (id) => {
            const value = document.getElementById(id)?.value;
            return value ? parseFloat(value) : null;
        };
        const getIntValue = (id) => {
            const value = document.getElementById(id)?.value;
            return value ? parseInt(value, 10) : null;
        };
        const getCheckboxValue = (id) => !!document.getElementById(id)?.checked;

        switch (section) {
            case 'personal':
                return {
                    nombre: getValue('edit-nombre'),
                    apellido: getValue('edit-apellido'),
                    dni: getValue('edit-dni'),
                    numeroAfiliado: getValue('edit-numeroAfiliado') || null,
                    obraSocial: getValue('edit-obraSocial') || null,
                    telefono: getValue('edit-telefono') || null,
                    email: getValue('edit-email') || null,
                    fechaNacimiento: getValue('edit-fechaNacimiento') || null,
                    peso: getFloatValue('edit-peso'),
                    altura: getIntValue('edit-altura'),
                    particular: getCheckboxValue('edit-particular')
                };
            case 'medicacion':
                return {
                    medicacion: getValue('edit-medicacion')
                };
            case 'antecedentes':
                return {
                    antecedentes: getValue('edit-antecedentes')
                };
            default:
                return null;
        }
    }

    /**
     * Formatea una fecha para input de tipo date
     */
    formatDateForInput(value) {
        if (!value) return '';
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        if (typeof value === 'string' && value.includes('T')) return value.split('T')[0];
        const date = new Date(value);
        return isNaN(date) ? '' : date.toISOString().split('T')[0];
    }

    /**
     * Obtiene el ID del paciente desde la URL
     */
    getPatientIdFromUrl() {
        return new URLSearchParams(window.location.search).get('id');
    }

    /**
     * Abre el modal de medicación
     */
    openMedicationModal() {
        const modal = document.getElementById('modalMedicacion');
        const text = document.getElementById('medicacionTexto');
        const source = document.getElementById('edit-medicacion');
        
        if (!modal || !text || !source) return;

        const value = (source.value || '').trim();
        text.textContent = value || 'No hay información de medicación registrada.';
        text.style.color = value ? '#374151' : '#9ca3af';
        text.style.fontStyle = value ? 'normal' : 'italic';
        
        modal.classList.remove('hidden');
        modal.classList.add('show');
    }

    /**
     * Abre el modal de antecedentes
     */
    openAntecedentsModal() {
        const modal = document.getElementById('modalAntecedentes');
        const text = document.getElementById('antecedentesTexto');
        const source = document.getElementById('edit-antecedentes');
        
        if (!modal || !text || !source) return;

        const value = (source.value || '').trim();
        text.textContent = value || 'No hay antecedentes médicos registrados.';
        text.style.color = value ? '#374151' : '#9ca3af';
        text.style.fontStyle = value ? 'normal' : 'italic';
        
        modal.classList.remove('hidden');
        modal.classList.add('show');
    }

    /**
     * Guarda la medicación
     */
    async saveMedication() {
        const textarea = document.querySelector('#modalMedicacion textarea');
        const button = document.getElementById('editarModalMedicacion');
        const field = document.getElementById('edit-medicacion');
        
        if (!textarea || !button || !field) return;

        try {
            this.uiManager.setButtonLoading(button, true, 'Guardando...');
            field.value = textarea.value.trim();
            
            const patientId = this.getPatientIdFromUrl();
            await this.apiClient.updatePatient(patientId, { medicacion: field.value });
            
            // Restaurar el párrafo
            const p = document.createElement('p');
            p.id = 'medicacionTexto';
            if (field.value) {
                p.textContent = field.value;
                p.style.color = '#374151';
            } else {
                p.textContent = 'No hay información de medicación registrada.';
                p.style.color = '#9ca3af';
                p.style.fontStyle = 'italic';
            }
            textarea.parentNode.replaceChild(p, textarea);
            
            button.innerHTML = '<i class="fas fa-edit"></i> Editar';
            button.onclick = this.editMedication.bind(this);
            this.uiManager.setButtonLoading(button, false);
            
            this.uiManager.toast('Medicación guardada', 'success');
        } catch (error) {
            button.innerHTML = '<i class="fas fa-edit"></i> Editar';
            button.onclick = this.editMedication.bind(this);
            this.uiManager.setButtonLoading(button, false);
            this.uiManager.toast('Error al guardar la medicación', 'error');
        }
    }

    /**
     * Guarda los antecedentes
     */
    async saveAntecedents() {
        const textarea = document.querySelector('#modalAntecedentes textarea');
        const button = document.getElementById('editarModalAntecedentes');
        const field = document.getElementById('edit-antecedentes');
        
        if (!textarea || !button || !field) return;

        try {
            this.uiManager.setButtonLoading(button, true, 'Guardando...');
            field.value = textarea.value.trim();
            
            const patientId = this.getPatientIdFromUrl();
            await this.apiClient.updatePatient(patientId, { antecedentes: field.value });
            
            // Restaurar el párrafo
            const p = document.createElement('p');
            p.id = 'antecedentesTexto';
            if (field.value) {
                p.textContent = field.value;
                p.style.color = '#374151';
            } else {
                p.textContent = 'No hay antecedentes médicos registrados.';
                p.style.color = '#9ca3af';
                p.style.fontStyle = 'italic';
            }
            textarea.parentNode.replaceChild(p, textarea);
            
            button.innerHTML = '<i class="fas fa-edit"></i> Editar';
            button.onclick = this.editAntecedents.bind(this);
            this.uiManager.setButtonLoading(button, false);
            
            this.uiManager.toast('Antecedentes guardados', 'success');
        } catch (error) {
            button.innerHTML = '<i class="fas fa-edit"></i> Editar';
            button.onclick = this.editAntecedents.bind(this);
            this.uiManager.setButtonLoading(button, false);
            this.uiManager.toast('Error al guardar los antecedentes', 'error');
        }
    }

    /**
     * Edita la medicación
     */
    editMedication() {
        const textId = 'medicacionTexto';
        const button = document.getElementById('editarModalMedicacion');
        const textarea = this.convertToTextarea(textId, 'No hay información de medicación registrada.');
        
        button.innerHTML = '<i class="fas fa-save"></i> Guardar';
        button.onclick = this.saveMedication.bind(this);
        textarea.focus();
    }

    /**
     * Edita los antecedentes
     */
    editAntecedents() {
        const textId = 'antecedentesTexto';
        const button = document.getElementById('editarModalAntecedentes');
        const textarea = this.convertToTextarea(textId, 'No hay antecedentes médicos registrados.');
        
        button.innerHTML = '<i class="fas fa-save"></i> Guardar';
        button.onclick = this.saveAntecedents.bind(this);
        textarea.focus();
    }

    /**
     * Convierte un párrafo a textarea
     */
    convertToTextarea(elementId, emptyMessage) {
        const element = document.getElementById(elementId);
        const textarea = document.createElement('textarea');
        textarea.value = (element.textContent === emptyMessage) ? '' : element.textContent;
        textarea.style.cssText = 'width:100%;min-height:150px;padding:15px;border:2px solid #667eea;border-radius:8px;font:inherit;resize:vertical;';
        element.parentNode.replaceChild(textarea, element);
        return textarea;
    }
}
