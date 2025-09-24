using System.Text.Json.Serialization;

namespace HistoriaClinica.DTOs
{
    public class ConsultaDto
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public string? Motivo { get; set; }
        public string? Recetar { get; set; }
        public string? Ome { get; set; }
        public bool RecetarRevisado { get; set; }
        public bool OmeRevisado { get; set; }
        public string? Notas { get; set; }
        public List<ArchivoConsultaDto>? Archivos { get; set; }
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
        public DateTime? FechaLaboratorio { get; set; }
        public List<string>? CamposResaltados { get; set; }
    }

    public class CrearConsultaDto
    {
        public DateTime? Fecha { get; set; }
        public string Motivo { get; set; } = "";
        public string? Recetar { get; set; }
        public string? Ome { get; set; }
        public string? Notas { get; set; }
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
        public DateTime? FechaLaboratorio { get; set; }
        public List<string>? CamposResaltados { get; set; }
        public List<ArchivoConsultaDto>? Archivos { get; set; }
    }

    public class MarcarRevisadoDto
    {
        [JsonPropertyName("campo")]
        public string Campo { get; set; } = "";
    }
}
