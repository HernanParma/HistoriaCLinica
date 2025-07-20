using HistoriaClinica.Data;
using HistoriaClinica.Models;
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

        public PacientesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene todos los pacientes.
        /// </summary>
        /// <returns>Lista de todos los pacientes</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Paciente>>> ObtenerTodosLosPacientes()
        {
            return await _context.Pacientes.ToListAsync();
        }

        /// <summary>
        /// Crea un nuevo paciente.
        /// </summary>
        /// <param name="paciente">Objeto paciente recibido desde el cuerpo del request</param>
        /// <returns>El paciente creado</returns>
        [HttpPost]
        public async Task<ActionResult<Paciente>> CrearPaciente([FromBody] Paciente paciente)
        {
            _context.Pacientes.Add(paciente);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerPacientePorId), new { id = paciente.Id }, paciente);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> ObtenerPacientePorId(int id)
        {
            var paciente = await _context.Pacientes.Include(p => p.Consultas).FirstOrDefaultAsync(p => p.Id == id);
            if (paciente == null)
                return NotFound();

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                ReferenceHandler = ReferenceHandler.IgnoreCycles
            };
            return new JsonResult(paciente, options);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarPaciente(int id, [FromBody] Paciente pacienteActualizado)
        {
            if (id != pacienteActualizado.Id)
            {
                return BadRequest("El ID del paciente no coincide.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(pacienteActualizado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Pacientes.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarPaciente(int id)
        {
            var paciente = await _context.Pacientes.Include(p => p.Consultas).FirstOrDefaultAsync(p => p.Id == id);
            if (paciente == null)
                return NotFound();

            // Eliminar primero las consultas asociadas (si existen)
            if (paciente.Consultas != null && paciente.Consultas.Count > 0)
            {
                _context.Consultas.RemoveRange(paciente.Consultas);
            }

            _context.Pacientes.Remove(paciente);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        public class ConsultaDto
        {
            public string fecha { get; set; }
            public string motivo { get; set; }
        }

        [HttpPost("{id}/consultas")]
        public async Task<IActionResult> AgregarConsulta(int id, [FromBody] ConsultaDto dto)
        {
            try
            {
                var paciente = await _context.Pacientes.Include(p => p.Consultas).FirstOrDefaultAsync(p => p.Id == id);
                if (paciente == null)
                    return NotFound();

                string fechaStr = dto.fecha;
                string motivo = dto.motivo;
                if (string.IsNullOrWhiteSpace(fechaStr) || string.IsNullOrWhiteSpace(motivo))
                    return BadRequest("Datos de consulta inválidos");

                // Acepta ambos formatos: dd/MM/yyyy y yyyy-MM-dd
                string[] formatos = { "dd/MM/yyyy", "yyyy-MM-dd" };
                if (!System.DateTime.TryParseExact(fechaStr, formatos, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime fecha))
                    return BadRequest("Fecha inválida. Usa el formato dd/MM/yyyy o yyyy-MM-dd");

                // Agregar la nueva consulta
                var consulta = new Consulta
                {
                    Fecha = fecha,
                    Motivo = motivo,
                    Paciente = paciente
                };
                paciente.Consultas.Add(consulta);
                await _context.SaveChangesAsync();

                // Evitar ciclo de serialización devolviendo solo la consulta agregada
                return Ok(new { mensaje = "Consulta agregada correctamente" });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al guardar consulta: " + ex.Message);
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, "Error interno: " + ex.Message);
            }
        }

        [HttpGet("{id}/consultas")]
        public async Task<ActionResult> ObtenerConsultasPorPaciente(int id)
        {
            Console.WriteLine($"[API] Consultas solicitadas para paciente {id}");
            var consultas = await _context.Consultas
                .Where(c => c.PacienteId == id)
                .OrderByDescending(c => c.Fecha)
                .ToListAsync();
            Console.WriteLine($"[API] Consultas encontradas: {consultas.Count}");

            var options = new System.Text.Json.JsonSerializerOptions
            {
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
                ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
            };
            return new JsonResult(consultas, options);
        }
    }
}
