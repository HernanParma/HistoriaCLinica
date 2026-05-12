namespace HistoriaClinica.Services.Interfaces;

public interface IWhatsAppBotService
{
    /// <summary>Verificación GET del webhook de Meta.</summary>
    string? VerifyWebhook(string mode, string token, string challenge);

    /// <summary>Valida firma y procesa el cuerpo JSON del webhook.</summary>
    Task ProcessWebhookAsync(string rawBody, string? signature256Header, CancellationToken ct = default);

    Task<int> GetPendientesCountAsync(CancellationToken ct = default);

    Task<IReadOnlyList<HistoriaClinica.DTOs.WhatsAppBotRequestListItemDto>> GetPendientesAsync(int limit, CancellationToken ct = default);

    Task<bool> MarcarLeidoAsync(int requestId, CancellationToken ct = default);
}
