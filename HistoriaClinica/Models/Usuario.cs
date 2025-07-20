using System.ComponentModel.DataAnnotations;

namespace HistoriaClinica.Models
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string NombreUsuario { get; set; }

        [Required]
        public string ContrasenaHash { get; set; }
    }
}
