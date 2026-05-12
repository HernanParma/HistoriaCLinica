using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HistoriaClinica.Models;

public class WhatsAppMessage
{
    public int Id { get; set; }

    public int WhatsAppConversationId { get; set; }
    public WhatsAppConversation Conversation { get; set; } = null!;

    public bool Inbound { get; set; }

    [MaxLength(128)]
    public string? MetaMessageId { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? Texto { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? RawPayloadJson { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
