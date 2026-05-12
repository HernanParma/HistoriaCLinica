using System.Text;
using HistoriaClinica.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HistoriaClinica.Controllers;

[ApiController]
[Route("api/webhooks/meta/whatsapp")]
public class WhatsAppWebhookController : ControllerBase
{
    private readonly IWhatsAppBotService _bot;
    private readonly ILogger<WhatsAppWebhookController> _logger;

    public WhatsAppWebhookController(IWhatsAppBotService bot, ILogger<WhatsAppWebhookController> logger)
    {
        _bot = bot;
        _logger = logger;
    }

    /// <summary>Verificación del webhook (Meta Cloud API).</summary>
    [HttpGet]
    [AllowAnonymous]
    public IActionResult Verify(
        [FromQuery(Name = "hub.mode")] string? mode,
        [FromQuery(Name = "hub.verify_token")] string? token,
        [FromQuery(Name = "hub.challenge")] string? challenge)
    {
        var result = _bot.VerifyWebhook(mode ?? "", token ?? "", challenge ?? "");
        if (result == null)
        {
            _logger.LogWarning("WhatsApp webhook verify rechazado");
            return Forbid();
        }

        return Content(result, "text/plain", Encoding.UTF8);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Receive(CancellationToken ct)
    {
        Request.EnableBuffering();
        string body;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true))
            body = await reader.ReadToEndAsync();
        Request.Body.Position = 0;

        var sig = Request.Headers["X-Hub-Signature-256"].FirstOrDefault();
        try
        {
            await _bot.ProcessWebhookAsync(body, sig, ct);
        }
        catch (InvalidOperationException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando webhook WhatsApp");
            return StatusCode(500);
        }

        return Ok();
    }
}
