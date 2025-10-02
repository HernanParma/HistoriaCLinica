/**
 * Clase para manejar campos de laboratorio y sus operaciones
 */
class LabFieldsManager {
    constructor() {
        this.labKeys = [
            'gr', 'hto', 'hb', 'gb', 'plaq', 'gluc', 'urea', 'cr', 'vfg', 
            'got', 'gpt', 'ct', 'tg', 'vitd', 'fal', 'hdl', 'ldl', 'b12', 
            'tsh', 't4l', 'orina', 'urico', 'psa', 'hba1c', 'valoresNoIncluidos'
        ];

        this.labFieldMappings = [
            ['gr', 'GR', 'GR (Glóbulos Rojos)'],
            ['hto', 'HTO', 'HTO (Hematocrito)'],
            ['hb', 'HB', 'HB (Hemoglobina)'],
            ['gb', 'GB', 'GB (Glóbulos Blancos)'],
            ['plaq', 'PLAQ', 'PLAQ (Plaquetas)'],
            ['gluc', 'GLUC', 'GLUC (Glucosa)'],
            ['urea', 'UREA', 'UREA/UREMIA'],
            ['cr', 'CR', 'CR (Creatinina)'],
            ['vfg', 'VFG', 'VFG (Velocidad de Filtración Glomerular)'],
            ['got', 'GOT', 'GOT'],
            ['gpt', 'GPT', 'GPT'],
            ['ct', 'CT', 'CT (Colesterol Total)'],
            ['tg', 'TG', 'TG (Triglicéridos)'],
            ['vitd', 'VITD', 'VITD (Vitamina D)'],
            ['fal', 'FAL', 'FAL (Fosfatasa Alcalina)'],
            ['hdl', 'HDL', 'HDL (Colesterol HDL)'],
            ['ldl', 'LDL', 'LDL (Colesterol LDL)'],
            ['b12', 'B12', 'B12 (Vitamina B12)'],
            ['tsh', 'TSH', 'TSH'],
            ['t4l', 'T4L', 'T4L'],
            ['orina', 'ORINA', 'ORINA'],
            ['urico', 'URICO', 'URICO/URICEMIA'],
            ['psa', 'PSA', 'PSA (Antígeno Prostático Específico)'],
            ['hba1c', 'HBA1C', 'HBA1C (Hemoglobina Glicosilada)'],
            ['valoresNoIncluidos', 'ValoresNoIncluidos', 'Valores no incluidos']
        ];
    }

    /**
     * Normaliza una clave de campo de laboratorio
     */
    normalizeKey(raw) {
        if (!raw) return '';
        const key = String(raw).toLowerCase().replace(':', '').trim();
        const base = key.replace(/editarconsulta$/i, '').replace(/consulta$/i, '');
        return this.labKeys.find(k => base.startsWith(k)) || base;
    }

    /**
     * Normaliza campos resaltados
     */
    normalizeHighlighted(input) {
        if (Array.isArray(input)) {
            return [...new Set(input.map(this.normalizeKey.bind(this)).filter(Boolean))];
        }
        
        if (typeof input === 'string') {
            const s = input.trim();
            if (!s) return [];
            
            try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) {
                    return [...new Set(parsed.map(this.normalizeKey.bind(this)).filter(Boolean))];
                }
            } catch (e) {
                // Si no es JSON válido, tratar como string separado por comas
            }
            
