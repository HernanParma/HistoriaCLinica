namespace HistoriaClinica.DTOs;

public class WhatsAppPendientesCountDto
{
    public int Count { get; set; }
}

public class WhatsAppBotRequestListItemDto
{
    public int Id { get; set; }
    public string MetaWaId { get; set; } = "";
    public int? PacienteId { get; set; }
    public string? PacienteNombre { get; set; }
    public string? NombreCompleto { get; set; }
    public string? NumeroAfiliado { get; set; }
    public string? TipoConsulta { get; set; }
    public string? Detalle { get; set; }
    public string Status { get; set; } = "";
    public DateTime CreatedAtUtc { get; set; }
}
