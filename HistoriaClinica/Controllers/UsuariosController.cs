using HistoriaClinica.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HistoriaClinica.Helpers;
using HistoriaClinica.Models;
using System.Net.Mail;
using System.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;

namespace HistoriaClinica.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UsuariosController> _logger;
        private readonly IConfiguration _configuration;

        public UsuariosController(AppDbContext context, ILogger<UsuariosController> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Endpoint de prueba para verificar la conexión a la base de datos
        /// </summary>
        [HttpGet("test")]
        [Authorize]
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
        public async Task<ActionResult> Registrar([FromBody] RegistroUsuarioRequest request)
        {
            try
            {
                _logger.LogInformation($"Intentando registrar usuario: {request.NombreUsuario}");

                if (request == null)
                {
                    _logger.LogWarning("Request recibido es null");
                    return BadRequest("Datos de usuario inválidos.");
                }

                if (string.IsNullOrEmpty(request.NombreUsuario) || string.IsNullOrEmpty(request.Contrasena))
                {
                    _logger.LogWarning("Nombre de usuario o contraseña vacíos");
                    return BadRequest("Nombre de usuario y contraseña son requeridos.");
                }

                var usuarioExistente = await _context.Usuarios.FirstOrDefaultAsync(u => u.NombreUsuario == request.NombreUsuario);
                if (usuarioExistente != null)
                {
                    _logger.LogWarning($"Nombre de usuario ya existe: {request.NombreUsuario}");
                    return BadRequest("El nombre de usuario ya existe. Intente con otro.");
                }

                var emailFijo = "hernanparma22@gmail.com";
                var usuario = new Usuario
                {
                    NombreUsuario = request.NombreUsuario,
                    Email = emailFijo,
                    Verificado = false,
                    Perfil = "medico", // Por defecto
                    ContrasenaHash = PasswordHelper.Hashear(request.Contrasena)
                };

                var random = new Random();
                var codigo = random.Next(100000, 999999).ToString();
                usuario.CodigoVerificacion = codigo;

                // Hashear la contraseña recibida en texto plano
                // usuario.ContrasenaHash = PasswordHelper.Hashear(request.Contrasena);
                _logger.LogInformation($"Contraseña hasheada para usuario: {request.NombreUsuario}");

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"CÓDIGO DE VERIFICACIÓN PARA {request.NombreUsuario}: {codigo}");
                _logger.LogInformation($"Email de destino: {emailFijo}");

                return Ok(new {
                    message = "Usuario registrado exitosamente. Código de verificación generado.",
                    codigo = codigo,
                    email = emailFijo
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al registrar usuario: {request?.NombreUsuario}");
                return StatusCode(500, "Error interno del servidor al registrar usuario.");
            }
        }

        /// <summary>
        /// Login de usuario.
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest login)
        {
            try
            {
                _logger.LogInformation($"Intentando login para usuario: {login?.NombreUsuario}");

                if (login == null)
                {
                    _logger.LogWarning("Datos de login recibidos son null");
                    return BadRequest("Datos de login inválidos.");
                }

                if (string.IsNullOrEmpty(login.NombreUsuario) || string.IsNullOrEmpty(login.Contrasena))
                {
                    _logger.LogWarning("Nombre de usuario o contraseña vacíos");
                    return BadRequest("Nombre de usuario y contraseña son requeridos.");
                }

                _logger.LogInformation($"Datos recibidos - Usuario: {login.NombreUsuario}, Contraseña: {login.Contrasena}");

                var user = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.NombreUsuario == login.NombreUsuario);

                if (user == null)
                {
                    _logger.LogWarning($"Usuario no encontrado: {login.NombreUsuario}");
                    return Unauthorized("Usuario no encontrado.");
                }

                _logger.LogInformation($"Usuario encontrado - ID: {user.Id}, Verificado: {user.Verificado}, Hash en BD: {user.ContrasenaHash}");

                if (!user.Verificado)
                {
                    _logger.LogWarning($"Usuario no verificado: {login.NombreUsuario}");
                    return Unauthorized("Usuario no verificado. Por favor, verifica tu correo electrónico.");
                }

                // Hashear la contraseña recibida en texto plano
                var hashInput = PasswordHelper.Hashear(login.Contrasena);
                _logger.LogInformation($"Hash generado para login: {hashInput}");

                if (user.ContrasenaHash != hashInput)
                {
                    _logger.LogWarning($"Contraseña incorrecta para usuario: {login.NombreUsuario}");
                    _logger.LogWarning($"Hash en BD: {user.ContrasenaHash}");
                    _logger.LogWarning($"Hash generado: {hashInput}");
                    return Unauthorized("Contraseña incorrecta.");
                }

                _logger.LogInformation($"Login exitoso para usuario: {login.NombreUsuario}");

                // Emitir JWT
                var jwtKey = _configuration["Jwt:Key"] ?? "clave_super_secreta_para_dev";
                _logger.LogInformation($"JWT KEY: {jwtKey}");
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.NombreUsuario),
                    new Claim("userId", user.Id.ToString()),
                    new Claim("perfil", user.Perfil),
                    new Claim(ClaimTypes.Role, user.Perfil)
                };
                var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(8),
                    signingCredentials: creds
                );
                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                return Ok(new {
                    message = "Login exitoso.",
                    token = tokenString,
                    userId = user.Id,
                    username = user.NombreUsuario,
                    email = user.Email,
                    perfil = user.Perfil
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error en login para usuario: {login?.NombreUsuario}");
                // DEVOLVER EL ERROR REAL PARA DEPURACIÓN (quitar en producción)
                return StatusCode(500, $"Error interno del servidor en login: {ex.Message}");
            }
        }

        /// <summary>
        /// Verifica el código enviado al email y activa el usuario
        /// </summary>
        [HttpPost("verificar")]
        public async Task<ActionResult> VerificarCodigo([FromBody] VerificacionRequest request)
        {
            try
            {
                _logger.LogInformation($"Intentando verificar código para usuario: {request.Username}, código: {request.Codigo}");
                
                if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Codigo))
                {
                    return BadRequest(new { 
                        error = "Campos requeridos", 
                        message = "Usuario y código son requeridos.",
                        details = new { 
                            username = request.Username ?? "null", 
                            codigo = request.Codigo ?? "null" 
                        }
                    });
                }
                
                // Buscar usuario por nombre de usuario y código de verificación
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => 
                    u.NombreUsuario == request.Username && 
                    u.CodigoVerificacion == request.Codigo);
                
                if (usuario == null)
                {
                    // Buscar si el usuario existe pero con código diferente
                    var usuarioExistente = await _context.Usuarios.FirstOrDefaultAsync(u => u.NombreUsuario == request.Username);
                    
                    if (usuarioExistente == null)
                    {
                        _logger.LogWarning($"Usuario no encontrado: {request.Username}");
                        return BadRequest(new { 
                            error = "Usuario no encontrado", 
                            message = $"El usuario '{request.Username}' no existe en el sistema.",
                            suggestion = "Verifica que el nombre de usuario sea correcto."
                        });
                    }
                    else
                    {
                        _logger.LogWarning($"Código incorrecto para usuario {request.Username}. Código enviado: {request.Codigo}, Código en BD: {usuarioExistente.CodigoVerificacion}");
                        return BadRequest(new { 
                            error = "Código incorrecto", 
                            message = $"El código '{request.Codigo}' no es correcto para el usuario '{request.Username}'.",
                            suggestion = "Verifica el código que recibiste por email."
                        });
                    }
                }
                
                if (usuario.Verificado)
                {
                    _logger.LogWarning($"Usuario {usuario.NombreUsuario} ya está verificado");
                    return BadRequest(new { 
                        error = "Usuario ya verificado", 
                        message = $"El usuario '{usuario.NombreUsuario}' ya está verificado.",
                        suggestion = "Puedes proceder a iniciar sesión."
                    });
                }
                
                _logger.LogInformation($"Verificando usuario: {usuario.NombreUsuario}");
                usuario.Verificado = true;
                usuario.CodigoVerificacion = null;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Usuario {usuario.NombreUsuario} verificado exitosamente");
                return Ok(new { 
                    success = true,
                    message = $"Usuario '{usuario.NombreUsuario}' verificado correctamente."
                });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Error de base de datos al verificar el código");
                return StatusCode(500, new { 
                    error = "Error de base de datos", 
                    message = "Error al actualizar la base de datos durante la verificación.",
                    details = "Problema con la columna CodigoVerificacion. Contacta al administrador.",
                    suggestion = "Intenta nuevamente en unos minutos."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al verificar el código");
                return StatusCode(500, new { 
                    error = "Error interno", 
                    message = "Error interno del servidor al verificar el código.",
                    details = ex.Message,
                    suggestion = "Intenta nuevamente o contacta al administrador."
                });
            }
        }

        /// <summary>
        /// Solicita un código de verificación para recuperar contraseña
        /// </summary>
        [HttpPost("solicitar-reset")]
        public async Task<ActionResult> SolicitarResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                _logger.LogInformation($"Solicitando reset de contraseña para usuario: {request.NombreUsuario}");

                if (string.IsNullOrEmpty(request.NombreUsuario))
                {
                    return BadRequest("Nombre de usuario es requerido.");
                }

                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.NombreUsuario == request.NombreUsuario);
                if (usuario == null)
                {
                    _logger.LogWarning($"Usuario no encontrado para reset: {request.NombreUsuario}");
                    return BadRequest("Usuario no encontrado. Verifica el nombre de usuario.");
                }

                // Generar nuevo código de verificación
                var random = new Random();
                var codigo = random.Next(100000, 999999).ToString();
                usuario.CodigoVerificacion = codigo;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"CÓDIGO DE VERIFICACIÓN PARA RESET DE {request.NombreUsuario}: {codigo}");
                _logger.LogInformation($"Email de destino: {usuario.Email}");

                return Ok(new {
                    message = "Código de verificación enviado exitosamente.",
                    codigo = codigo,
                    email = usuario.Email
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al solicitar reset de contraseña para usuario: {request?.NombreUsuario}");
                return StatusCode(500, "Error interno del servidor al solicitar reset de contraseña.");
            }
        }

        /// <summary>
        /// Cambia la contraseña usando el código de verificación
        /// </summary>
        [HttpPost("cambiar-contrasena")]
        public async Task<ActionResult> CambiarContrasena([FromBody] ChangePasswordRequest request)
        {
            try
            {
                _logger.LogInformation($"Intentando cambiar contraseña para usuario: {request.NombreUsuario}");

                if (string.IsNullOrEmpty(request.NombreUsuario) || 
                    string.IsNullOrEmpty(request.CodigoVerificacion) || 
                    string.IsNullOrEmpty(request.NuevaContrasena))
                {
                    return BadRequest("Todos los campos son requeridos.");
                }

                if (request.NuevaContrasena.Length < 6)
                {
                    return BadRequest("La nueva contraseña debe tener al menos 6 caracteres.");
                }

                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => 
                    u.NombreUsuario == request.NombreUsuario && 
                    u.CodigoVerificacion == request.CodigoVerificacion);

                if (usuario == null)
                {
                    _logger.LogWarning($"Usuario o código incorrecto para cambio de contraseña: {request.NombreUsuario}");
                    return BadRequest("Usuario no encontrado o código de verificación incorrecto.");
                }

                // Cambiar la contraseña
                usuario.ContrasenaHash = PasswordHelper.Hashear(request.NuevaContrasena);
                usuario.CodigoVerificacion = null; // Limpiar el código usado

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Contraseña cambiada exitosamente para usuario: {request.NombreUsuario}");

                return Ok(new {
                    message = "Contraseña cambiada exitosamente. Puedes iniciar sesión con tu nueva contraseña."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al cambiar contraseña para usuario: {request?.NombreUsuario}");
                return StatusCode(500, "Error interno del servidor al cambiar contraseña.");
            }
        }
    }
}
