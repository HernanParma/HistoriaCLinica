using HistoriaClinica.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HistoriaClinica.Helpers;
using HistoriaClinica.Models;

namespace HistoriaClinica.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UsuariosController> _logger;

        public UsuariosController(AppDbContext context, ILogger<UsuariosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Endpoint de prueba para verificar la conexión a la base de datos
        /// </summary>
        [HttpGet("test")]
        public async Task<ActionResult> TestDatabase()
        {
            try
            {
                _logger.LogInformation("Probando conexión a la base de datos...");
                
                // Verificar si la base de datos está accesible
                var canConnect = await _context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    _logger.LogError("No se puede conectar a la base de datos");
                    return StatusCode(500, "No se puede conectar a la base de datos");
                }

                // Contar usuarios existentes
                var userCount = await _context.Usuarios.CountAsync();
                _logger.LogInformation($"Conexión exitosa. Usuarios en la base de datos: {userCount}");

                return Ok(new { 
                    message = "Conexión a la base de datos exitosa", 
                    userCount = userCount,
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al probar la conexión a la base de datos");
                return StatusCode(500, $"Error de conexión: {ex.Message}");
            }
        }

        /// <summary>
        /// Crea un nuevo usuario.
        /// </summary>
        [HttpPost("registrar")]
        public async Task<ActionResult> Registrar([FromBody] Usuario usuario)
        {
            try
            {
                _logger.LogInformation($"Intentando registrar usuario: {usuario.NombreUsuario}");
                
                if (usuario == null)
                {
                    _logger.LogWarning("Usuario recibido es null");
                    return BadRequest("Datos de usuario inválidos.");
                }

                if (string.IsNullOrEmpty(usuario.NombreUsuario) || string.IsNullOrEmpty(usuario.ContrasenaHash))
                {
                    _logger.LogWarning("Nombre de usuario o contraseña vacíos");
                    return BadRequest("Nombre de usuario y contraseña son requeridos.");
                }

                // Verificar si el usuario ya existe
                var usuarioExistente = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.NombreUsuario == usuario.NombreUsuario);
                
                if (usuarioExistente != null)
                {
                    _logger.LogWarning($"Usuario ya existe: {usuario.NombreUsuario}");
                    return BadRequest("El usuario ya existe.");
                }

                // Hashear la contraseña
                usuario.ContrasenaHash = PasswordHelper.Hashear(usuario.ContrasenaHash);
                _logger.LogInformation($"Contraseña hasheada para usuario: {usuario.NombreUsuario}");

                // Agregar el usuario al contexto
                _context.Usuarios.Add(usuario);
                
                // Guardar cambios en la base de datos
                var resultado = await _context.SaveChangesAsync();
                _logger.LogInformation($"Usuario registrado exitosamente. Filas afectadas: {resultado}");
                
                return Ok("Usuario registrado con éxito.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al registrar usuario: {usuario?.NombreUsuario}");
                return StatusCode(500, "Error interno del servidor al registrar usuario.");
            }
        }

        /// <summary>
        /// Login de usuario.
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] Usuario login)
        {
            try
            {
                _logger.LogInformation($"Intentando login para usuario: {login?.NombreUsuario}");
                
                if (login == null)
                {
                    _logger.LogWarning("Datos de login recibidos son null");
                    return BadRequest("Datos de login inválidos.");
                }

                var user = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.NombreUsuario == login.NombreUsuario);

                if (user == null)
                {
                    _logger.LogWarning($"Usuario no encontrado: {login.NombreUsuario}");
                    return Unauthorized("Usuario no encontrado.");
                }

                var hashInput = PasswordHelper.Hashear(login.ContrasenaHash);

                if (user.ContrasenaHash != hashInput)
                {
                    _logger.LogWarning($"Contraseña incorrecta para usuario: {login.NombreUsuario}");
                    return Unauthorized("Contraseña incorrecta.");
                }

                _logger.LogInformation($"Login exitoso para usuario: {login.NombreUsuario}");
                return Ok("Login exitoso.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error en login para usuario: {login?.NombreUsuario}");
                return StatusCode(500, "Error interno del servidor en login.");
            }
        }
    }
}
