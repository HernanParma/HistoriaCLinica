using HistoriaClinica.Data;
using HistoriaClinica.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HistoriaClinica.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // Comentado temporalmente para debugging
    public class PacientesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PacientesController> _logger;

        public PacientesController(AppDbContext context, ILogger<PacientesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todos los pacientes.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Paciente>>> ObtenerTodosLosPacientes()
        {
            try
            {
                _logger.LogInformation("[API] Solicitando todos los pacientes");
                
                // Verificar conexión a la base de datos
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }

                var pacientes = await _context.Pacientes.ToListAsync();
                _logger.LogInformation($"[API] {pacientes.Count} pacientes obtenidos exitosamente");
                return Ok(pacientes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al obtener pacientes");
                return StatusCode(500, $"Error interno al obtener pacientes: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene un paciente específico por su ID usando DTOs para evitar ciclos de navegación.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PacienteDto>> ObtenerPacientePorId(int id)
        {
            try
            {
                _logger.LogInformation("[API] Solicitando paciente con ID: {PatientId}", id);
                
                // Verificar conexión a la base de datos
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }

                _logger.LogInformation("[API] Buscando paciente en la base de datos...");
                
                // Usar proyección a DTO para evitar ciclos de navegación
                var dto = await _context.Pacientes
                    .AsNoTracking()
                    .Where(p => p.Id == id)
                    .Select(p => new PacienteDto
                    {
                        Id = p.Id,
                        Nombre = p.Nombre ?? "",
                        Apellido = p.Apellido ?? "",
                        DNI = p.DNI ?? "",
                        NumeroAfiliado = p.NumeroAfiliado ?? "",
                        FechaNacimiento = p.FechaNacimiento,
                        Telefono = p.Telefono ?? "",
                        ObraSocial = p.ObraSocial ?? "",
                        Particular = p.Particular,
                        Peso = p.Peso,
                        Altura = p.Altura,
                        Email = p.Email ?? "",
                        Antecedentes = p.Antecedentes ?? "",
                        Medicacion = p.Medicacion ?? "",
                        // Incluir consultas básicas sin crear ciclos
                        Consultas = p.Consultas
                            .OrderByDescending(c => c.Fecha)
                            .Select(c => new ConsultaDto
                            {
                                Id = c.Id,
                                Fecha = c.Fecha,
                                Motivo = c.Motivo ?? "",
                                Recetar = c.Recetar ?? "",
                                Ome = c.Ome ?? "",
                                Notas = c.Notas ?? "",
                                Archivos = null, // Se llenará después con DeserializarArchivos
                                // Valores de laboratorio
                                GR = c.GR,
                                HTO = c.HTO,
                                HB = c.HB,
                                GB = c.GB,
                                PLAQ = c.PLAQ,
                                GLUC = c.GLUC,
                                UREA = c.UREA,
                                CR = c.CR,
                                GOT = c.GOT,
                                GPT = c.GPT,
                                CT = c.CT,
                                TG = c.TG,
                                VITD = c.VITD,
                                FAL = c.FAL,
                                COL = c.COL,
                                B12 = c.B12,
                                TSH = c.TSH,
                                ORINA = c.ORINA,
                                URICO = c.URICO
                            }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (dto == null)
                {
                    _logger.LogWarning("[API] Paciente {PatientId} no encontrado en la base de datos", id);
                    return NotFound($"Paciente con ID {id} no encontrado");
                }

                // Llenar archivos para cada consulta
                if (dto.Consultas != null)
                {
                    foreach (var consulta in dto.Consultas)
                    {
                        var consultaCompleta = await _context.Consultas.FindAsync(consulta.Id);
                        if (consultaCompleta != null)
                        {
                            consulta.Archivos = DeserializarArchivos(consultaCompleta.ArchivosJson);
                        }
                    }
                }

                _logger.LogInformation("[API] Paciente encontrado: {Nombre} {Apellido}", dto.Nombre, dto.Apellido);
                _logger.LogInformation("[API] Consultas asociadas: {Count}", dto.Consultas?.Count ?? 0);
                
                // Logging detallado del paciente
                _logger.LogInformation("[API] Detalles del paciente: ID={Id}, Nombre={Nombre}, Apellido={Apellido}, DNI={DNI}", 
                    dto.Id, dto.Nombre, dto.Apellido, dto.DNI);

                return Ok(dto);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "[API] Error de base de datos al obtener paciente {PatientId}", id);
                return StatusCode(500, new { 
                    mensaje = "Error de base de datos al obtener paciente",
                    error = dbEx.InnerException?.Message ?? dbEx.Message,
                    pacienteId = id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error inesperado al obtener paciente {PatientId}", id);
                return StatusCode(500, new { 
                    mensaje = "Error interno del servidor al obtener paciente",
                    error = ex.Message,
                    pacienteId = id
                });
            }
        }

        /// <summary>
        /// Crea un nuevo paciente.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PacienteDto>> CrearPaciente([FromBody] CrearPacienteDto crearPacienteDto)
        {
            try
            {
                _logger.LogInformation("[API] Creando nuevo paciente: {Nombre} {Apellido}", 
                    crearPacienteDto.Nombre, crearPacienteDto.Apellido);
                
                // Verificar conexión a la base de datos
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }

                // Validar datos de entrada
                if (string.IsNullOrWhiteSpace(crearPacienteDto.Nombre))
                {
                    _logger.LogWarning("[API] Nombre del paciente requerido");
                    return BadRequest(new { mensaje = "El nombre del paciente es requerido" });
                }

                if (string.IsNullOrWhiteSpace(crearPacienteDto.Apellido))
                {
                    _logger.LogWarning("[API] Apellido del paciente requerido");
                    return BadRequest(new { mensaje = "El apellido del paciente es requerido" });
                }

                if (string.IsNullOrWhiteSpace(crearPacienteDto.DNI))
                {
                    _logger.LogWarning("[API] DNI del paciente requerido");
                    return BadRequest(new { mensaje = "El DNI del paciente es requerido" });
                }

                // Verificar si ya existe un paciente con el mismo DNI
                var pacienteExistente = await _context.Pacientes
                    .FirstOrDefaultAsync(p => p.DNI == crearPacienteDto.DNI);
                
                if (pacienteExistente != null)
                {
                    _logger.LogWarning("[API] Ya existe un paciente con DNI: {DNI}", crearPacienteDto.DNI);
                    return BadRequest(new { mensaje = "Ya existe un paciente con este DNI" });
                }

                // Crear nuevo paciente
                var nuevoPaciente = new Paciente
                {
                    Nombre = crearPacienteDto.Nombre.Trim(),
                    Apellido = crearPacienteDto.Apellido.Trim(),
                    DNI = crearPacienteDto.DNI.Trim(),
                    NumeroAfiliado = crearPacienteDto.NumeroAfiliado?.Trim(),
                    FechaNacimiento = crearPacienteDto.FechaNacimiento,
                    Telefono = crearPacienteDto.Telefono?.Trim(),
                    ObraSocial = crearPacienteDto.ObraSocial?.Trim(),
                    Particular = crearPacienteDto.Particular,
                    Peso = crearPacienteDto.Peso,
                    Altura = crearPacienteDto.Altura,
                    Email = crearPacienteDto.Email?.Trim(),
                    Antecedentes = crearPacienteDto.Antecedentes?.Trim(),
                    Medicacion = crearPacienteDto.Medicacion?.Trim()
                };

                // Agregar a la base de datos
                _context.Pacientes.Add(nuevoPaciente);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("[API] Paciente creado exitosamente con ID: {PacienteId}", nuevoPaciente.Id);
                
                // Retornar el paciente creado como DTO
                var pacienteCreado = new PacienteDto
                {
                    Id = nuevoPaciente.Id,
                    Nombre = nuevoPaciente.Nombre,
                    Apellido = nuevoPaciente.Apellido,
                    DNI = nuevoPaciente.DNI,
                    NumeroAfiliado = nuevoPaciente.NumeroAfiliado,
                    FechaNacimiento = nuevoPaciente.FechaNacimiento,
                    Telefono = nuevoPaciente.Telefono,
                    ObraSocial = nuevoPaciente.ObraSocial,
                    Particular = nuevoPaciente.Particular,
                    Peso = nuevoPaciente.Peso,
                    Altura = nuevoPaciente.Altura,
                    Email = nuevoPaciente.Email,
                    Antecedentes = nuevoPaciente.Antecedentes,
                    Medicacion = nuevoPaciente.Medicacion,
                    Consultas = new List<ConsultaDto>()
                };
                
                return CreatedAtAction(nameof(ObtenerPacientePorId), new { id = nuevoPaciente.Id }, pacienteCreado);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "[API] Error de base de datos al crear paciente");
                return StatusCode(500, new { 
                    mensaje = "Error de base de datos al crear el paciente",
                    error = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error inesperado al crear paciente");
                return StatusCode(500, new { 
                    mensaje = "Error interno del servidor al crear el paciente",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Obtiene las consultas de un paciente específico.
        /// </summary>
        [HttpGet("{id}/consultas")]
        public async Task<ActionResult> ObtenerConsultasPorPaciente(int id)
        {
            try
            {
                _logger.LogInformation("[API] Consultas solicitadas para paciente {PatientId}", id);
                
                // Verificar conexión a la base de datos
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }

                _logger.LogInformation("[API] Verificando que el paciente {PatientId} existe...", id);
                
                // Primero verificar que el paciente existe
                var pacienteExiste = await _context.Pacientes.AnyAsync(p => p.Id == id);
                if (!pacienteExiste)
                {
                    _logger.LogWarning("[API] Paciente {PatientId} no existe en la base de datos", id);
                    return NotFound($"Paciente con ID {id} no encontrado");
                }
                
                _logger.LogInformation("[API] Paciente {PatientId} existe, buscando consultas...", id);
                
                var consultas = await _context.Consultas
                    .Where(c => c.PacienteId == id)
                    .OrderByDescending(c => c.Fecha)
                    .ToListAsync();
                
                _logger.LogInformation("[API] Consultas encontradas: {Count}", consultas.Count);
                
                // Convertir a DTOs con archivos
                var consultasDto = consultas.Select(c => new ConsultaDto
                {
                    Id = c.Id,
                    Fecha = c.Fecha,
                    Motivo = c.Motivo ?? "",
                    Recetar = c.Recetar ?? "",
                    Ome = c.Ome ?? "",
                    Notas = c.Notas ?? "",
                    Archivos = DeserializarArchivos(c.ArchivosJson),
                    // Valores de laboratorio
                    GR = c.GR,
                    HTO = c.HTO,
                    HB = c.HB,
                    GB = c.GB,
                    PLAQ = c.PLAQ,
                    GLUC = c.GLUC,
                    UREA = c.UREA,
                    CR = c.CR,
                    GOT = c.GOT,
                    GPT = c.GPT,
                    CT = c.CT,
                    TG = c.TG,
                    VITD = c.VITD,
                    FAL = c.FAL,
                    COL = c.COL,
                    B12 = c.B12,
                    TSH = c.TSH,
                    ORINA = c.ORINA,
                    URICO = c.URICO
                }).ToList();
                
                // Logging detallado de cada consulta para debug
                foreach (var consulta in consultasDto)
                {
                    _logger.LogInformation("[API] Consulta {ConsultaId}: Fecha={Fecha}, Motivo={Motivo}, Archivos={ArchivosCount}", 
                        consulta.Id, consulta.Fecha, consulta.Motivo, consulta.Archivos?.Count ?? 0);
                    
                    // Debug específico para valores de laboratorio
                    _logger.LogInformation("[API] Laboratorio - GR={GR}, HTO={HTO}, HB={HB}, GB={GB}, PLAQ={PLAQ}, GLUC={GLUC}, UREA={UREA}, CR={CR}", 
                        consulta.GR, consulta.HTO, consulta.HB, consulta.GB, consulta.PLAQ, consulta.GLUC, consulta.UREA, consulta.CR);
                    _logger.LogInformation("[API] Laboratorio - GOT={GOT}, GPT={GPT}, CT={CT}, TG={TG}, VITD={VITD}, FAL={FAL}, COL={COL}, B12={B12}", 
                        consulta.GOT, consulta.GPT, consulta.CT, consulta.TG, consulta.VITD, consulta.FAL, consulta.COL, consulta.B12);
                    _logger.LogInformation("[API] Laboratorio - TSH={TSH}, URICO={URICO}, ORINA={ORINA}", 
                        consulta.TSH, consulta.URICO, consulta.ORINA);
                }

                _logger.LogInformation("[API] Preparando respuesta JSON...");
                
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    ReferenceHandler = ReferenceHandler.IgnoreCycles
                };
                
                _logger.LogInformation("[API] Respuesta enviada exitosamente");
                return new JsonResult(consultasDto, options);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "[API] Error de base de datos al obtener consultas para paciente {PatientId}", id);
                return StatusCode(500, new { 
                    mensaje = "Error de base de datos al obtener consultas",
                    error = dbEx.InnerException?.Message ?? dbEx.Message,
                    pacienteId = id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error inesperado al obtener consultas para paciente {PatientId}", id);
                return StatusCode(500, new { 
                    mensaje = "Error interno del servidor al obtener consultas",
                    error = ex.Message,
                    pacienteId = id
                });
            }
        }

            /// <summary>
    /// Crea una nueva consulta para un paciente.
    /// </summary>
    [HttpPost("{pacienteId}/consultas")]
    public async Task<ActionResult<ConsultaDto>> CrearConsulta(int pacienteId, [FromBody] CrearConsultaDto crearConsultaDto)
    {
        try
        {
            _logger.LogInformation("[API] Creando nueva consulta para paciente {PatientId}", pacienteId);
            
            // Debug: Log de los datos recibidos
            _logger.LogInformation("[API] Datos de consulta recibidos: Motivo={Motivo}, Fecha={Fecha}", 
                crearConsultaDto.Motivo, crearConsultaDto.Fecha);
            _logger.LogInformation("[API] Laboratorio recibido - GR={GR}, HTO={HTO}, HB={HB}, GB={GB}, PLAQ={PLAQ}, GLUC={GLUC}, UREA={UREA}, CR={CR}", 
                crearConsultaDto.GR, crearConsultaDto.HTO, crearConsultaDto.HB, crearConsultaDto.GB, 
                crearConsultaDto.PLAQ, crearConsultaDto.GLUC, crearConsultaDto.UREA, crearConsultaDto.CR);
            _logger.LogInformation("[API] Laboratorio recibido - GOT={GOT}, GPT={GPT}, CT={CT}, TG={TG}, VITD={VITD}, FAL={FAL}, COL={COL}, B12={B12}", 
                crearConsultaDto.GOT, crearConsultaDto.GPT, crearConsultaDto.CT, crearConsultaDto.TG, 
                crearConsultaDto.VITD, crearConsultaDto.FAL, crearConsultaDto.COL, crearConsultaDto.B12);
            _logger.LogInformation("[API] Laboratorio recibido - TSH={TSH}, URICO={URICO}, ORINA={ORINA}", 
                crearConsultaDto.TSH, crearConsultaDto.URICO, crearConsultaDto.ORINA);
            
            // Verificar que el paciente existe
            var paciente = await _context.Pacientes.FindAsync(pacienteId);
            if (paciente == null)
            {
                _logger.LogWarning("[API] Paciente {PatientId} no encontrado", pacienteId);
                return NotFound(new { mensaje = "Paciente no encontrado" });
            }

            // Validar datos de entrada
            if (string.IsNullOrWhiteSpace(crearConsultaDto.Motivo))
            {
                _logger.LogWarning("[API] Motivo de consulta requerido para paciente {PatientId}", pacienteId);
                return BadRequest(new { mensaje = "El motivo de la consulta es requerido" });
            }

            // Procesar archivos adjuntos
            string? archivosJson = null;
            if (crearConsultaDto.Archivos != null && crearConsultaDto.Archivos.Any())
            {
                var archivos = new List<ArchivoConsulta>();
                foreach (var archivoDto in crearConsultaDto.Archivos)
                {
                    var archivo = new ArchivoConsulta
                    {
                        NombreOriginal = archivoDto.NombreOriginal,
                        NombreArchivo = archivoDto.NombreArchivo,
                        Extension = archivoDto.Extension,
                        TipoMime = archivoDto.TipoMime,
                        TamañoBytes = archivoDto.TamañoBytes,
                        FechaSubida = archivoDto.FechaSubida,
                        RutaArchivo = archivoDto.RutaArchivo
                    };
                    archivos.Add(archivo);
                }
                archivosJson = JsonSerializer.Serialize(archivos);
            }

            // Crear nueva consulta
            var nuevaConsulta = new Consulta
            {
                PacienteId = pacienteId,
                Fecha = crearConsultaDto.Fecha ?? DateTime.Now,
                Motivo = crearConsultaDto.Motivo.Trim(),
                Recetar = crearConsultaDto.Recetar?.Trim(),
                Ome = crearConsultaDto.Ome?.Trim(),
                Notas = crearConsultaDto.Notas?.Trim(),
                ArchivosJson = archivosJson,
                // Valores de laboratorio
                GR = crearConsultaDto.GR,
                HTO = crearConsultaDto.HTO,
                HB = crearConsultaDto.HB,
                GB = crearConsultaDto.GB,
                PLAQ = crearConsultaDto.PLAQ,
                GLUC = crearConsultaDto.GLUC,
                UREA = crearConsultaDto.UREA,
                CR = crearConsultaDto.CR,
                GOT = crearConsultaDto.GOT,
                GPT = crearConsultaDto.GPT,
                CT = crearConsultaDto.CT,
                TG = crearConsultaDto.TG,
                VITD = crearConsultaDto.VITD,
                FAL = crearConsultaDto.FAL,
                COL = crearConsultaDto.COL,
                B12 = crearConsultaDto.B12,
                TSH = crearConsultaDto.TSH,
                ORINA = crearConsultaDto.ORINA,
                URICO = crearConsultaDto.URICO
            };

            // Agregar a la base de datos
            _context.Consultas.Add(nuevaConsulta);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("[API] Consulta creada exitosamente con ID: {ConsultaId}", nuevaConsulta.Id);
            
            // Debug: Verificar que los valores se guardaron correctamente
            _logger.LogInformation("[API] Verificación - Laboratorio guardado - GR={GR}, HTO={HTO}, HB={HB}, GB={GB}, PLAQ={PLAQ}, GLUC={GLUC}, UREA={UREA}, CR={CR}", 
                nuevaConsulta.GR, nuevaConsulta.HTO, nuevaConsulta.HB, nuevaConsulta.GB, 
                nuevaConsulta.PLAQ, nuevaConsulta.GLUC, nuevaConsulta.UREA, nuevaConsulta.CR);
            _logger.LogInformation("[API] Verificación - Laboratorio guardado - GOT={GOT}, GPT={GPT}, CT={CT}, TG={TG}, VITD={VITD}, FAL={FAL}, COL={COL}, B12={B12}", 
                nuevaConsulta.GOT, nuevaConsulta.GPT, nuevaConsulta.CT, nuevaConsulta.TG, 
                nuevaConsulta.VITD, nuevaConsulta.FAL, nuevaConsulta.COL, nuevaConsulta.B12);
            _logger.LogInformation("[API] Verificación - Laboratorio guardado - TSH={TSH}, URICO={URICO}, ORINA={ORINA}", 
                nuevaConsulta.TSH, nuevaConsulta.URICO, nuevaConsulta.ORINA);
            
            // Retornar la consulta creada como DTO
            var consultaCreada = new ConsultaDto
            {
                Id = nuevaConsulta.Id,
                Fecha = nuevaConsulta.Fecha,
                Motivo = nuevaConsulta.Motivo,
                Recetar = nuevaConsulta.Recetar,
                Ome = nuevaConsulta.Ome,
                Notas = nuevaConsulta.Notas,
                Archivos = DeserializarArchivos(nuevaConsulta.ArchivosJson),
                // Valores de laboratorio
                GR = nuevaConsulta.GR,
                HTO = nuevaConsulta.HTO,
                HB = nuevaConsulta.HB,
                GB = nuevaConsulta.GB,
                PLAQ = nuevaConsulta.PLAQ,
                GLUC = nuevaConsulta.GLUC,
                UREA = nuevaConsulta.UREA,
                CR = nuevaConsulta.CR,
                GOT = nuevaConsulta.GOT,
                GPT = nuevaConsulta.GPT,
                CT = nuevaConsulta.CT,
                TG = nuevaConsulta.TG,
                VITD = nuevaConsulta.VITD,
                FAL = nuevaConsulta.FAL,
                COL = nuevaConsulta.COL,
                B12 = nuevaConsulta.B12,
                TSH = nuevaConsulta.TSH,
                ORINA = nuevaConsulta.ORINA,
                URICO = nuevaConsulta.URICO
            };
            
            return CreatedAtAction(nameof(ObtenerConsultasPorPaciente), new { id = pacienteId }, consultaCreada);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "[API] Error de base de datos al crear consulta para paciente {PatientId}", pacienteId);
            return StatusCode(500, new { 
                mensaje = "Error de base de datos al crear la consulta",
                error = dbEx.InnerException?.Message ?? dbEx.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[API] Error inesperado al crear consulta para paciente {PatientId}", pacienteId);
            return StatusCode(500, new { 
                mensaje = "Error interno del servidor al crear la consulta",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Obtiene una consulta específica de un paciente.
    /// </summary>
    [HttpGet("{pacienteId}/consultas/{consultaId}")]
    public async Task<ActionResult<ConsultaDto>> ObtenerConsultaPorId(int pacienteId, int consultaId)
    {
        try
        {
            _logger.LogInformation("[API] Obteniendo consulta {ConsultaId} del paciente {PatientId}", consultaId, pacienteId);
            
            // Verificar que el paciente existe
            var paciente = await _context.Pacientes.FindAsync(pacienteId);
            if (paciente == null)
            {
                _logger.LogWarning("[API] Paciente {PatientId} no encontrado", pacienteId);
                return NotFound(new { mensaje = "Paciente no encontrado" });
            }

            // Buscar la consulta específica
            var consulta = await _context.Consultas
                .FirstOrDefaultAsync(c => c.Id == consultaId && c.PacienteId == pacienteId);
            
            if (consulta == null)
            {
                _logger.LogWarning("[API] Consulta {ConsultaId} no encontrada para el paciente {PatientId}", consultaId, pacienteId);
                return NotFound(new { mensaje = "Consulta no encontrada" });
            }

            _logger.LogInformation("[API] Consulta {ConsultaId} encontrada exitosamente", consultaId);
            
            // Retornar la consulta como DTO
            var consultaDto = new ConsultaDto
            {
                Id = consulta.Id,
                Fecha = consulta.Fecha,
                Motivo = consulta.Motivo,
                Recetar = consulta.Recetar,
                Ome = consulta.Ome,
                Notas = consulta.Notas,
                Archivos = DeserializarArchivos(consulta.ArchivosJson),
                // Valores de laboratorio
                GR = consulta.GR,
                HTO = consulta.HTO,
                HB = consulta.HB,
                GB = consulta.GB,
                PLAQ = consulta.PLAQ,
                GLUC = consulta.GLUC,
                UREA = consulta.UREA,
                CR = consulta.CR,
                GOT = consulta.GOT,
                GPT = consulta.GPT,
                CT = consulta.CT,
                TG = consulta.TG,
                VITD = consulta.VITD,
                FAL = consulta.FAL,
                COL = consulta.COL,
                B12 = consulta.B12,
                TSH = consulta.TSH,
                ORINA = consulta.ORINA,
                URICO = consulta.URICO
            };
            
            return Ok(consultaDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[API] Error inesperado al obtener consulta {ConsultaId}", consultaId);
            return StatusCode(500, new { 
                mensaje = "Error interno del servidor al obtener la consulta",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Actualiza una consulta existente de un paciente.
    /// </summary>
    [HttpPut("{pacienteId}/consultas/{consultaId}")]
    public async Task<ActionResult<ConsultaDto>> ActualizarConsulta(int pacienteId, int consultaId, [FromBody] CrearConsultaDto actualizarConsultaDto)
    {
        try
        {
            _logger.LogInformation("[API] Actualizando consulta {ConsultaId} del paciente {PatientId}", consultaId, pacienteId);
            
            // Verificar que el paciente existe
            var paciente = await _context.Pacientes.FindAsync(pacienteId);
            if (paciente == null)
            {
                _logger.LogWarning("[API] Paciente {PatientId} no encontrado", pacienteId);
                return NotFound(new { mensaje = "Paciente no encontrado" });
            }

            // Buscar la consulta específica
            var consulta = await _context.Consultas
                .FirstOrDefaultAsync(c => c.Id == consultaId && c.PacienteId == pacienteId);
            
            if (consulta == null)
            {
                _logger.LogWarning("[API] Consulta {ConsultaId} no encontrada para el paciente {PatientId}", consultaId, pacienteId);
                return NotFound(new { mensaje = "Consulta no encontrada" });
            }

            // Validar datos de entrada
            if (string.IsNullOrWhiteSpace(actualizarConsultaDto.Motivo))
            {
                _logger.LogWarning("[API] Motivo de consulta requerido para actualizar consulta {ConsultaId}", consultaId);
                return BadRequest(new { mensaje = "El motivo de la consulta es requerido" });
            }

            // Actualizar la consulta
            consulta.Fecha = actualizarConsultaDto.Fecha ?? consulta.Fecha;
            consulta.Motivo = actualizarConsultaDto.Motivo.Trim();
            consulta.Recetar = actualizarConsultaDto.Recetar?.Trim();
            consulta.Ome = actualizarConsultaDto.Ome?.Trim();
            consulta.Notas = actualizarConsultaDto.Notas?.Trim();
            
            // Actualizar valores de laboratorio
            consulta.GR = actualizarConsultaDto.GR;
            consulta.HTO = actualizarConsultaDto.HTO;
            consulta.HB = actualizarConsultaDto.HB;
            consulta.GB = actualizarConsultaDto.GB;
            consulta.PLAQ = actualizarConsultaDto.PLAQ;
            consulta.GLUC = actualizarConsultaDto.GLUC;
            consulta.UREA = actualizarConsultaDto.UREA;
            consulta.CR = actualizarConsultaDto.CR;
            consulta.GOT = actualizarConsultaDto.GOT;
            consulta.GPT = actualizarConsultaDto.GPT;
            consulta.CT = actualizarConsultaDto.CT;
            consulta.TG = actualizarConsultaDto.TG;
            consulta.VITD = actualizarConsultaDto.VITD;
            consulta.FAL = actualizarConsultaDto.FAL;
            consulta.COL = actualizarConsultaDto.COL;
            consulta.B12 = actualizarConsultaDto.B12;
            consulta.TSH = actualizarConsultaDto.TSH;
            consulta.ORINA = actualizarConsultaDto.ORINA;
            consulta.URICO = actualizarConsultaDto.URICO;

            // Guardar cambios
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("[API] Consulta {ConsultaId} actualizada exitosamente", consultaId);
            
            // Retornar la consulta actualizada como DTO
            var consultaActualizada = new ConsultaDto
            {
                Id = consulta.Id,
                Fecha = consulta.Fecha,
                Motivo = consulta.Motivo,
                Recetar = consulta.Recetar,
                Ome = consulta.Ome,
                Notas = consulta.Notas,
                Archivos = DeserializarArchivos(consulta.ArchivosJson),
                // Valores de laboratorio
                GR = consulta.GR,
                HTO = consulta.HTO,
                HB = consulta.HB,
                GB = consulta.GB,
                PLAQ = consulta.PLAQ,
                GLUC = consulta.GLUC,
                UREA = consulta.UREA,
                CR = consulta.CR,
                GOT = consulta.GOT,
                GPT = consulta.GPT,
                CT = consulta.CT,
                TG = consulta.TG,
                VITD = consulta.VITD,
                FAL = consulta.FAL,
                COL = consulta.COL,
                B12 = consulta.B12,
                TSH = consulta.TSH,
                ORINA = consulta.ORINA,
                URICO = consulta.URICO
            };
            
            return Ok(consultaActualizada);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "[API] Error de base de datos al actualizar consulta {ConsultaId}", consultaId);
            return StatusCode(500, new { 
                mensaje = "Error de base de datos al actualizar la consulta",
                error = dbEx.InnerException?.Message ?? dbEx.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[API] Error inesperado al actualizar consulta {ConsultaId}", consultaId);
            return StatusCode(500, new { 
                mensaje = "Error interno del servidor al actualizar la consulta",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Elimina una consulta específica de un paciente.
    /// </summary>
    [HttpDelete("{pacienteId}/consultas/{consultaId}")]
    public async Task<IActionResult> EliminarConsulta(int pacienteId, int consultaId)
        {
            try
            {
                _logger.LogInformation("[API] Eliminando consulta {ConsultaId} del paciente {PatientId}", consultaId, pacienteId);
                
                // Verificar que el paciente existe
                var paciente = await _context.Pacientes.FindAsync(pacienteId);
                if (paciente == null)
                {
                    _logger.LogWarning("[API] Paciente {PatientId} no encontrado", pacienteId);
                    return NotFound(new { mensaje = "Paciente no encontrado" });
                }

                // Buscar la consulta específica
                var consulta = await _context.Consultas
                    .FirstOrDefaultAsync(c => c.Id == consultaId && c.PacienteId == pacienteId);
                
                if (consulta == null)
                {
                    _logger.LogWarning("[API] Consulta {ConsultaId} no encontrada para el paciente {PatientId}", consultaId, pacienteId);
                    return NotFound(new { mensaje = "Consulta no encontrada" });
                }

                // Eliminar la consulta
                _context.Consultas.Remove(consulta);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("[API] Consulta {ConsultaId} eliminada exitosamente", consultaId);
                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "[API] Error de base de datos al eliminar consulta {ConsultaId}", consultaId);
                return StatusCode(500, new { mensaje = "Error de base de datos al eliminar la consulta" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error inesperado al eliminar consulta {ConsultaId}", consultaId);
                return StatusCode(500, new { mensaje = "Error interno del servidor al eliminar la consulta" });
            }
        }

        /// <summary>
        /// Actualiza los datos de un paciente existente usando PUT.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<PacienteDto>> ActualizarPacientePut(int id, [FromBody] ActualizarPacienteDto actualizarPacienteDto)
        {
            try
            {
                _logger.LogInformation("[API] Actualizando paciente con ID: {PatientId} (PUT)", id);
                
                // Verificar conexión a la base de datos
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }

                // Verificar que el paciente existe
                var paciente = await _context.Pacientes.FindAsync(id);
                if (paciente == null)
                {
                    _logger.LogWarning("[API] Paciente {PatientId} no encontrado", id);
                    return NotFound(new { mensaje = "Paciente no encontrado" });
                }

                // Actualizar solo los campos proporcionados
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Nombre))
                    paciente.Nombre = actualizarPacienteDto.Nombre.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Apellido))
                    paciente.Apellido = actualizarPacienteDto.Apellido.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.DNI))
                    paciente.DNI = actualizarPacienteDto.DNI.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.NumeroAfiliado))
                    paciente.NumeroAfiliado = actualizarPacienteDto.NumeroAfiliado.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.ObraSocial))
                    paciente.ObraSocial = actualizarPacienteDto.ObraSocial.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Telefono))
                    paciente.Telefono = actualizarPacienteDto.Telefono.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Email))
                    paciente.Email = actualizarPacienteDto.Email.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Antecedentes))
                    paciente.Antecedentes = actualizarPacienteDto.Antecedentes.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Medicacion))
                    paciente.Medicacion = actualizarPacienteDto.Medicacion.Trim();

                // Actualizar campos opcionales
                if (actualizarPacienteDto.FechaNacimiento.HasValue)
                    paciente.FechaNacimiento = actualizarPacienteDto.FechaNacimiento.Value;
                
                if (actualizarPacienteDto.Peso.HasValue)
                    paciente.Peso = actualizarPacienteDto.Peso.Value;
                
                if (actualizarPacienteDto.Altura.HasValue)
                    paciente.Altura = actualizarPacienteDto.Altura.Value;
                
                if (actualizarPacienteDto.Particular.HasValue)
                    paciente.Particular = actualizarPacienteDto.Particular.Value;

                // Guardar cambios
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("[API] Paciente {PatientId} actualizado exitosamente (PUT)", id);
                
                // Retornar el paciente actualizado como DTO
                var pacienteActualizado = new PacienteDto
                {
                    Id = paciente.Id,
                    Nombre = paciente.Nombre,
                    Apellido = paciente.Apellido,
                    DNI = paciente.DNI,
                    NumeroAfiliado = paciente.NumeroAfiliado,
                    FechaNacimiento = paciente.FechaNacimiento,
                    Telefono = paciente.Telefono,
                    ObraSocial = paciente.ObraSocial,
                    Particular = paciente.Particular,
                    Peso = paciente.Peso,
                    Altura = paciente.Altura,
                    Email = paciente.Email,
                    Antecedentes = paciente.Antecedentes,
                    Medicacion = paciente.Medicacion,
                    Consultas = new List<ConsultaDto>()
                };
                
                return Ok(pacienteActualizado);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "[API] Error de base de datos al actualizar paciente {PatientId} (PUT)", id);
                return StatusCode(500, new { 
                    mensaje = "Error de base de datos al actualizar el paciente",
                    error = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error inesperado al actualizar paciente {PatientId} (PUT)", id);
                return StatusCode(500, new { 
                    mensaje = "Error interno del servidor al actualizar el paciente",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Actualiza los datos de un paciente existente usando POST.
        /// </summary>
        [HttpPost("{id}/actualizar")]
        public async Task<ActionResult> ActualizarPaciente(int id, [FromBody] ActualizarPacienteDto actualizarPacienteDto)
        {
            try
            {
                _logger.LogInformation("[API] Actualizando paciente con ID: {PatientId}", id);
                
                // Verificar que el paciente existe
                var paciente = await _context.Pacientes.FindAsync(id);
                if (paciente == null)
                {
                    _logger.LogWarning("[API] Paciente {PatientId} no encontrado", id);
                    return NotFound(new { mensaje = "Paciente no encontrado" });
                }

                // Actualizar solo los campos proporcionados
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Nombre))
                    paciente.Nombre = actualizarPacienteDto.Nombre.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Apellido))
                    paciente.Apellido = actualizarPacienteDto.Apellido.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.DNI))
                    paciente.DNI = actualizarPacienteDto.DNI.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.NumeroAfiliado))
                    paciente.NumeroAfiliado = actualizarPacienteDto.NumeroAfiliado.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.ObraSocial))
                    paciente.ObraSocial = actualizarPacienteDto.ObraSocial.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Telefono))
                    paciente.Telefono = actualizarPacienteDto.Telefono.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Email))
                    paciente.Email = actualizarPacienteDto.Email.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Antecedentes))
                    paciente.Antecedentes = actualizarPacienteDto.Antecedentes.Trim();
                
                if (!string.IsNullOrWhiteSpace(actualizarPacienteDto.Medicacion))
                    paciente.Medicacion = actualizarPacienteDto.Medicacion.Trim();

                // Actualizar campos opcionales
                if (actualizarPacienteDto.FechaNacimiento.HasValue)
                    paciente.FechaNacimiento = actualizarPacienteDto.FechaNacimiento.Value;
                
                if (actualizarPacienteDto.Peso.HasValue)
                    paciente.Peso = actualizarPacienteDto.Peso.Value;
                
                if (actualizarPacienteDto.Altura.HasValue)
                    paciente.Altura = actualizarPacienteDto.Altura.Value;
                
                if (actualizarPacienteDto.Particular.HasValue)
                    paciente.Particular = actualizarPacienteDto.Particular.Value;

                // Guardar cambios
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("[API] Paciente {PatientId} actualizado exitosamente", id);
                
                return Ok(new { mensaje = "Paciente actualizado exitosamente" });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "[API] Error de base de datos al actualizar paciente {PatientId}", id);
                return StatusCode(500, new { 
                    mensaje = "Error de base de datos al actualizar el paciente",
                    error = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error inesperado al actualizar paciente {PatientId}", id);
                return StatusCode(500, new { 
                    mensaje = "Error interno del servidor al actualizar el paciente",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Helper para deserializar archivos desde JSON
        /// </summary>
        private List<ArchivoConsultaDto>? DeserializarArchivos(string? archivosJson)
        {
            if (string.IsNullOrEmpty(archivosJson))
                return null;

            try
            {
                var archivos = JsonSerializer.Deserialize<List<ArchivoConsulta>>(archivosJson);
                if (archivos == null)
                    return null;

                return archivos.Select(a => new ArchivoConsultaDto
                {
                    NombreOriginal = a.NombreOriginal,
                    NombreArchivo = a.NombreArchivo,
                    Extension = a.Extension,
                    TipoMime = a.TipoMime,
                    TamañoBytes = a.TamañoBytes,
                    FechaSubida = a.FechaSubida,
                    RutaArchivo = a.RutaArchivo,
                    UrlDescarga = $"/api/pacientes/archivos/{a.NombreArchivo}"
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al deserializar archivos JSON");
                return null;
            }
        }

        /// <summary>
        /// Endpoint para subir archivos adjuntos
        /// </summary>
        [HttpPost("archivos/subir")]
        public async Task<ActionResult<ArchivoConsultaDto>> SubirArchivo(IFormFile archivo)
        {
            try
            {
                if (archivo == null || archivo.Length == 0)
                {
                    _logger.LogWarning("[API] No se recibió archivo o está vacío");
                    return BadRequest(new { mensaje = "No se recibió archivo o está vacío" });
                }

                // Validar tamaño del archivo (10MB máximo)
                const long maxFileSize = 10 * 1024 * 1024; // 10MB
                if (archivo.Length > maxFileSize)
                {
                    _logger.LogWarning("[API] Archivo demasiado grande: {Tamaño} bytes", archivo.Length);
                    return BadRequest(new { mensaje = "El archivo es demasiado grande. Máximo 10MB" });
                }

                // Validar extensión
                var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".doc", ".docx", ".txt" };
                var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    _logger.LogWarning("[API] Extensión no permitida: {Extension}", extension);
                    return BadRequest(new { mensaje = "Tipo de archivo no permitido" });
                }

                // Crear directorio de uploads si no existe
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Generar nombre único para el archivo
                var nombreArchivo = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsPath, nombreArchivo);

                // Guardar archivo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await archivo.CopyToAsync(stream);
                }

                // Crear DTO del archivo
                var archivoDto = new ArchivoConsultaDto
                {
                    NombreOriginal = archivo.FileName,
                    NombreArchivo = nombreArchivo,
                    Extension = extension,
                    TipoMime = archivo.ContentType,
                    TamañoBytes = archivo.Length,
                    FechaSubida = DateTime.Now,
                    RutaArchivo = filePath,
                    UrlDescarga = $"/api/pacientes/archivos/{nombreArchivo}"
                };

                _logger.LogInformation("[API] Archivo subido exitosamente: {NombreOriginal} -> {NombreArchivo}", 
                    archivo.FileName, nombreArchivo);

                return Ok(archivoDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al subir archivo");
                return StatusCode(500, new { mensaje = "Error interno al subir el archivo" });
            }
        }

        /// <summary>
        /// Endpoint para descargar archivos adjuntos
        /// </summary>
        [HttpGet("archivos/{nombreArchivo}")]
        public IActionResult DescargarArchivo(string nombreArchivo)
        {
            try
            {
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                var filePath = Path.Combine(uploadsPath, nombreArchivo);

                if (!System.IO.File.Exists(filePath))
                {
                    _logger.LogWarning("[API] Archivo no encontrado: {NombreArchivo}", nombreArchivo);
                    return NotFound(new { mensaje = "Archivo no encontrado" });
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = GetContentType(nombreArchivo);

                _logger.LogInformation("[API] Archivo descargado: {NombreArchivo}", nombreArchivo);
                return File(fileBytes, contentType, nombreArchivo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al descargar archivo: {NombreArchivo}", nombreArchivo);
                return StatusCode(500, new { mensaje = "Error al descargar el archivo" });
            }
        }

        /// <summary>
        /// Helper para obtener el tipo de contenido MIME
        /// </summary>
        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".txt" => "text/plain",
                _ => "application/octet-stream"
            };
        }

        /// <summary>
        /// Endpoint de prueba para verificar el método POST.
        /// </summary>
        [HttpPost("test-post")]
        public IActionResult TestPost()
        {
            return Ok(new { mensaje = "POST funciona correctamente" });
        }

        /// <summary>
        /// Endpoint de prueba para verificar la conectividad de la base de datos.
        /// </summary>
        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabaseConnection()
        {
            try
            {
                _logger.LogInformation("[API] Probando conexión a la base de datos...");
                
                if (await _context.Database.CanConnectAsync())
                {
                    var pacienteCount = await _context.Pacientes.CountAsync();
                    var consultaCount = await _context.Consultas.CountAsync();
                    
                    _logger.LogInformation("[API] Conexión exitosa. Pacientes: {PacienteCount}, Consultas: {ConsultaCount}", 
                        pacienteCount, consultaCount);
                    
                    return Ok(new { 
                        mensaje = "Conexión a la base de datos exitosa",
                        pacientes = pacienteCount,
                        consultas = consultaCount,
                        timestamp = DateTime.UtcNow
                    });
                }
                else
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "No se puede conectar a la base de datos");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al probar conexión a la base de datos");
                return StatusCode(500, $"Error al probar conexión: {ex.Message}");
            }
        }
    }

    // ===== DTOs para evitar ciclos de navegación =====
    
    /// <summary>
    /// DTO para paciente sin ciclos de navegación
    /// </summary>
    public class PacienteDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = "";
        public string Apellido { get; set; } = "";
        public string? DNI { get; set; }
        public string? NumeroAfiliado { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Telefono { get; set; }
        public string? ObraSocial { get; set; }
        public bool Particular { get; set; }
        public decimal? Peso { get; set; }
        public int? Altura { get; set; }
        public string? Email { get; set; }
        public string? Antecedentes { get; set; }
        public string? Medicacion { get; set; }
        public List<ConsultaDto>? Consultas { get; set; }
    }

    /// <summary>
    /// DTO para consulta sin ciclos de navegación
    /// </summary>
    public class ConsultaDto
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public string? Motivo { get; set; }
        public string? Recetar { get; set; }
        public string? Ome { get; set; }
        public string? Notas { get; set; }
        public List<ArchivoConsultaDto>? Archivos { get; set; }
        
        // Valores de laboratorio
        public double? GR { get; set; }
        public double? HTO { get; set; }
        public double? HB { get; set; }
        public double? GB { get; set; }
        public double? PLAQ { get; set; }
        public double? GLUC { get; set; }
        public double? UREA { get; set; }
        public double? CR { get; set; }
        public double? GOT { get; set; }
        public double? GPT { get; set; }
        public double? CT { get; set; }
        public double? TG { get; set; }
        public double? VITD { get; set; }
        public double? FAL { get; set; }
        public double? COL { get; set; }
        public double? B12 { get; set; }
        public double? TSH { get; set; }
        public string? ORINA { get; set; }
        public double? URICO { get; set; }
    }

    /// <summary>
    /// DTO para archivos de consulta
    /// </summary>
    public class ArchivoConsultaDto
    {
        public string NombreOriginal { get; set; } = "";
        public string NombreArchivo { get; set; } = "";
        public string Extension { get; set; } = "";
        public string TipoMime { get; set; } = "";
        public long TamañoBytes { get; set; }
        public DateTime FechaSubida { get; set; }
        public string RutaArchivo { get; set; } = "";
        public string UrlDescarga { get; set; } = "";
    }

    /// <summary>
    /// DTO para crear una nueva consulta
    /// </summary>
    public class CrearConsultaDto
    {
        public DateTime? Fecha { get; set; }
        public string Motivo { get; set; } = "";
        public string? Recetar { get; set; }
        public string? Ome { get; set; }
        public string? Notas { get; set; }
        
        // Valores de laboratorio
        public double? GR { get; set; }
        public double? HTO { get; set; }
        public double? HB { get; set; }
        public double? GB { get; set; }
        public double? PLAQ { get; set; }
        public double? GLUC { get; set; }
        public double? UREA { get; set; }
        public double? CR { get; set; }
        public double? GOT { get; set; }
        public double? GPT { get; set; }
        public double? CT { get; set; }
        public double? TG { get; set; }
        public double? VITD { get; set; }
        public double? FAL { get; set; }
        public double? COL { get; set; }
        public double? B12 { get; set; }
        public double? TSH { get; set; }
        public string? ORINA { get; set; }
        public double? URICO { get; set; }
        
        // Archivos adjuntos
        public List<ArchivoConsultaDto>? Archivos { get; set; }
    }

    /// <summary>
    /// DTO para crear un nuevo paciente
    /// </summary>
    public class CrearPacienteDto
    {
        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = "";
        
        [JsonPropertyName("apellido")]
        public string Apellido { get; set; } = "";
        
        [JsonPropertyName("dni")]
        public string DNI { get; set; } = "";
        
        [JsonPropertyName("numeroAfiliado")]
        public string? NumeroAfiliado { get; set; }
        
        [JsonPropertyName("fechaNacimiento")]
        public DateTime? FechaNacimiento { get; set; }
        
        [JsonPropertyName("telefono")]
        public string? Telefono { get; set; }
        
        [JsonPropertyName("obraSocial")]
        public string? ObraSocial { get; set; }
        
        [JsonPropertyName("particular")]
        public bool Particular { get; set; }
        
        [JsonPropertyName("peso")]
        public decimal? Peso { get; set; }
        
        [JsonPropertyName("altura")]
        public int? Altura { get; set; }
        
        [JsonPropertyName("email")]
        public string? Email { get; set; }
        
        [JsonPropertyName("antecedentes")]
        public string? Antecedentes { get; set; }
        
        [JsonPropertyName("medicacion")]
        public string? Medicacion { get; set; }
    }

    /// <summary>
    /// DTO para actualizar un paciente existente
    /// </summary>
    public class ActualizarPacienteDto
    {
        [JsonPropertyName("nombre")]
        public string? Nombre { get; set; }
        
        [JsonPropertyName("apellido")]
        public string? Apellido { get; set; }
        
        [JsonPropertyName("dni")]
        public string? DNI { get; set; }
        
        [JsonPropertyName("numeroAfiliado")]
        public string? NumeroAfiliado { get; set; }
        
        [JsonPropertyName("fechaNacimiento")]
        public DateTime? FechaNacimiento { get; set; }
        
        [JsonPropertyName("telefono")]
        public string? Telefono { get; set; }
        
        [JsonPropertyName("obraSocial")]
        public string? ObraSocial { get; set; }
        
        [JsonPropertyName("particular")]
        public bool? Particular { get; set; }
        
        [JsonPropertyName("peso")]
        public decimal? Peso { get; set; }
        
        [JsonPropertyName("altura")]
        public int? Altura { get; set; }
        
        [JsonPropertyName("email")]
        public string? Email { get; set; }
        
        [JsonPropertyName("antecedentes")]
        public string? Antecedentes { get; set; }
        
        [JsonPropertyName("medicacion")]
        public string? Medicacion { get; set; }
    }
}
