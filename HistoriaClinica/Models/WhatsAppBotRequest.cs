using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HistoriaClinica.Models;

/// <summary>Solicitud completada por el flujo del bot (visible en panel BOT).</summary>
public class WhatsAppBotRequest
{
    public int Id { get; set; }

    public int WhatsAppConversationId { get; set; }
    public WhatsAppConversation Conversation { get; set; } = null!;

    [Required]
    [MaxLength(32)]
    public string MetaWaId { get; set; } = "";

    public int? PacienteId { get; set; }
    public Paciente? Paciente { get; set; }

    [MaxLength(300)]
    public string? NombreCompleto { get; set; }

    [MaxLength(80)]
    public string? NumeroAfiliado { get; set; }

    [MaxLength(40)]
    public string? TipoConsulta { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? Detalle { get; set; }

    /// <summary>New = pendiente de revisión; Read = visto en UI</summary>
    [MaxLength(20)]
    public string Status { get; set; } = "New";

    public DateTime? LeidoAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
