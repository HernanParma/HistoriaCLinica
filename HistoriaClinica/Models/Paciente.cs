using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace HistoriaClinica.Models
{
    public class Paciente
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string DNI { get; set; }

        public string? NumeroAfiliado { get; set; }

        [Required]
        public string Nombre { get; set; }

        [Required]
        public string Apellido { get; set; }

        public string? Email { get; set; }

        public string? Telefono { get; set; }

        public string? ObraSocial { get; set; }

        [DataType(DataType.Date)]
        public DateTime? FechaNacimiento { get; set; }

        [NotMapped]
        public int? Edad 
        { 
            get 
            {
                if (FechaNacimiento.HasValue)
                {
                    var today = DateTime.Today;
                    var age = today.Year - FechaNacimiento.Value.Year;
                    if (FechaNacimiento.Value.Date > today.AddYears(-age)) age--;
                    return age;
                }
                return null;
            }
        }

        public bool Particular { get; set; } = false;

        public decimal? Peso { get; set; } // Peso en kilogramos
        public int? Altura { get; set; } // Altura en centímetros

        [Column(TypeName = "nvarchar(MAX)")]
        public string? Antecedentes { get; set; }

        [Column(TypeName = "nvarchar(MAX)")]
        public string? Medicacion { get; set; }

        // Doctor de Cabecera
        public string? DoctorCabecera { get; set; }

        // Relación con Usuario
        public int? UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        public List<Consulta> Consultas { get; set; } = new List<Consulta>();
    }
}
