// Modo Demo - Datos de ejemplo para la aplicación
console.log('🎭 Cargando modo demo...');

// Datos de pacientes de ejemplo
const DEMO_PATIENTS = [
    {
        id: 1001,
        nombre: "María",
        apellido: "González",
        dni: "12345678",
        numeroAfiliado: "AF001",
        fechaNacimiento: "1985-03-15",
        telefono: "11-1234-5678",
        obraSocial: "OSDE",
        particular: false,
        peso: 65.5,
        altura: 165,
        email: "maria.gonzalez@email.com",
        antecedentes: "Hipertensión arterial, diabetes tipo 2",
        medicacion: "Metformina 850mg, Losartán 50mg"
    },
    {
        id: 1002,
        nombre: "Carlos",
        apellido: "Rodríguez",
        dni: "23456789",
        numeroAfiliado: "AF002",
        fechaNacimiento: "1978-07-22",
        telefono: "11-2345-6789",
        obraSocial: "Swiss Medical",
        particular: false,
        peso: 78.2,
        altura: 175,
        email: "carlos.rodriguez@email.com",
        antecedentes: "Asma bronquial",
        medicacion: "Salbutamol inhalador"
    },
    {
        id: 1003,
        nombre: "Ana",
        apellido: "Martínez",
        dni: "34567890",
        numeroAfiliado: "AF003",
        fechaNacimiento: "1992-11-08",
        telefono: "11-3456-7890",
        obraSocial: "Galeno",
        particular: false,
        peso: 58.3,
        altura: 160,
        email: "ana.martinez@email.com",
        antecedentes: "Ninguno",
        medicacion: "Ninguna"
    },
    {
        id: 1004,
        nombre: "Luis",
        apellido: "Fernández",
        dni: "45678901",
        numeroAfiliado: "AF004",
        fechaNacimiento: "1965-05-12",
        telefono: "11-4567-8901",
        obraSocial: "IOMA",
        particular: false,
        peso: 82.1,
        altura: 180,
        email: "luis.fernandez@email.com",
        antecedentes: "Hipercolesterolemia, artrosis",
        medicacion: "Atorvastatina 20mg, Ibuprofeno 400mg"
    },
    {
        id: 1005,
        nombre: "Laura",
        apellido: "López",
        dni: "56789012",
        numeroAfiliado: "AF005",
        fechaNacimiento: "1988-09-30",
        telefono: "11-5678-9012",
        obraSocial: "Particular",
        particular: true,
        peso: 62.7,
        altura: 168,
        email: "laura.lopez@email.com",
        antecedentes: "Migrañas",
        medicacion: "Sumatriptán 50mg"
    },
    {
        id: 1006,
        nombre: "Roberto",
        apellido: "García",
        dni: "67890123",
        numeroAfiliado: "AF006",
        fechaNacimiento: "1973-12-18",
        telefono: "11-6789-0123",
        obraSocial: "OSDE",
        particular: false,
        peso: 75.8,
        altura: 172,
        email: "roberto.garcia@email.com",
        antecedentes: "Gastritis crónica",
        medicacion: "Omeprazol 20mg"
    },
    {
        id: 1007,
        nombre: "Carmen",
        apellido: "Hernández",
        dni: "78901234",
        numeroAfiliado: "AF007",
        fechaNacimiento: "1995-04-25",
        telefono: "11-7890-1234",
        obraSocial: "Swiss Medical",
        particular: false,
        peso: 55.2,
        altura: 158,
        email: "carmen.hernandez@email.com",
        antecedentes: "Alergia estacional",
        medicacion: "Loratadina 10mg"
    },
    {
        id: 1008,
        nombre: "Diego",
        apellido: "Morales",
        dni: "89012345",
        numeroAfiliado: "AF008",
        fechaNacimiento: "1980-08-14",
        telefono: "11-8901-2345",
        obraSocial: "Galeno",
        particular: false,
        peso: 70.4,
        altura: 170,
        email: "diego.morales@email.com",
        antecedentes: "Depresión leve",
        medicacion: "Sertralina 50mg"
    },
    {
        id: 1009,
        nombre: "Isabel",
        apellido: "Jiménez",
        dni: "90123456",
        numeroAfiliado: "AF009",
        fechaNacimiento: "1968-01-07",
        telefono: "11-9012-3456",
        obraSocial: "IOMA",
        particular: false,
        peso: 68.9,
        altura: 162,
        email: "isabel.jimenez@email.com",
        antecedentes: "Osteoporosis, hipotiroidismo",
        medicacion: "Alendronato 70mg, Levotiroxina 75mcg"
    },
    {
        id: 1010,
        nombre: "Pablo",
        apellido: "Ruiz",
        dni: "01234567",
        numeroAfiliado: "AF010",
        fechaNacimiento: "1990-06-03",
        telefono: "11-0123-4567",
        obraSocial: "Particular",
        particular: true,
        peso: 73.6,
        altura: 178,
        email: "pablo.ruiz@email.com",
        antecedentes: "Ninguno",
        medicacion: "Ninguna"
    },
    {
        id: 1011,
        nombre: "Sofía",
        apellido: "Díaz",
        dni: "11223344",
        numeroAfiliado: "AF011",
        fechaNacimiento: "1987-10-19",
        telefono: "11-1122-3344",
        obraSocial: "OSDE",
        particular: false,
        peso: 61.3,
        altura: 166,
        email: "sofia.diaz@email.com",
        antecedentes: "Anemia ferropénica",
        medicacion: "Sulfato ferroso 200mg"
    },
    {
        id: 1012,
        nombre: "Miguel",
        apellido: "Torres",
        dni: "22334455",
        numeroAfiliado: "AF012",
        fechaNacimiento: "1975-02-28",
        telefono: "11-2233-4455",
        obraSocial: "Swiss Medical",
        particular: false,
        peso: 79.5,
        altura: 176,
        email: "miguel.torres@email.com",
        antecedentes: "Hipertensión arterial",
        medicacion: "Enalapril 10mg"
    },
    {
        id: 1013,
        nombre: "Valentina",
        apellido: "Vargas",
        dni: "33445566",
        numeroAfiliado: "AF013",
        fechaNacimiento: "1993-12-11",
        telefono: "11-3344-5566",
        obraSocial: "Galeno",
        particular: false,
        peso: 57.8,
        altura: 163,
        email: "valentina.vargas@email.com",
        antecedentes: "Síndrome de ovario poliquístico",
        medicacion: "Metformina 500mg"
    },
    {
        id: 1014,
        nombre: "Andrés",
        apellido: "Castro",
        dni: "44556677",
        numeroAfiliado: "AF014",
        fechaNacimiento: "1982-05-16",
        telefono: "11-4455-6677",
        obraSocial: "IOMA",
        particular: false,
        peso: 76.2,
        altura: 174,
        email: "andres.castro@email.com",
        antecedentes: "Reflujo gastroesofágico",
        medicacion: "Pantoprazol 40mg"
    },
    {
        id: 1015,
        nombre: "Camila",
        apellido: "Ortega",
        dni: "55667788",
        numeroAfiliado: "AF015",
        fechaNacimiento: "1996-08-24",
        telefono: "11-5566-7788",
        obraSocial: "Particular",
        particular: true,
        peso: 59.4,
        altura: 161,
        email: "camila.ortega@email.com",
        antecedentes: "Ninguno",
        medicacion: "Ninguna"
    },
    {
        id: 1016,
        nombre: "Sebastián",
        apellido: "Mendoza",
        dni: "66778899",
        numeroAfiliado: "AF016",
        fechaNacimiento: "1979-11-02",
        telefono: "11-6677-8899",
        obraSocial: "OSDE",
        particular: false,
        peso: 81.7,
        altura: 179,
        email: "sebastian.mendoza@email.com",
        antecedentes: "Apnea del sueño",
        medicacion: "CPAP nocturno"
    },
    {
        id: 1017,
        nombre: "Natalia",
        apellido: "Silva",
        dni: "77889900",
        numeroAfiliado: "AF017",
        fechaNacimiento: "1984-07-13",
        telefono: "11-7788-9900",
        obraSocial: "Swiss Medical",
        particular: false,
        peso: 64.1,
        altura: 167,
        email: "natalia.silva@email.com",
        antecedentes: "Fibromialgia",
        medicacion: "Duloxetina 60mg"
    },
    {
        id: 1018,
        nombre: "Fernando",
        apellido: "Rojas",
        dni: "88990011",
        numeroAfiliado: "AF018",
        fechaNacimiento: "1971-03-09",
        telefono: "11-8899-0011",
        obraSocial: "Galeno",
        particular: false,
        peso: 77.8,
        altura: 173,
        email: "fernando.rojas@email.com",
        antecedentes: "Diabetes tipo 2, hipertensión",
        medicacion: "Metformina 1000mg, Amlodipino 5mg"
    },
    {
        id: 1019,
        nombre: "Gabriela",
        apellido: "Peña",
        dni: "99001122",
        numeroAfiliado: "AF019",
        fechaNacimiento: "1989-09-17",
        telefono: "11-9900-1122",
        obraSocial: "IOMA",
        particular: false,
        peso: 63.5,
        altura: 164,
        email: "gabriela.pena@email.com",
        antecedentes: "Ansiedad generalizada",
        medicacion: "Alprazolam 0.5mg"
    },
    {
        id: 1020,
        nombre: "Alejandro",
        apellido: "Guerrero",
        dni: "00112233",
        numeroAfiliado: "AF020",
        fechaNacimiento: "1994-04-05",
        telefono: "11-0011-2233",
        obraSocial: "Particular",
        particular: true,
        peso: 72.9,
        altura: 177,
        email: "alejandro.guerrero@email.com",
        antecedentes: "Ninguno",
        medicacion: "Ninguna"
    }
];

