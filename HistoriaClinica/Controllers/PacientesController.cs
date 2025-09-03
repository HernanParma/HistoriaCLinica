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
                                Notas = c.Notas ?? ""
                            }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (dto == null)
                {
                    _logger.LogWarning("[API] Paciente {PatientId} no encontrado en la base de datos", id);
                    return NotFound($"Paciente con ID {id} no encontrado");
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
                
                // Logging detallado de cada consulta para debug
                foreach (var consulta in consultas)
                {
                    _logger.LogInformation("[API] Consulta {ConsultaId}: Fecha={Fecha}, Motivo={Motivo}", 
                        consulta.Id, consulta.Fecha, consulta.Motivo);
                }

                _logger.LogInformation("[API] Preparando respuesta JSON...");
                
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    ReferenceHandler = ReferenceHandler.IgnoreCycles
                };
                
                _logger.LogInformation("[API] Respuesta enviada exitosamente");
                return new JsonResult(consultas, options);
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

            // Crear nueva consulta
            var nuevaConsulta = new Consulta
            {
                PacienteId = pacienteId,
                Fecha = crearConsultaDto.Fecha ?? DateTime.Now,
                Motivo = crearConsultaDto.Motivo.Trim(),
                Recetar = crearConsultaDto.Recetar?.Trim(),
                Ome = crearConsultaDto.Ome?.Trim(),
                Notas = crearConsultaDto.Notas?.Trim(),
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
            
            // Retornar la consulta creada como DTO
            var consultaCreada = new ConsultaDto
            {
                Id = nuevaConsulta.Id,
                Fecha = nuevaConsulta.Fecha,
                Motivo = nuevaConsulta.Motivo,
                Recetar = nuevaConsulta.Recetar,
                Ome = nuevaConsulta.Ome,
                Notas = nuevaConsulta.Notas
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
                Notas = consulta.Notas
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
                Notas = consulta.Notas
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
    }
}
