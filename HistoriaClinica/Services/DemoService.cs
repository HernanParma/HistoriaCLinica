using HistoriaClinica.Data;
using HistoriaClinica.Models;
using HistoriaClinica.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HistoriaClinica.Services
{
    public class DemoService : IDemoService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DemoService> _logger;

        public DemoService(AppDbContext context, ILogger<DemoService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<object> TestDatabaseConnectionAsync()
        {
            _logger.LogInformation("[SERVICE] Probando conexión a la base de datos...");
            
            if (await _context.Database.CanConnectAsync())
            {
                var pacienteCount = await _context.Pacientes.CountAsync();
                var consultaCount = await _context.Consultas.CountAsync();
                _logger.LogInformation("[SERVICE] Conexión exitosa. Pacientes: {PacienteCount}, Consultas: {ConsultaCount}", 
                    pacienteCount, consultaCount);
                return new { 
                    mensaje = "Conexión a la base de datos exitosa",
                    pacientes = pacienteCount,
                    consultas = consultaCount,
                    timestamp = DateTime.UtcNow
                };
            }
            else
            {
                _logger.LogError("[SERVICE] No se puede conectar a la base de datos");
                throw new InvalidOperationException("No se puede conectar a la base de datos");
            }
        }

        public async Task<object> GenerarDatosDemoAsync()
        {
            _logger.LogInformation("[SERVICE] Generando datos de demostración...");
            
            var pacientesDemoExistentes = await _context.Pacientes
                .Where(p => p.Nombre.Contains("DEMO") || p.Apellido.Contains("DEMO"))
                .CountAsync();

            if (pacientesDemoExistentes > 0)
            {
                _logger.LogWarning("[SERVICE] Ya existen pacientes de demostración");
                throw new InvalidOperationException("Ya existen pacientes de demostración. Use el endpoint de limpiar datos demo primero.");
            }

            var pacientesDemo = GenerarPacientesDemo();
            foreach (var paciente in pacientesDemo)
            {
                _context.Pacientes.Add(paciente);
            }
            await _context.SaveChangesAsync();

            _logger.LogInformation("[SERVICE] {Count} pacientes de demostración creados exitosamente", pacientesDemo.Count);
            return new { 
                mensaje = "Datos de demostración generados exitosamente",
                pacientesCreados = pacientesDemo.Count,
                timestamp = DateTime.UtcNow
            };
        }

        public async Task<object> LimpiarDatosDemoAsync()
        {
            _logger.LogInformation("[SERVICE] Limpiando datos de demostración...");
            
            var pacientesDemo = await _context.Pacientes
                .Where(p => p.Nombre.Contains("DEMO") || p.Apellido.Contains("DEMO"))
                .ToListAsync();

            if (!pacientesDemo.Any())
            {
                _logger.LogWarning("[SERVICE] No se encontraron pacientes de demostración para eliminar");
                throw new InvalidOperationException("No se encontraron pacientes de demostración");
            }

            var consultasDemo = await _context.Consultas
                .Where(c => pacientesDemo.Select(p => p.Id).Contains(c.PacienteId))
                .ToListAsync();

            _context.Consultas.RemoveRange(consultasDemo);
            _context.Pacientes.RemoveRange(pacientesDemo);
            await _context.SaveChangesAsync();

            _logger.LogInformation("[SERVICE] {Count} pacientes de demostración eliminados exitosamente", pacientesDemo.Count);
            return new { 
                mensaje = "Datos de demostración eliminados exitosamente",
                pacientesEliminados = pacientesDemo.Count,
                consultasEliminadas = consultasDemo.Count,
                timestamp = DateTime.UtcNow
            };
        }

        public List<Paciente> GenerarPacientesDemo()
        {
            var random = new Random();
            var pacientes = new List<Paciente>();
            var datosPacientes = new[]
            {
                new { Nombre = "María", Apellido = "González DEMO", DNI = "12345678", FechaNac = new DateTime(1985, 3, 15), ObraSocial = "PAMI", Telefono = "11-1234-5678", Email = "maria.gonzalez@demo.com", Peso = 65m, Altura = 165, Particular = false },
                new { Nombre = "Carlos", Apellido = "Rodríguez DEMO", DNI = "23456789", FechaNac = new DateTime(1978, 7, 22), ObraSocial = "OSDE", Telefono = "11-2345-6789", Email = "carlos.rodriguez@demo.com", Peso = 78m, Altura = 175, Particular = false },
                new { Nombre = "Ana", Apellido = "Martínez DEMO", DNI = "34567890", FechaNac = new DateTime(1992, 11, 8), ObraSocial = "Swiss Medical", Telefono = "11-3456-7890", Email = "ana.martinez@demo.com", Peso = 58m, Altura = 160, Particular = false },
                new { Nombre = "Luis", Apellido = "Fernández DEMO", DNI = "45678901", FechaNac = new DateTime(1965, 5, 30), ObraSocial = "Galeno", Telefono = "11-4567-8901", Email = "luis.fernandez@demo.com", Peso = 82m, Altura = 180, Particular = false },
                new { Nombre = "Laura", Apellido = "López DEMO", DNI = "56789012", FechaNac = new DateTime(1988, 9, 12), ObraSocial = "Medicus", Telefono = "11-5678-9012", Email = "laura.lopez@demo.com", Peso = 62m, Altura = 168, Particular = false },
                new { Nombre = "Roberto", Apellido = "García DEMO", DNI = "67890123", FechaNac = new DateTime(1972, 1, 25), ObraSocial = "PAMI", Telefono = "11-6789-0123", Email = "roberto.garcia@demo.com", Peso = 85m, Altura = 178, Particular = false },
                new { Nombre = "Sofía", Apellido = "Hernández DEMO", DNI = "78901234", FechaNac = new DateTime(1995, 4, 18), ObraSocial = "OSDE", Telefono = "11-7890-1234", Email = "sofia.hernandez@demo.com", Peso = 55m, Altura = 162, Particular = false },
                new { Nombre = "Diego", Apellido = "Pérez DEMO", DNI = "89012345", FechaNac = new DateTime(1980, 8, 3), ObraSocial = "Swiss Medical", Telefono = "11-8901-2345", Email = "diego.perez@demo.com", Peso = 75m, Altura = 172, Particular = false },
                new { Nombre = "Valentina", Apellido = "Sánchez DEMO", DNI = "90123456", FechaNac = new DateTime(1990, 12, 14), ObraSocial = "Galeno", Telefono = "11-9012-3456", Email = "valentina.sanchez@demo.com", Peso = 60m, Altura = 165, Particular = false },
                new { Nombre = "Miguel", Apellido = "Ramírez DEMO", DNI = "01234567", FechaNac = new DateTime(1975, 6, 7), ObraSocial = "Medicus", Telefono = "11-0123-4567", Email = "miguel.ramirez@demo.com", Peso = 80m, Altura = 176, Particular = false },
                new { Nombre = "Camila", Apellido = "Torres DEMO", DNI = "11223344", FechaNac = new DateTime(1987, 2, 20), ObraSocial = "PAMI", Telefono = "11-1122-3344", Email = "camila.torres@demo.com", Peso = 63m, Altura = 167, Particular = false },
                new { Nombre = "Andrés", Apellido = "Flores DEMO", DNI = "22334455", FechaNac = new DateTime(1983, 10, 11), ObraSocial = "OSDE", Telefono = "11-2233-4455", Email = "andres.flores@demo.com", Peso = 77m, Altura = 174, Particular = false },
                new { Nombre = "Isabella", Apellido = "Vargas DEMO", DNI = "33445566", FechaNac = new DateTime(1993, 7, 28), ObraSocial = "Swiss Medical", Telefono = "11-3344-5566", Email = "isabella.vargas@demo.com", Peso = 57m, Altura = 159, Particular = false },
                new { Nombre = "Sebastián", Apellido = "Jiménez DEMO", DNI = "44556677", FechaNac = new DateTime(1979, 4, 5), ObraSocial = "Galeno", Telefono = "11-4455-6677", Email = "sebastian.jimenez@demo.com", Peso = 83m, Altura = 179, Particular = false },
                new { Nombre = "Natalia", Apellido = "Morales DEMO", DNI = "55667788", FechaNac = new DateTime(1986, 11, 16), ObraSocial = "Medicus", Telefono = "11-5566-7788", Email = "natalia.morales@demo.com", Peso = 61m, Altura = 163, Particular = false },
                new { Nombre = "Fernando", Apellido = "Castro DEMO", DNI = "66778899", FechaNac = new DateTime(1971, 9, 2), ObraSocial = "PAMI", Telefono = "11-6677-8899", Email = "fernando.castro@demo.com", Peso = 86m, Altura = 181, Particular = false },
                new { Nombre = "Gabriela", Apellido = "Ortega DEMO", DNI = "77889900", FechaNac = new DateTime(1991, 1, 13), ObraSocial = "OSDE", Telefono = "11-7788-9900", Email = "gabriela.ortega@demo.com", Peso = 59m, Altura = 161, Particular = false },
                new { Nombre = "Alejandro", Apellido = "Ruiz DEMO", DNI = "88990011", FechaNac = new DateTime(1984, 5, 24), ObraSocial = "Swiss Medical", Telefono = "11-8899-0011", Email = "alejandro.ruiz@demo.com", Peso = 76m, Altura = 173, Particular = false },
                new { Nombre = "Paula", Apellido = "Herrera DEMO", DNI = "99001122", FechaNac = new DateTime(1989, 8, 9), ObraSocial = "Galeno", Telefono = "11-9900-1122", Email = "paula.herrera@demo.com", Peso = 64m, Altura = 166, Particular = false },
                new { Nombre = "Javier", Apellido = "Mendoza DEMO", DNI = "00112233", FechaNac = new DateTime(1977, 12, 31), ObraSocial = "Medicus", Telefono = "11-0011-2233", Email = "javier.mendoza@demo.com", Peso = 79m, Altura = 177, Particular = false }
            };

            var motivosConsulta = new[]
            {
                "Control de presión arterial", "Control de diabetes", "Dolor de cabeza", "Control de colesterol",
                "Revisión general", "Dolor abdominal", "Control de medicación", "Síntomas gripales",
                "Control de peso", "Dolor de espalda", "Control de tiroides", "Revisión de análisis",
                "Consulta por ansiedad", "Control de hipertensión", "Dolor articular"
            };

            var medicaciones = new[]
            {
                "Metformina 850mg x 60 comp", "Losartan 50mg x 30 comp", "Atorvastatina 20mg x 30 comp",
                "Omeprazol 20mg x 30 comp", "AAS 100mg x 50 comp", "Levotiroxina 50mcg x 30 comp",
                "Amlodipina 5mg x 30 comp", "Clonazepam 0.5mg x 30 comp", "Paracetamol 500mg x 20 comp",
                "Ibuprofeno 400mg x 30 comp"
            };

            var antecedentes = new[]
            {
                "Hipertensión arterial", "Diabetes tipo 2", "Dislipidemia", "Hipotiroidismo",
                "Artrosis", "Gastritis", "Ansiedad", "Depresión", "Asma", "Migraña"
            };

            foreach (var datos in datosPacientes)
            {
                var paciente = new Paciente
                {
                    Nombre = datos.Nombre,
                    Apellido = datos.Apellido,
                    DNI = datos.DNI,
                    FechaNacimiento = datos.FechaNac,
                    ObraSocial = datos.ObraSocial,
                    Telefono = datos.Telefono,
                    Email = datos.Email,
                    Peso = datos.Peso,
                    Altura = datos.Altura,
                    Particular = datos.Particular,
                    NumeroAfiliado = $"DEMO{random.Next(100000, 999999)}",
                    Antecedentes = string.Join(", ", antecedentes.OrderBy(x => random.Next()).Take(random.Next(1, 4))),
                    Medicacion = string.Join(", ", medicaciones.OrderBy(x => random.Next()).Take(random.Next(1, 3))),
                    Consultas = new List<Consulta>()
                };

                var numConsultas = random.Next(2, 6);
                var fechaBase = DateTime.Now.AddDays(-random.Next(30, 365));
                for (int i = 0; i < numConsultas; i++)
                {
                    var consulta = new Consulta
                    {
                        Fecha = fechaBase.AddDays(-i * random.Next(15, 60)),
                        Motivo = motivosConsulta[random.Next(motivosConsulta.Length)],
                        Recetar = random.Next(0, 2) == 1 ? medicaciones[random.Next(medicaciones.Length)] : null,
                        Ome = random.Next(0, 2) == 1 ? "Control en 30 días" : null,
                        Notas = random.Next(0, 2) == 1 ? "Paciente colaborador, buena adherencia al tratamiento" : null,
                        RecetarRevisado = random.Next(0, 3) == 0, // 33% ya revisado
                        OmeRevisado = random.Next(0, 3) == 0, // 33% ya revisado
                        GR = random.Next(400, 600) / 100.0,
                        HTO = random.Next(35, 50) / 100.0,
                        HB = random.Next(12, 17) / 100.0,
                        GB = random.Next(4000, 10000) / 100.0,
                        PLAQ = random.Next(150000, 400000) / 100.0,
                        GLUC = random.Next(80, 140) / 100.0,
                        UREA = random.Next(15, 50) / 100.0,
                        CR = random.Next(60, 120) / 100.0,
                        GOT = random.Next(10, 40) / 100.0,
                        GPT = random.Next(10, 40) / 100.0,
                        CT = random.Next(150, 250) / 100.0,
                        TG = random.Next(70, 200) / 100.0,
                        VITD = random.Next(20, 50) / 100.0,
                        FAL = random.Next(40, 120) / 100.0,
                        B12 = random.Next(200, 800) / 100.0,
                        TSH = random.Next(100, 400) / 100.0,
                        URICO = random.Next(300, 700) / 100.0,
                        ORINA = random.Next(0, 2) == 1 ? "Normal" : null
                    };
                    paciente.Consultas.Add(consulta);
                }
                pacientes.Add(paciente);
            }
            return pacientes;
        }
    }
}