// Datos de consultas de ejemplo
const DEMO_CONSULTAS = {
    1001: [
        {
            id: 2001,
            fecha: "2025-09-20",
            motivo: "Control de diabetes e hipertensión",
            recetar: "Metformina 850mg x 30 días, Losartán 50mg x 30 días",
            ome: "Control en 3 meses",
            notas: "Paciente estable, mantener tratamiento actual",
            archivosJson: "[]",
            pacienteId: 1001
        },
        {
            id: 2002,
            fecha: "2025-06-15",
            motivo: "Control trimestral",
            recetar: "Metformina 850mg x 90 días",
            ome: "Hemoglobina glicosilada en 3 meses",
            notas: "HbA1c: 6.8%, presión arterial controlada",
            archivosJson: "[]",
            pacienteId: 1001
        }
    ],
    1002: [
        {
            id: 2003,
            fecha: "2025-09-18",
            motivo: "Crisis asmática",
            recetar: "Salbutamol inhalador, Prednisona 20mg x 5 días",
            ome: "Control en 1 semana",
            notas: "Mejorar técnica de inhalación",
            archivosJson: "[]",
            pacienteId: 1002
        },
        {
            id: 2004,
            fecha: "2025-07-10",
            motivo: "Control de asma",
            recetar: "Budesonida inhalador",
            ome: "Control en 2 meses",
            notas: "Asma bien controlada, continuar tratamiento",
            archivosJson: "[]",
            pacienteId: 1002
        }
    ],
    1003: [
        {
            id: 2005,
            fecha: "2025-09-15",
            motivo: "Control anual",
            recetar: "Ninguna",
            ome: "Control en 1 año",
            notas: "Paciente sana, continuar con hábitos saludables",
            archivosJson: "[]",
            pacienteId: 1003
        }
    ],
    1004: [
        {
            id: 2006,
            fecha: "2025-09-12",
            motivo: "Control de colesterol y artrosis",
            recetar: "Atorvastatina 20mg x 30 días, Ibuprofeno 400mg x 15 días",
            ome: "Perfil lipídico en 3 meses",
            notas: "Colesterol total: 220 mg/dl, dolor articular leve",
            archivosJson: "[]",
            pacienteId: 1004
        }
    ],
    1005: [
        {
            id: 2007,
            fecha: "2025-09-10",
            motivo: "Migraña recurrente",
            recetar: "Sumatriptán 50mg x 10 comprimidos",
            ome: "Control en 1 mes",
            notas: "Frecuencia de migrañas: 2-3 por semana",
            archivosJson: "[]",
            pacienteId: 1005
        }
    ],
    1006: [
        {
            id: 2008,
            fecha: "2025-09-08",
            motivo: "Gastritis crónica",
            recetar: "Omeprazol 20mg x 30 días",
            ome: "Endoscopia digestiva alta",
            notas: "Dolor epigástrico, pirosis nocturna",
            archivosJson: "[]",
            pacienteId: 1006
        }
    ],
    1007: [
        {
            id: 2009,
            fecha: "2025-09-05",
            motivo: "Alergia estacional",
            recetar: "Loratadina 10mg x 30 días",
            ome: "Control en 2 meses",
            notas: "Rinorrea, estornudos, prurito ocular",
            archivosJson: "[]",
            pacienteId: 1007
        }
    ],
    1008: [
        {
            id: 2010,
            fecha: "2025-09-03",
            motivo: "Control de depresión",
            recetar: "Sertralina 50mg x 30 días",
            ome: "Control en 1 mes",
            notas: "Estado de ánimo mejorado, continuar tratamiento",
            archivosJson: "[]",
            pacienteId: 1008
        }
    ]
};

