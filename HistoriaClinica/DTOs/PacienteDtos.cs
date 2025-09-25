using System.Text.Json.Serialization;

namespace HistoriaClinica.DTOs
{
    public class PacienteDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = "";
        public string Apellido { get; set; } = "";
        public string? DNI { get; set; }
        public string? NumeroAfiliado { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Telefono { get; set; }
        public string? ObraSocial { get; set; }
        public bool Particular { get; set; }
        public decimal? Peso { get; set; }
        public int? Altura { get; set; }
        public string? Email { get; set; }
        public string? Antecedentes { get; set; }
        public string? Medicacion { get; set; }
        public List<ConsultaDto>? Consultas { get; set; }
    }

    public class CrearPacienteDto
    {
        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = "";
        [JsonPropertyName("apellido")]
        public string Apellido { get; set; } = "";
        [JsonPropertyName("dni")]
        public string DNI { get; set; } = "";
        [JsonPropertyName("numeroAfiliado")]
        public string? NumeroAfiliado { get; set; }
        [JsonPropertyName("fechaNacimiento")]
        public DateTime? FechaNacimiento { get; set; }
        [JsonPropertyName("telefono")]
        public string? Telefono { get; set; }
        [JsonPropertyName("obraSocial")]
        public string? ObraSocial { get; set; }
        [JsonPropertyName("particular")]
        public bool Particular { get; set; }
        [JsonPropertyName("peso")]
        public decimal? Peso { get; set; }
        [JsonPropertyName("altura")]
        public int? Altura { get; set; }
        [JsonPropertyName("email")]
        public string? Email { get; set; }
        [JsonPropertyName("antecedentes")]
        public string? Antecedentes { get; set; }
        [JsonPropertyName("medicacion")]
        public string? Medicacion { get; set; }
    }

    public class ActualizarPacienteDto
    {
        [JsonPropertyName("nombre")]
        public string? Nombre { get; set; }
        [JsonPropertyName("apellido")]
        public string? Apellido { get; set; }
        [JsonPropertyName("dni")]
        public string? DNI { get; set; }
        [JsonPropertyName("numeroAfiliado")]
        public string? NumeroAfiliado { get; set; }
        [JsonPropertyName("fechaNacimiento")]
        public DateTime? FechaNacimiento { get; set; }
        [JsonPropertyName("telefono")]
        public string? Telefono { get; set; }
        [JsonPropertyName("obraSocial")]
        public string? ObraSocial { get; set; }
        [JsonPropertyName("particular")]
        public bool? Particular { get; set; }
        [JsonPropertyName("peso")]
        public decimal? Peso { get; set; }
        [JsonPropertyName("altura")]
        public int? Altura { get; set; }
        [JsonPropertyName("email")]
        public string? Email { get; set; }
        [JsonPropertyName("antecedentes")]
        public string? Antecedentes { get; set; }
        [JsonPropertyName("medicacion")]
        public string? Medicacion { get; set; }
    }

    public class PacienteConNotificacionesDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = "";
        public string Apellido { get; set; } = "";
        public string? DNI { get; set; }
        public string? NumeroAfiliado { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Telefono { get; set; }
        public string? ObraSocial { get; set; }
        public bool Particular { get; set; }
        public decimal? Peso { get; set; }
        public int? Altura { get; set; }
        public string? Email { get; set; }
        public string? Antecedentes { get; set; }
        public string? Medicacion { get; set; }
        public bool TieneNotificaciones { get; set; }
        public bool TieneRecetarPendiente { get; set; }
        public bool TieneOmePendiente { get; set; }
    }
}

