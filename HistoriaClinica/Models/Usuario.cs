using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HistoriaClinica.Models
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string NombreUsuario { get; set; }

        [Required]
        public required string ContrasenaHash { get; set; }

        [Required]
        public required string Email { get; set; }

        public string? CodigoVerificacion { get; set; }

        public bool Verificado { get; set; } = false;

        public string Perfil { get; set; } = "medico"; // Por defecto medico

        [NotMapped]
        public string? Contrasena { get; set; }
    }

    public class RegistroUsuarioRequest
    {
        [Required]
        public required string NombreUsuario { get; set; }

        [Required]
        public required string Contrasena { get; set; }
        // El email no es requerido porque siempre será hernanparma22@gmail.com
        public string? Email { get; set; }
    }

    public class VerificacionRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Codigo { get; set; } = string.Empty;
    }
    public class LoginRequest
    {
        [Required]
        public required string NombreUsuario { get; set; }

        [Required]
        public required string Contrasena { get; set; }
    }

    public class ResetPasswordRequest
    {
        [Required]
        public required string NombreUsuario { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required]
        public required string NombreUsuario { get; set; }

        [Required]
        public required string CodigoVerificacion { get; set; }

        [Required]
        public required string NuevaContrasena { get; set; }
    }
}