// Función para activar el modo demo
function activateDemoMode() {
    console.log('🎭 Activando modo demo...');
    
    // Marcar que estamos en modo demo
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', 'demo');
    
    // Agregar indicador visual
    addDemoIndicator();
    
    // Redirigir a la página principal
    window.location.href = 'index.html';
}

// Función para agregar indicador de modo demo
function addDemoIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'demo-mode-indicator';
    indicator.innerHTML = '<i class="fas fa-play-circle"></i> Modo Demo';
    document.body.appendChild(indicator);
}

// Función para verificar si estamos en modo demo (solo si no existe)
if (typeof window.isDemoMode === 'undefined') {
    window.isDemoMode = function() {
        return localStorage.getItem('demoMode') === 'true';
    };
}

// Función para obtener pacientes de demo
function getDemoPatients() {
    return DEMO_PATIENTS;
}

// Función para obtener consultas de demo
function getDemoConsultas(pacienteId) {
    return DEMO_CONSULTAS[pacienteId] || [];
}

// Función para desactivar modo demo
function deactivateDemoMode() {
    console.log('🎭 Desactivando modo demo...');
    localStorage.removeItem('demoMode');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('jwtToken');
    
    // Remover indicador
    const indicator = document.querySelector('.demo-mode-indicator');
    if (indicator) {
        indicator.remove();
    }
    
    // Redirigir al login
    window.location.href = 'login.html';
}

