using HistoriaClinica.Data;
using HistoriaClinica.DTOs;
using HistoriaClinica.Models;
using HistoriaClinica.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HistoriaClinica.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PacientesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PacientesController> _logger;
        private readonly IPacienteService _pacienteService;
        private readonly IConsultaService _consultaService;
        private readonly IArchivoService _archivoService;
        private readonly IDemoService _demoService;

        public PacientesController(
            AppDbContext context, 
            ILogger<PacientesController> logger,
            IPacienteService pacienteService,
            IConsultaService consultaService,
            IArchivoService archivoService,
            IDemoService demoService)
        {
            _context = context;
            _logger = logger;
            _pacienteService = pacienteService;
            _consultaService = consultaService;
            _archivoService = archivoService;
            _demoService = demoService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Paciente>>> ObtenerTodosLosPacientes()
        {
            try
            {
                _logger.LogInformation("[API] Solicitando todos los pacientes");
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }
                var pacientes = await _pacienteService.ObtenerTodosLosPacientesAsync();
                _logger.LogInformation($"[API] {pacientes.Count()} pacientes obtenidos exitosamente");
                return Ok(pacientes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al obtener pacientes");
                return StatusCode(500, $"Error interno al obtener pacientes: {ex.Message}");
            }
        }

        [HttpGet("con-notificaciones")]
        public async Task<ActionResult<IEnumerable<PacienteConNotificacionesDto>>> ObtenerPacientesConNotificaciones()
        {
            try
            {
                _logger.LogInformation("[API] Solicitando pacientes con notificaciones");
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }
                var pacientesConNotificaciones = await _pacienteService.ObtenerPacientesConNotificacionesAsync();
                _logger.LogInformation($"[API] {pacientesConNotificaciones.Count()} pacientes con notificaciones obtenidos exitosamente");
                return Ok(pacientesConNotificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al obtener pacientes con notificaciones");
                return StatusCode(500, $"Error interno al obtener pacientes con notificaciones: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PacienteDto>> ObtenerPacientePorId(int id)
        {
            try
            {
                _logger.LogInformation("[API] Solicitando paciente con ID: {PatientId}", id);
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }
                var dto = await _pacienteService.ObtenerPacientePorIdAsync(id);
                if (dto is null)
                {
                    _logger.LogWarning("[API] Paciente {PatientId} no encontrado en la base de datos", id);
                    return NotFound($"Paciente con ID {id} no encontrado");
                }
                _logger.LogInformation("[API] Paciente encontrado: {Nombre} {Apellido}", dto.Nombre, dto.Apellido);
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

        [HttpPost]
        public async Task<ActionResult<PacienteDto>> CrearPaciente([FromBody] CrearPacienteDto crearPacienteDto)
        {
            try
            {
                _logger.LogInformation("[API] Creando nuevo paciente: {Nombre} {Apellido}", 
                    crearPacienteDto.Nombre, crearPacienteDto.Apellido);
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }
                var pacienteCreado = await _pacienteService.CrearPacienteAsync(crearPacienteDto);
                return CreatedAtAction(nameof(ObtenerPacientePorId), new { id = pacienteCreado.Id }, pacienteCreado);
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return BadRequest(new { mensaje = argEx.Message });
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

        [HttpGet("{id}/consultas")]
        public async Task<ActionResult> ObtenerConsultasPorPaciente(int id)
        {
            try
            {
                _logger.LogInformation("[API] Consultas solicitadas para paciente {PatientId}", id);
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }
                var consultasDto = await _consultaService.ObtenerConsultasPorPacienteAsync(id);
                _logger.LogInformation("[API] Preparando respuesta JSON...");
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    ReferenceHandler = ReferenceHandler.IgnoreCycles
                };
                _logger.LogInformation("[API] Respuesta enviada exitosamente");
                return new JsonResult(consultasDto, options);
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return NotFound(argEx.Message);
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

    [HttpPost("{pacienteId}/consultas")]
    public async Task<ActionResult<ConsultaDto>> CrearConsulta(int pacienteId, [FromBody] CrearConsultaDto crearConsultaDto)
    {
        try
        {
            _logger.LogInformation("[API] Creando nueva consulta para paciente {PatientId}", pacienteId);
                var consultaCreada = await _consultaService.CrearConsultaAsync(pacienteId, crearConsultaDto);
                return CreatedAtAction(nameof(ObtenerConsultasPorPaciente), new { id = pacienteId }, consultaCreada);
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return BadRequest(new { mensaje = argEx.Message });
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

    [HttpGet("{pacienteId}/consultas/{consultaId}")]
    public async Task<ActionResult<ConsultaDto>> ObtenerConsultaPorId(int pacienteId, int consultaId)
    {
        try
        {
            _logger.LogInformation("[API] Obteniendo consulta {ConsultaId} del paciente {PatientId}", consultaId, pacienteId);
                var consultaDto = await _consultaService.ObtenerConsultaPorIdAsync(pacienteId, consultaId);
            _logger.LogInformation("[API] Consulta {ConsultaId} encontrada exitosamente", consultaId);
            return Ok(consultaDto);
        }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return NotFound(new { mensaje = argEx.Message });
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

    [HttpPut("{pacienteId}/consultas/{consultaId}")]
    public async Task<ActionResult<ConsultaDto>> ActualizarConsulta(int pacienteId, int consultaId, [FromBody] CrearConsultaDto actualizarConsultaDto)
    {
        try
        {
            _logger.LogInformation("[API] Actualizando consulta {ConsultaId} del paciente {PatientId}", consultaId, pacienteId);
                var consultaActualizada = await _consultaService.ActualizarConsultaAsync(pacienteId, consultaId, actualizarConsultaDto);
                return Ok(consultaActualizada);
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return BadRequest(new { mensaje = argEx.Message });
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

    [HttpDelete("{pacienteId}/consultas/{consultaId}")]
    public async Task<IActionResult> EliminarConsulta(int pacienteId, int consultaId)
        {
            try
            {
                _logger.LogInformation("[API] Eliminando consulta {ConsultaId} del paciente {PatientId}", consultaId, pacienteId);
                await _consultaService.EliminarConsultaAsync(pacienteId, consultaId);
                _logger.LogInformation("[API] Consulta {ConsultaId} eliminada exitosamente", consultaId);
                return NoContent();
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return NotFound(new { mensaje = argEx.Message });
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

        [HttpPut("{id}")]
        public async Task<ActionResult<PacienteDto>> ActualizarPacientePut(int id, [FromBody] ActualizarPacienteDto actualizarPacienteDto)
        {
            try
            {
                _logger.LogInformation("[API] Actualizando paciente con ID: {PatientId} (PUT)", id);
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("[API] No se puede conectar a la base de datos");
                    return StatusCode(500, "Error interno: No se puede conectar a la base de datos");
                }
                var pacienteActualizado = await _pacienteService.ActualizarPacienteAsync(id, actualizarPacienteDto);
                return Ok(pacienteActualizado);
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return NotFound(new { mensaje = argEx.Message });
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

        [HttpPost("{id}/actualizar")]
        public async Task<ActionResult> ActualizarPaciente(int id, [FromBody] ActualizarPacienteDto actualizarPacienteDto)
        {
            try
            {
                _logger.LogInformation("[API] Actualizando paciente con ID: {PatientId}", id);
                await _pacienteService.ActualizarPacienteAsync(id, actualizarPacienteDto);
                _logger.LogInformation("[API] Paciente {PatientId} actualizado exitosamente", id);
                return Ok(new { mensaje = "Paciente actualizado exitosamente" });
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return NotFound(new { mensaje = argEx.Message });
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

        [HttpPost("archivos/subir")]
        public async Task<ActionResult<ArchivoConsultaDto>> SubirArchivo(IFormFile archivo)
        {
            try
            {
                var archivoDto = await _archivoService.SubirArchivoAsync(archivo);
                return Ok(archivoDto);
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return BadRequest(new { mensaje = argEx.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al subir archivo");
                return StatusCode(500, new { mensaje = "Error interno al subir el archivo" });
            }
        }

        [HttpGet("archivos/{nombreArchivo}")]
        public async Task<IActionResult> DescargarArchivo(string nombreArchivo)
        {
            try
            {
                return await _archivoService.DescargarArchivoAsync(nombreArchivo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al descargar archivo: {NombreArchivo}", nombreArchivo);
                return StatusCode(500, new { mensaje = "Error al descargar el archivo" });
            }
        }

        [HttpPost("test-post")]
        public IActionResult TestPost()
        {
            return Ok(new { mensaje = "POST funciona correctamente" });
        }

        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabaseConnection()
        {
            try
            {
                _logger.LogInformation("[API] Probando conexión a la base de datos...");
                var result = await _demoService.TestDatabaseConnectionAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al probar conexión a la base de datos");
                return StatusCode(500, $"Error al probar conexión: {ex.Message}");
            }
        }

        [HttpPost("generar-datos-demo")]
        public async Task<ActionResult> GenerarDatosDemo()
        {
            try
            {
                _logger.LogInformation("[API] Generando datos de demostración...");
                var result = await _demoService.GenerarDatosDemoAsync();
                return Ok(result);
            }
            catch (InvalidOperationException invEx)
            {
                _logger.LogWarning("[API] Error de operación: {Error}", invEx.Message);
                return BadRequest(new { mensaje = invEx.Message });
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

        [HttpDelete("limpiar-datos-demo")]
        public async Task<ActionResult> LimpiarDatosDemo()
        {
            try
            {
                _logger.LogInformation("[API] Limpiando datos de demostración...");
                var result = await _demoService.LimpiarDatosDemoAsync();
                return Ok(result);
            }
            catch (InvalidOperationException invEx)
            {
                _logger.LogWarning("[API] Error de operación: {Error}", invEx.Message);
                return NotFound(new { mensaje = invEx.Message });
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

        [HttpPut("{pacienteId}/consultas/{consultaId}/marcar-revisado")]
        public async Task<ActionResult> MarcarComoRevisado(int pacienteId, int consultaId, [FromBody] MarcarRevisadoDto dto)
        {
            try
            {
                _logger.LogInformation("[API] Marcando como revisado - Paciente: {PacienteId}, Consulta: {ConsultaId}, Campo: {Campo}", 
                    pacienteId, consultaId, dto.Campo);
                await _consultaService.MarcarComoRevisadoAsync(pacienteId, consultaId, dto);
                return Ok(new { mensaje = "Campo marcado como revisado exitosamente" });
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning("[API] Error de validación: {Error}", argEx.Message);
                return BadRequest(new { mensaje = argEx.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error al marcar como revisado - Paciente: {PacienteId}, Consulta: {ConsultaId}", 
                    pacienteId, consultaId);
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }
    }
}