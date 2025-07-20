// Configuración de la API (usa el mismo config.js)

document.addEventListener('DOMContentLoaded', () => {
    const hcCard = document.getElementById('hc-card');
    const patientNameTitle = document.getElementById('hc-patient-name');
    const hcBody = document.getElementById('hc-body');
    const loadingHC = document.getElementById('loading-hc');

    // Obtener el ID del paciente de la URL
    const params = new URLSearchParams(window.location.search);
    const patientId = params.get('id');

    if (!patientId) {
        showError('No se ha especificado un paciente.');
        return;
    }

    // Cargar los datos del paciente
    loadPatientHistory(patientId);

    async function loadPatientHistory(id) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/pacientes/${id}`);
            
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const patient = await response.json();
            displayHistory(patient);

        } catch (error) {
            console.error('Error al cargar la historia clínica:', error);
            showError('No se pudo cargar la historia clínica. Intente de nuevo.');
        }
    }

    function displayHistory(patient) {
        if (!patient) {
            showError('Paciente no encontrado.');
            return;
        }

        // Actualizar el título con el nombre del paciente
        patientNameTitle.innerHTML = `<i class="fas fa-user-injured"></i> ${patient.nombre} ${patient.apellido}`;

        // Renderizar historial de consultas
        let consultasHtml = '';
        if (patient.consultas && patient.consultas.length > 0) {
            consultasHtml = `<ul class="consulta-lista" id="historialConsultas" style="display:none;">` +
                patient.consultas.map(c => `
                    <li>
                        <strong>${new Date(c.fecha).toLocaleDateString('es-ES')}</strong>: ${c.motivo}
                    </li>
                `).join('') +
                `</ul>`;
        } else {
            consultasHtml = '<p id="historialConsultas" style="display:none;">No hay consultas registradas.</p>';
        }

        // Botón para mostrar/ocultar historial
        const btnHistorial = `<button id="btnMostrarHistorial" class="btn btn-warning" style="margin-bottom:10px;"><i class="fas fa-history"></i> CONSULTAS ANTERIORES</button>`;

        // Formulario para nueva consulta
        const consultaFormHtml = `
            <form id="nuevaConsultaForm" class="consulta-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="fechaConsulta">Fecha:</label>
                        <input type="date" id="fechaConsulta" name="fecha" required>
                    </div>
                    <div class="form-group">
                        <label for="motivoConsulta">Motivo:</label>
                        <input type="text" id="motivoConsulta" name="motivo" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="recetarConsulta">Recetar:</label>
                        <input type="text" id="recetarConsulta" name="recetar" maxlength="255">
                    </div>
                    <div class="form-group">
                        <label for="omeConsulta">OME:</label>
                        <input type="text" id="omeConsulta" name="ome" maxlength="255">
                    </div>
                </div>
                
                <h4><i class="fas fa-vials"></i> Laboratorio</h4>
                <div class="lab-grid">
                    <div class="form-group"><label>GR</label><input type="number" step="any" name="gr"></div>
                    <div class="form-group"><label>HTO</label><input type="number" step="any" name="hto"></div>
                    <div class="form-group"><label>HB</label><input type="number" step="any" name="hb"></div>
                    <div class="form-group"><label>GB</label><input type="number" step="any" name="gb"></div>
                    <div class="form-group"><label>PLAQ</label><input type="number" step="any" name="plaq"></div>
                    <div class="form-group"><label>GLUC</label><input type="number" step="any" name="gluc"></div>
                    <div class="form-group"><label>UREA</label><input type="number" step="any" name="urea"></div>
                    <div class="form-group"><label>CR</label><input type="number" step="any" name="cr"></div>
                    <div class="form-group"><label>GOT</label><input type="number" step="any" name="got"></div>
                    <div class="form-group"><label>GPT</label><input type="number" step="any" name="gpt"></div>
                    <div class="form-group"><label>CT</label><input type="number" step="any" name="ct"></div>
                    <div class="form-group"><label>TG</label><input type="number" step="any" name="tg"></div>
                    <div class="form-group"><label>VIT D</label><input type="number" step="any" name="vitd"></div>
                    <div class="form-group"><label>FAL</label><input type="number" step="any" name="fal"></div>
                    <div class="form-group"><label>COL</label><input type="number" step="any" name="col"></div>
                    <div class="form-group"><label>B12</label><input type="number" step="any" name="b12"></div>
                    <div class="form-group"><label>TSH</label><input type="number" step="any" name="tsh"></div>
                    <div class="form-group"><label>URICO</label><input type="number" step="any" name="urico"></div>
                    <div class="form-group full-width"><label>ORINA</label><input type="text" name="orina"></div>
                </div>

                <button type="submit" class="btn btn-success"><i class="fas fa-plus"></i> Agregar Consulta</button>
                <div id="consultaMessage" class="message"></div>
            </form>
        `;

        hcBody.innerHTML = `
            <div class="hc-section">
                <h3><i class="fas fa-stethoscope"></i> Consultas</h3>
                ${btnHistorial}
                ${consultasHtml}
                <hr>
                <h4>Agregar nueva consulta</h4>
                ${consultaFormHtml}
            </div>
        `;

        // Mostrar la tarjeta
        if (loadingHC) loadingHC.classList.add('hidden');
        if (hcCard) hcCard.classList.remove('hidden');

        // Lógica para mostrar/ocultar historial con fetch
        const btnMostrarHistorial = document.getElementById('btnMostrarHistorial');
        const historialConsultas = document.getElementById('historialConsultas');
        let historialVisible = false;

        function generateLabResultsHtml(consulta) {
            const labFields = ['gr', 'hto', 'hb', 'gb', 'plaq', 'gluc', 'urea', 'cr', 'got', 'gpt', 'ct', 'tg', 'vitd', 'fal', 'col', 'b12', 'tsh', 'urico', 'orina'];
            let hasLabData = false;
            let labHtml = '<div class="lab-results-grid">';

            labFields.forEach(field => {
                if (consulta[field] !== null && consulta[field] !== undefined && consulta[field] !== '') {
                    hasLabData = true;
                    labHtml += `
                        <div class="lab-item">
                            <strong>${field.toUpperCase()}:</strong>
                            <span>${consulta[field]}</span>
                        </div>
                    `;
                }
            });
            labHtml += '</div>';
            // Agregar Recetar y OME si existen
            let extraHtml = '';
            if (consulta.recetar && consulta.recetar.trim() !== '') {
                extraHtml += `<div class="lab-item full-width"><strong>Recetar:</strong> <span>${consulta.recetar}</span></div>`;
            }
            if (consulta.ome && consulta.ome.trim() !== '') {
                extraHtml += `<div class="lab-item full-width"><strong>OME:</strong> <span>${consulta.ome}</span></div>`;
            }
            return (hasLabData ? labHtml : '<p>No hay datos de laboratorio para esta consulta.</p>') + extraHtml;
        }

        if (btnMostrarHistorial && historialConsultas) {
            btnMostrarHistorial.addEventListener('click', async () => {
                if (!historialVisible) {
                    historialConsultas.innerHTML = '<li>Cargando...</li>';
                    historialConsultas.style.display = 'block';
                    btnMostrarHistorial.innerHTML = '<i class="fas fa-spinner fa-spin"></i> OCULTAR CONSULTAS';
                    try {
                        const url = `${CONFIG.API_BASE_URL}/api/pacientes/${patientId}/consultas`;
                        const resp = await fetch(url);
                        
                        if (resp.ok) {
                            const consultas = await resp.json();
                            if (consultas.length > 0) {
                                historialConsultas.innerHTML = consultas.map(c => `
                                    <li class="consulta-card">
                                        <div class="consulta-header">
                                            <span class="consulta-date"><i class="fas fa-calendar-alt"></i> ${new Date(c.fecha).toLocaleDateString('es-ES')}</span>
                                            <span class="consulta-motivo">${c.motivo}</span>
                                            <button class="btn btn-sm btn-toggle-lab" data-target="lab-results-${c.id}">
                                                <i class="fas fa-vials"></i> Lab
                                            </button>
                                        </div>
                                        <div id="lab-results-${c.id}" class="lab-results hidden">
                                            ${generateLabResultsHtml(c)}
                                        </div>
                                    </li>
                                `).join('');

                                // Add event listeners for the new toggle buttons
                                historialConsultas.querySelectorAll('.btn-toggle-lab').forEach(btn => {
                                    btn.addEventListener('click', () => {
                                        const targetId = btn.dataset.target;
                                        const labResults = document.getElementById(targetId);
                                        labResults.classList.toggle('hidden');
                                        if (labResults.classList.contains('hidden')) {
                                            btn.innerHTML = '<i class="fas fa-vials"></i> Lab';
                                        } else {
                                            btn.innerHTML = '<i class="fas fa-times"></i> Cerrar';
                                        }
                                    });
                                });
                            } else {
                                historialConsultas.innerHTML = '<li>No hay consultas registradas.</li>';
                            }
                            btnMostrarHistorial.innerHTML = '<i class="fas fa-eye-slash"></i> OCULTAR CONSULTAS';
                        } else {
                            historialConsultas.innerHTML = '<li>Error al cargar el historial.</li>';
                            btnMostrarHistorial.innerHTML = '<i class="fas fa-history"></i> CONSULTAS ANTERIORES';
                        }
                    } catch (err) {
                        historialConsultas.innerHTML = '<li>Error de conexión.</li>';
                        btnMostrarHistorial.innerHTML = '<i class="fas fa-history"></i> CONSULTAS ANTERIORES';
                    }
                    historialVisible = true;
                } else {
                    historialConsultas.style.display = 'none';
                    btnMostrarHistorial.innerHTML = '<i class="fas fa-history"></i> CONSULTAS ANTERIORES';
                    historialVisible = false;
                }
            });
        }

        // Lógica para agregar nueva consulta
        const nuevaConsultaForm = document.getElementById('nuevaConsultaForm');
        if (nuevaConsultaForm) {
            nuevaConsultaForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(nuevaConsultaForm);
                const consultaData = {};
                formData.forEach((value, key) => {
                    if (value) { // Solo incluir campos con valor
                        consultaData[key] = value;
                    }
                });

                const consultaMessage = document.getElementById('consultaMessage');
                consultaMessage.textContent = '';
                try {
                    const response = await fetch(`${CONFIG.API_BASE_URL}/api/Pacientes/${patient.id}/consultas`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(consultaData)
                    });
                    if (response.ok) {
                        consultaMessage.textContent = 'Consulta agregada correctamente.';
                        consultaMessage.className = 'message success';
                        // Recargar historia clínica para ver la nueva consulta en la lista
                        setTimeout(() => loadPatientHistory(patient.id), 1000);
                    } else {
                        const errorText = await response.text();
                        consultaMessage.textContent = `No se pudo agregar la consulta. ${errorText}`;
                        consultaMessage.className = 'message error';
                    }
                } catch (err) {
                    consultaMessage.textContent = 'Error de conexión.';
                    consultaMessage.className = 'message error';
                }
            });
        }
    }

    function showError(message) {
        if (hcBody) hcBody.innerHTML = `<div class="message error">${message}</div>`;
        if (loadingHC) loadingHC.classList.add('hidden');
        if (hcCard) hcCard.classList.remove('hidden');
    }

    // Mostrar nombre de usuario logueado en el header
    const userName = localStorage.getItem('username');
    const userNameSpan = document.getElementById('userName');
    if (userName && userNameSpan) {
        userNameSpan.textContent = userName;
    }
    // Menú desplegable usuario (igual que en index.html)
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.classList.toggle('hidden');
        });
        // Cerrar el menú si se hace clic fuera
        document.addEventListener('click', function(e) {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
}); 