            return [...new Set(s.split(/[,\s]+/).filter(Boolean).map(this.normalizeKey.bind(this)))];
        }
        
        return [];
    }

    /**
     * Obtiene campos resaltados del DOM
     */
    getHighlightedFields(root = document) {
        const labels = Array.from(root.querySelectorAll('[data-lab-scope] label.highlighted, .lab-grid .form-group label.highlighted'));
        return [...new Set(labels.map(l => this.normalizeKey(l.dataset?.key || l.getAttribute('for') || l.textContent)))];
    }

    /**
     * Aplica campos resaltados al DOM
     */
    applyHighlightedFields(fields, root = document) {
        const set = new Set(this.normalizeHighlighted(fields));
        if (!set.size) return;

        const labels = Array.from(root.querySelectorAll('[data-lab-scope] label, .lab-grid .form-group label'));
        labels.forEach(label => {
            const key = this.normalizeKey(label.dataset?.key || label.getAttribute('for') || label.textContent);
            if (set.has(key)) {
                label.classList.add('highlighted');
            }
        });
    }

    /**
     * Limpia campos resaltados del DOM
     */
    clearHighlightedFields(root = document) {
        const labels = Array.from(root.querySelectorAll('[data-lab-scope] label.highlighted, .lab-grid .form-group label.highlighted'));
        labels.forEach(label => label.classList.remove('highlighted'));
    }

    /**
     * Configura manejadores de clic para etiquetas de laboratorio
     */
    setupLabLabelClickHandlers(root = document) {
        const scope = root.querySelector('[data-lab-scope]') || root;
        
        // Remover manejador existente si existe
        if (scope.__labClickHandler) {
            scope.removeEventListener('click', scope.__labClickHandler);
        }

        // Crear nuevo manejador
        scope.__labClickHandler = (e) => {
            const label = e.target.closest('label');
            if (!label || !scope.contains(label)) return;
            label.classList.toggle('highlighted');
        };

        scope.addEventListener('click', scope.__labClickHandler, { passive: true });
    }

    /**
     * Renderiza valores de laboratorio
     */
    renderLaboratorioValues(consulta) {
        console.log('🔍 Datos de consulta recibidos:', consulta);
        console.log('🔍 T4L en consulta:', consulta.t4l, consulta.T4L);
        
        const pick = (...keys) => {
            const foundKey = keys.find(k => consulta[k] !== null && consulta[k] !== undefined && consulta[k] !== '');
            return foundKey ? consulta[foundKey] : null;
        };

        const items = this.labFieldMappings.map(([lower, upper, label]) => {
            const value = pick(lower, upper);
            return value != null && value !== '' ? { key: lower, label, value } : null;
        }).filter(Boolean);

        if (!items.length) {
            return '<div class="no-lab-values">No hay valores de laboratorio registrados para esta consulta.</div>';
        }

        const camposRes = this.normalizeHighlighted(consulta.camposResaltados || consulta.CamposResaltados || []);
        const fechaLab = consulta.fechaLaboratorio || consulta.FechaLaboratorio;
        const fechaHtml = fechaLab ? 
            `<div class="lab-date-info"><strong>Fecha del Laboratorio:</strong> ${new Date(fechaLab).toLocaleDateString()}</div>` : '';

        return fechaHtml + items.map(item => `
            <div class="lab-value-item">
                <span class="lab-label ${camposRes.includes(item.key) ? 'highlighted' : ''}">${item.label}:</span>
                <span class="lab-value">${item.value}</span>
            </div>
        `).join('');
    }

    /**
     * Construye el payload de datos de laboratorio desde un formulario
     */
    buildLabPayload(form, highlightedFromRoot) {
        const formData = new FormData(form);
        
        // Debug: Log all form data
        console.log('🔍 FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        const fechaValue = formData.get('fecha');
        console.log('🔍 Fecha value from form:', fechaValue);
        console.log('🔍 Form element:', form);
        console.log('🔍 Fecha input element:', form.querySelector('input[name="fecha"]'));
        console.log('🔍 Fecha input value:', form.querySelector('input[name="fecha"]')?.value);
        
        // Convertir fecha a formato ISO si existe, o usar el valor directo si es una fecha válida
        let fechaISO = null;
        if (fechaValue) {
            // Si ya es una fecha en formato ISO, usarla directamente
            if (fechaValue.includes('T') || fechaValue.includes('Z')) {
                fechaISO = fechaValue;
            } else {
                // Si es una fecha en formato YYYY-MM-DD, convertirla a ISO
                fechaISO = new Date(fechaValue + 'T00:00:00.000Z').toISOString();
            }
        }
        console.log('🔍 Fecha ISO:', fechaISO);
        
        const data = {
            fecha: fechaISO,
            fechaLaboratorio: this.tryISODate(formData.get('fechaLaboratorio')),
            motivo: formData.get('motivo'),
            recetar: formData.get('recetar') || null,
            ome: formData.get('ome') || null,
            notas: formData.get('notas') || null,
            orina: formData.get('orina') || null,
            valoresNoIncluidos: formData.get('valoresNoIncluidos') || null,
            camposResaltados: this.getHighlightedFields(highlightedFromRoot)
        };
        
        console.log('🔍 Final payload data:', data);
        console.log('🔍 Fecha en payload:', data.fecha);
        console.log('🔍 T4L en payload:', data.t4l);

        // Agregar campos numéricos
        const numericKeys = ['gr', 'hto', 'hb', 'gb', 'plaq', 'gluc', 'urea', 'cr', 'vfg', 
                           'got', 'gpt', 'ct', 'tg', 'vitd', 'fal', 'hdl', 'b12', 'tsh', 't4l', 
                           'urico', 'ldl', 'psa', 'hba1c'];
        
        numericKeys.forEach(key => {
            const value = this.toFloatOrNull(formData.get(key));
            data[key] = value;
            if (key === 't4l') {
                console.log('🔍 T4L value from form:', formData.get(key));
                console.log('🔍 T4L converted value:', value);
            }
        });

        return data;
    }

    /**
     * Aplica máscara decimal a campos de entrada
     */
    attachDecimalMask(ids) {
        const format = (input) => {
            const raw = input.value ?? '';
            if (!raw) return;
            
            let val = raw.replace('.', ',').replace(/[^0-9,]/g, '');
            const parts = val.split(',');
            
            if (parts.length > 2) {
                val = parts[0] + ',' + parts.slice(1).join('');
            }
            
            if (parts.length === 2 && parts[1].length > 2) {
                val = parts[0] + ',' + parts[1].slice(0, 2);
            }
            
            input.value = val;
        };

        ids.forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;

            element.addEventListener('input', () => format(element));
            element.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    format(element);
                    element.blur();
                }
            });
            element.addEventListener('blur', () => format(element));
        });
    }

    /**
     * Convierte un valor a float o null
     */
    toFloatOrNull(value) {
        if (value == null || String(value).trim() === '') return null;
        const v = parseFloat(String(value).replace(',', '.'));
        return Number.isFinite(v) ? v : null;
    }

    /**
     * Intenta convertir un valor a fecha ISO
     */
    tryISODate(value) {
        if (!value) return null;
        const d = new Date(value);
        return isNaN(d) ? null : d.toISOString();
    }

    /**
     * Obtiene todas las claves de laboratorio
     */
    getLabKeys() {
        return [...this.labKeys];
    }

    /**
     * Obtiene los mapeos de campos de laboratorio
     */
    getLabFieldMappings() {
        return [...this.labFieldMappings];
    }
}
