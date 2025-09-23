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
        /// Obtiene todos los pacientes con información de notificaciones pendientes.
        /// </summary>
        [HttpGet("con-notificaciones")]
        public async Task<ActionResult<IEnumerable<PacienteConNotificacionesDto>>> ObtenerPacientesConNotificaciones()
        {
            try
            {
                _logger.LogInformation("[API] Solicitando pacientes con notificaciones");
                
                // Verificar conexión a la base de datos
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }

                // Obtener pacientes con información de notificaciones en una sola consulta
                var pacientesConNotificaciones = await _context.Pacientes
                    .Select(p => new PacienteConNotificacionesDto
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
                        TieneNotificaciones = p.Consultas.Any(c => 
                            (c.Recetar != null && c.Recetar.Trim() != "" && !c.RecetarRevisado) ||
                            (c.Ome != null && c.Ome.Trim() != "" && !c.OmeRevisado)
                        ),
                        TieneRecetarPendiente = p.Consultas.Any(c => 
                            c.Recetar != null && c.Recetar.Trim() != "" && !c.RecetarRevisado
                        ),
                        TieneOmePendiente = p.Consultas.Any(c => 
                            c.Ome != null && c.Ome.Trim() != "" && !c.OmeRevisado
                        )
                    })
                    .ToListAsync();

                _logger.LogInformation($"[API] {pacientesConNotificaciones.Count} pacientes con notificaciones obtenidos exitosamente");
                return Ok(pacientesConNotificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al obtener pacientes con notificaciones");
                return StatusCode(500, $"Error interno al obtener pacientes con notificaciones: {ex.Message}");
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
                    RecetarRevisado = c.RecetarRevisado,
                    OmeRevisado = c.OmeRevisado,
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
                    VFS = c.VFS,
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
                    URICO = c.URICO,
                    ValoresNoIncluidos = c.ValoresNoIncluidos,
                    FechaLaboratorio = c.FechaLaboratorio,
                    CamposResaltados = c.CamposResaltados != null ? JsonSerializer.Deserialize<List<string>>(c.CamposResaltados) : null
                }).ToList();
                
                // Logging detallado de cada consulta para debug
                foreach (var consulta in consultasDto)
                {
                    _logger.LogInformation("[API] Consulta {ConsultaId}: Fecha={Fecha}, Motivo={Motivo}, Archivos={ArchivosCount}", 
                        consulta.Id, consulta.Fecha, consulta.Motivo, consulta.Archivos?.Count ?? 0);
                    
                    // Debug específico para valores de laboratorio
                    _logger.LogInformation("[API] Laboratorio - GR={GR}, HTO={HTO}, HB={HB}, GB={GB}, PLAQ={PLAQ}, GLUC={GLUC}, UREA={UREA}, CR={CR}, VFS={VFS}", 
                        consulta.GR, consulta.HTO, consulta.HB, consulta.GB, consulta.PLAQ, consulta.GLUC, consulta.UREA, consulta.CR, consulta.VFS);
                    _logger.LogInformation("[API] Laboratorio - GOT={GOT}, GPT={GPT}, CT={CT}, TG={TG}, VITD={VITD}, FAL={FAL}, COL={COL}, B12={B12}", 
                        consulta.GOT, consulta.GPT, consulta.CT, consulta.TG, consulta.VITD, consulta.FAL, consulta.COL, consulta.B12);
                    _logger.LogInformation("[API] Laboratorio - TSH={TSH}, URICO={URICO}, ORINA={ORINA}, ValoresNoIncluidos={ValoresNoIncluidos}", 
                        consulta.TSH, consulta.URICO, consulta.ORINA, consulta.ValoresNoIncluidos);
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
            _logger.LogInformation("[API] Laboratorio recibido - GR={GR}, HTO={HTO}, HB={HB}, GB={GB}, PLAQ={PLAQ}, GLUC={GLUC}, UREA={UREA}, CR={CR}, VFS={VFS}", 
                crearConsultaDto.GR, crearConsultaDto.HTO, crearConsultaDto.HB, crearConsultaDto.GB, 
                crearConsultaDto.PLAQ, crearConsultaDto.GLUC, crearConsultaDto.UREA, crearConsultaDto.CR, crearConsultaDto.VFS);
            _logger.LogInformation("[API] Laboratorio recibido - GOT={GOT}, GPT={GPT}, CT={CT}, TG={TG}, VITD={VITD}, FAL={FAL}, COL={COL}, B12={B12}", 
                crearConsultaDto.GOT, crearConsultaDto.GPT, crearConsultaDto.CT, crearConsultaDto.TG, 
                crearConsultaDto.VITD, crearConsultaDto.FAL, crearConsultaDto.COL, crearConsultaDto.B12);
            _logger.LogInformation("[API] Laboratorio recibido - TSH={TSH}, URICO={URICO}, ORINA={ORINA}, ValoresNoIncluidos={ValoresNoIncluidos}", 
                crearConsultaDto.TSH, crearConsultaDto.URICO, crearConsultaDto.ORINA, crearConsultaDto.ValoresNoIncluidos);
            
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
                VFS = crearConsultaDto.VFS,
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
                URICO = crearConsultaDto.URICO,
                ValoresNoIncluidos = crearConsultaDto.ValoresNoIncluidos?.Trim(),
                FechaLaboratorio = crearConsultaDto.FechaLaboratorio,
                CamposResaltados = crearConsultaDto.CamposResaltados != null ? JsonSerializer.Serialize(crearConsultaDto.CamposResaltados) : null
            };

            // Agregar a la base de datos
            _context.Consultas.Add(nuevaConsulta);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("[API] Consulta creada exitosamente con ID: {ConsultaId}", nuevaConsulta.Id);
            
            // Debug: Verificar que los valores se guardaron correctamente
            _logger.LogInformation("[API] Verificación - Laboratorio guardado - GR={GR}, HTO={HTO}, HB={HB}, GB={GB}, PLAQ={PLAQ}, GLUC={GLUC}, UREA={UREA}, CR={CR}, VFS={VFS}", 
                nuevaConsulta.GR, nuevaConsulta.HTO, nuevaConsulta.HB, nuevaConsulta.GB, 
                nuevaConsulta.PLAQ, nuevaConsulta.GLUC, nuevaConsulta.UREA, nuevaConsulta.CR, nuevaConsulta.VFS);
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
                RecetarRevisado = nuevaConsulta.RecetarRevisado,
                OmeRevisado = nuevaConsulta.OmeRevisado,
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
                VFS = nuevaConsulta.VFS,
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
                URICO = nuevaConsulta.URICO,
                ValoresNoIncluidos = nuevaConsulta.ValoresNoIncluidos,
                FechaLaboratorio = nuevaConsulta.FechaLaboratorio,
                CamposResaltados = nuevaConsulta.CamposResaltados != null ? JsonSerializer.Deserialize<List<string>>(nuevaConsulta.CamposResaltados) : null
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
            consulta.ValoresNoIncluidos = actualizarConsultaDto.ValoresNoIncluidos?.Trim();

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
                URICO = consulta.URICO,
                ValoresNoIncluidos = consulta.ValoresNoIncluidos
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
                _logger.LogInformation("[API] Datos recibidos - FechaNacimiento: {FechaNacimiento}, Email: {Email}, Telefono: {Telefono}", 
                    actualizarPacienteDto.FechaNacimiento, actualizarPacienteDto.Email, actualizarPacienteDto.Telefono);
                
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
                paciente.FechaNacimiento = actualizarPacienteDto.FechaNacimiento;
                _logger.LogInformation("[API] FechaNacimiento actualizada a: {FechaNacimiento}", paciente.FechaNacimiento);
                
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
        /// Genera 20 pacientes de demostración con datos realistas pero ficticios
        /// </summary>
        private List<Paciente> GenerarPacientesDemo()
        {
            var random = new Random();
            var pacientes = new List<Paciente>();
            
            // Datos de pacientes ficticios pero realistas
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

            // Motivos de consulta comunes
            var motivosConsulta = new[]
            {
                "Control de presión arterial",
                "Control de diabetes",
                "Dolor de cabeza",
                "Control de colesterol",
                "Revisión general",
                "Dolor abdominal",
                "Control de medicación",
                "Síntomas gripales",
                "Control de peso",
                "Dolor de espalda",
                "Control de tiroides",
                "Revisión de análisis",
                "Consulta por ansiedad",
                "Control de hipertensión",
                "Dolor articular"
            };

            // Medicaciones comunes
            var medicaciones = new[]
            {
                "Metformina 850mg x 60 comp",
                "Losartan 50mg x 30 comp",
                "Atorvastatina 20mg x 30 comp",
                "Omeprazol 20mg x 30 comp",
                "AAS 100mg x 50 comp",
                "Levotiroxina 50mcg x 30 comp",
                "Amlodipina 5mg x 30 comp",
                "Clonazepam 0.5mg x 30 comp",
                "Paracetamol 500mg x 20 comp",
                "Ibuprofeno 400mg x 30 comp"
            };

            // Antecedentes comunes
            var antecedentes = new[]
            {
                "Hipertensión arterial",
                "Diabetes tipo 2",
                "Dislipidemia",
                "Hipotiroidismo",
                "Artrosis",
                "Gastritis",
                "Ansiedad",
                "Depresión",
                "Asma",
                "Migraña"
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

                // Generar 2-5 consultas por paciente
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
                        // Valores de laboratorio aleatorios pero realistas
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

        /// <summary>
        /// Genera datos de demostración con 20 pacientes genéricos
        /// </summary>
        [HttpPost("generar-datos-demo")]
        public async Task<ActionResult> GenerarDatosDemo()
        {
            try
            {
                _logger.LogInformation("[API] Generando datos de demostración...");
                
                // Verificar si ya existen pacientes de demo
                var pacientesDemoExistentes = await _context.Pacientes
                    .Where(p => p.Nombre.Contains("DEMO") || p.Apellido.Contains("DEMO"))
                    .CountAsync();
                
                if (pacientesDemoExistentes > 0)
                {
                    _logger.LogWarning("[API] Ya existen pacientes de demostración");
                    return BadRequest(new { mensaje = "Ya existen pacientes de demostración. Use el endpoint de limpiar datos demo primero." });
                }

                var pacientesDemo = GenerarPacientesDemo();
                
                foreach (var paciente in pacientesDemo)
                {
                    _context.Pacientes.Add(paciente);
                }
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("[API] {Count} pacientes de demostración creados exitosamente", pacientesDemo.Count);
                
                return Ok(new { 
                    mensaje = "Datos de demostración generados exitosamente",
                    pacientesCreados = pacientesDemo.Count,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al generar datos de demostración");
                return StatusCode(500, new { 
                    mensaje = "Error interno del servidor al generar datos de demostración",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Limpia todos los datos de demostración
        /// </summary>
        [HttpDelete("limpiar-datos-demo")]
        public async Task<ActionResult> LimpiarDatosDemo()
        {
            try
            {
                _logger.LogInformation("[API] Limpiando datos de demostración...");
                
                // Buscar pacientes de demo
                var pacientesDemo = await _context.Pacientes
                    .Where(p => p.Nombre.Contains("DEMO") || p.Apellido.Contains("DEMO"))
                    .ToListAsync();
                
                if (!pacientesDemo.Any())
                {
                    _logger.LogWarning("[API] No se encontraron pacientes de demostración para eliminar");
                    return NotFound(new { mensaje = "No se encontraron pacientes de demostración" });
                }

                // Eliminar consultas asociadas primero
                var consultasDemo = await _context.Consultas
                    .Where(c => pacientesDemo.Select(p => p.Id).Contains(c.PacienteId))
                    .ToListAsync();
                
                _context.Consultas.RemoveRange(consultasDemo);
                
                // Eliminar pacientes de demo
                _context.Pacientes.RemoveRange(pacientesDemo);
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("[API] {Count} pacientes de demostración eliminados exitosamente", pacientesDemo.Count);
                
                return Ok(new { 
                    mensaje = "Datos de demostración eliminados exitosamente",
                    pacientesEliminados = pacientesDemo.Count,
                    consultasEliminadas = consultasDemo.Count,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al limpiar datos de demostración");
                return StatusCode(500, new { 
                    mensaje = "Error interno del servidor al limpiar datos de demostración",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Marca como revisado el campo Recetar u Ome de una consulta específica
        /// </summary>
        [HttpPut("{pacienteId}/consultas/{consultaId}/marcar-revisado")]
        public async Task<ActionResult> MarcarComoRevisado(int pacienteId, int consultaId, [FromBody] MarcarRevisadoDto dto)
        {
            try
            {
                _logger.LogInformation("[API] Marcando como revisado - Paciente: {PacienteId}, Consulta: {ConsultaId}, Campo: {Campo}", 
                    pacienteId, consultaId, dto.Campo);

                // Verificar que la consulta existe y pertenece al paciente
                var consulta = await _context.Consultas
                    .FirstOrDefaultAsync(c => c.Id == consultaId && c.PacienteId == pacienteId);

                if (consulta == null)
                {
                    _logger.LogWarning("[API] Consulta {ConsultaId} no encontrada para paciente {PacienteId}", consultaId, pacienteId);
                    return NotFound(new { mensaje = "Consulta no encontrada" });
                }

                // Actualizar el campo correspondiente
                if (dto.Campo.ToLower() == "recetar")
                {
                    consulta.RecetarRevisado = true;
                    _logger.LogInformation("[API] Campo Recetar marcado como revisado para consulta {ConsultaId}", consultaId);
                }
                else if (dto.Campo.ToLower() == "ome")
                {
                    consulta.OmeRevisado = true;
                    _logger.LogInformation("[API] Campo Ome marcado como revisado para consulta {ConsultaId}", consultaId);
                }
                else
                {
                    _logger.LogWarning("[API] Campo inválido: {Campo}", dto.Campo);
                    return BadRequest(new { mensaje = "Campo debe ser 'recetar' u 'ome'" });
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("[API] Consulta {ConsultaId} actualizada exitosamente", consultaId);

                return Ok(new { mensaje = "Campo marcado como revisado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al marcar como revisado - Paciente: {PacienteId}, Consulta: {ConsultaId}", 
                    pacienteId, consultaId);
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
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
        public bool RecetarRevisado { get; set; }
        public bool OmeRevisado { get; set; }
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
        public double? VFS { get; set; }
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
        public string? ValoresNoIncluidos { get; set; }
        public DateTime? FechaLaboratorio { get; set; }
        public List<string>? CamposResaltados { get; set; }
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
        public double? VFS { get; set; }
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
        public string? ValoresNoIncluidos { get; set; }
        
        // Fecha específica del laboratorio
        public DateTime? FechaLaboratorio { get; set; }
        
        // Campos resaltados (valores fuera de rango)
        public List<string>? CamposResaltados { get; set; }
        
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

    /// <summary>
    /// DTO para marcar como revisado un campo de consulta
    /// </summary>
    public class MarcarRevisadoDto
    {
        [JsonPropertyName("campo")]
        public string Campo { get; set; } = "";
    }

    /// <summary>
    /// DTO para paciente con información de notificaciones
    /// </summary>
    public class PacienteConNotificacionesDto
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
        public bool TieneNotificaciones { get; set; }
        public bool TieneRecetarPendiente { get; set; }
        public bool TieneOmePendiente { get; set; }
    }
}
