using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HistoriaClinica.Models
{
    public class Consulta
    {
        public int Id { get; set; }
        [Required]
        public DateTime Fecha { get; set; }
        [Required]
        public string Motivo { get; set; } = string.Empty;

        // Laboratorio
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
        public string? Recetar { get; set; }
        public string? Ome { get; set; }

        // Estados de revisión
        public bool RecetarRevisado { get; set; } = false;
        public bool OmeRevisado { get; set; } = false;

        // Notas
        public string? Notas { get; set; }

        // Archivos adjuntos
        public string? ArchivosJson { get; set; } // JSON con información de archivos

        // Fecha específica del laboratorio
        public DateTime? FechaLaboratorio { get; set; }

        // Campos resaltados (valores fuera de rango)
        public string? CamposResaltados { get; set; } // JSON con lista de campos resaltados

        // Relación con Paciente
        public int PacienteId { get; set; }
        public Paciente? Paciente { get; set; }
    }
} 