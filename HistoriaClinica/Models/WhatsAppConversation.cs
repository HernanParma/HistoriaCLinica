using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HistoriaClinica.Models;

/// <summary>Estado de conversación por wa_id (un usuario de WhatsApp).</summary>
public class WhatsAppConversation
{
    public int Id { get; set; }

    [Required]
    [MaxLength(32)]
    public string MetaWaId { get; set; } = "";

    public int? PacienteId { get; set; }
    public Paciente? Paciente { get; set; }

    [MaxLength(300)]
    public string? NombreCompleto { get; set; }

    [MaxLength(80)]
    public string? NumeroAfiliado { get; set; }

    /// <summary>MedicacionOrdenes u Otro</summary>
    [MaxLength(40)]
    public string? TipoConsulta { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? Detalle { get; set; }

    /// <summary>0=inicio, 1=nombre, 2=afiliado, 3=tipo, 4=detalle, 5=esperando nuevo ciclo</summary>
    public int Step { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime LastActivityAtUtc { get; set; }

    public ICollection<WhatsAppMessage> Messages { get; set; } = new List<WhatsAppMessage>();
    public ICollection<WhatsAppBotRequest> BotRequests { get; set; } = new List<WhatsAppBotRequest>();
}
