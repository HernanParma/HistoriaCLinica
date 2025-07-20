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

        [Required]
        public string NumeroAfiliado { get; set; }

        [Required]
        public string Nombre { get; set; }

        [Required]
        public string Apellido { get; set; }

        public string Email { get; set; }

        public string Telefono { get; set; }

        public string ObraSocial { get; set; }

        [DataType(DataType.Date)]
        public DateTime FechaNacimiento { get; set; }

        public decimal? Peso { get; set; } // Peso en kilogramos
        public int? Altura { get; set; } // Altura en centímetros

        [Column(TypeName = "nvarchar(MAX)")]
        public string Antecedentes { get; set; } = string.Empty;

        [Column(TypeName = "nvarchar(MAX)")]
        public string Medicacion { get; set; } = string.Empty;

        public List<Consulta> Consultas { get; set; } = new List<Consulta>();
    }
}
