using HistoriaClinica.DTOs;
using HistoriaClinica.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HistoriaClinica.Controllers;

[ApiController]
[Route("api/whatsapp")]
[Authorize]
public class WhatsAppBotController : ControllerBase
{
    private readonly IWhatsAppBotService _bot;
    private readonly ILogger<WhatsAppBotController> _logger;

    public WhatsAppBotController(IWhatsAppBotService bot, ILogger<WhatsAppBotController> logger)
    {
        _bot = bot;
        _logger = logger;
    }

    [HttpGet("pendientes/count")]
    public async Task<ActionResult<WhatsAppPendientesCountDto>> PendientesCount(CancellationToken ct)
    {
        var count = await _bot.GetPendientesCountAsync(ct);
        return Ok(new WhatsAppPendientesCountDto { Count = count });
    }

    [HttpGet("pendientes")]
    public async Task<ActionResult<IReadOnlyList<WhatsAppBotRequestListItemDto>>> Pendientes(
        [FromQuery] int limit = 80,
        CancellationToken ct = default)
    {
        var list = await _bot.GetPendientesAsync(limit, ct);
        return Ok(list);
    }

    [HttpPost("pendientes/{id:int}/marcar-leido")]
    public async Task<IActionResult> MarcarLeido(int id, CancellationToken ct)
    {
        var ok = await _bot.MarcarLeidoAsync(id, ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}