// Función para simular API calls en modo demo
function simulateApiCall(endpoint, method = 'GET', data = null) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let response;
            
            if (endpoint.includes('/api/pacientes')) {
                if (endpoint.includes('/api/pacientes/test-db')) {
                    response = {
                        mensaje: "Modo Demo - Conexión simulada",
                        pacientes: DEMO_PATIENTS.length,
                        consultas: Object.keys(DEMO_CONSULTAS).length,
                        timestamp: new Date().toISOString()
                    };
                } else if (endpoint.includes('/con-notificaciones')) {
                    // Agregar propiedades de notificaciones a los pacientes de demo
                    response = DEMO_PATIENTS.map(patient => ({
                        ...patient,
                        tieneNotificaciones: Math.random() > 0.7, // 30% tienen notificaciones
                        tieneRecetarPendiente: Math.random() > 0.8, // 20% tienen recetas pendientes
                        tieneOmePendiente: Math.random() > 0.9 // 10% tienen OME pendientes
                    }));
                } else if (endpoint.match(/\/api\/pacientes\/\d+$/)) {
                    const id = parseInt(endpoint.match(/\/(\d+)$/)[1]);
                    const paciente = DEMO_PATIENTS.find(p => p.id === id);
                    response = paciente || null;
                } else {
                    response = DEMO_PATIENTS;
                }
            } else if (endpoint.includes('/consultas')) {
                const id = parseInt(endpoint.match(/\/pacientes\/(\d+)\/consultas/)[1]);
                response = getDemoConsultas(id);
            } else if (endpoint.includes('/api/usuarios/login')) {
                // Simular login exitoso en modo demo
                response = {
                    message: "Login exitoso en modo demo",
                    token: "demo_token_" + Date.now()
                };
            }
            
            resolve({
                ok: true,
                json: () => Promise.resolve(response),
                text: () => Promise.resolve(JSON.stringify(response))
            });
        }, 300); // Simular delay de red más rápido para demo
    });
}

// Exponer funciones globalmente
window.activateDemoMode = activateDemoMode;
window.getDemoPatients = getDemoPatients;
window.getDemoConsultas = getDemoConsultas;
window.deactivateDemoMode = deactivateDemoMode;
window.simulateApiCall = simulateApiCall;

console.log('✅ Modo demo cargado correctamente');
