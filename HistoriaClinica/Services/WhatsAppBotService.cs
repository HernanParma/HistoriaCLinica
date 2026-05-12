using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using HistoriaClinica.Data;
using HistoriaClinica.DTOs;
using HistoriaClinica.Models;
using HistoriaClinica.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HistoriaClinica.Services;

public class WhatsAppBotService : IWhatsAppBotService
{
    private readonly AppDbContext _db;
    private readonly MetaWhatsAppOptions _opt;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WhatsAppBotService> _logger;

    public WhatsAppBotService(
        AppDbContext db,
        IOptions<MetaWhatsAppOptions> opt,
        IHttpClientFactory httpClientFactory,
        ILogger<WhatsAppBotService> logger)
    {
        _db = db;
        _opt = opt.Value;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public string? VerifyWebhook(string mode, string token, string challenge)
    {
        if (mode != "subscribe" || string.IsNullOrEmpty(challenge))
            return null;
        if (string.IsNullOrEmpty(_opt.VerifyToken) || token != _opt.VerifyToken)
            return null;
        return challenge;
    }

    public async Task ProcessWebhookAsync(string rawBody, string? signature256Header, CancellationToken ct = default)
    {
        if (!string.IsNullOrEmpty(_opt.AppSecret))
        {
            if (!ValidateSignature(rawBody, signature256Header))
            {
                _logger.LogWarning("WhatsApp webhook: firma inválida o ausente");
                throw new InvalidOperationException("Invalid signature");
            }
        }
        else
        {
            _logger.LogWarning("MetaWhatsApp:AppSecret vacío; no se valida firma del webhook");
        }

        using var doc = JsonDocument.Parse(rawBody);
        var root = doc.RootElement;
        if (root.TryGetProperty("object", out var objEl) &&
            objEl.GetString() != "whatsapp_business_account")
        {
            _logger.LogInformation("WhatsApp webhook: object distinto, ignorado");
            return;
        }

        if (!root.TryGetProperty("entry", out var entries))
            return;

        foreach (var entry in entries.EnumerateArray())
        {
            if (!entry.TryGetProperty("changes", out var changes))
                continue;
            foreach (var change in changes.EnumerateArray())
            {
                if (!change.TryGetProperty("value", out var value))
                    continue;
                if (!value.TryGetProperty("messages", out var messages))
                    continue;
                foreach (var msg in messages.EnumerateArray())
                    await ProcessSingleMessageAsync(value, msg, rawBody, ct);
            }
        }
    }

    private async Task ProcessSingleMessageAsync(JsonElement value, JsonElement msg, string rawBody, CancellationToken ct)
    {
        var from = msg.TryGetProperty("from", out var f) ? f.GetString() : null;
        var id = msg.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
        if (string.IsNullOrEmpty(from))
            return;

        var type = msg.TryGetProperty("type", out var t) ? t.GetString() : null;
        string? text = null;
        if (type == "text" && msg.TryGetProperty("text", out var textObj))
            text = textObj.TryGetProperty("body", out var bodyEl) ? bodyEl.GetString() : null;

        if (!string.IsNullOrEmpty(id))
        {
            var exists = await _db.WhatsAppMessages.AnyAsync(m => m.MetaMessageId == id, ct);
            if (exists)
                return;
        }

        var now = DateTime.UtcNow;
        var conv = await _db.WhatsAppConversations
            .FirstOrDefaultAsync(c => c.MetaWaId == from, ct);

        if (conv == null)
        {
            conv = new WhatsAppConversation
            {
                MetaWaId = from,
                Step = 0,
                CreatedAtUtc = now,
                LastActivityAtUtc = now
            };
            _db.WhatsAppConversations.Add(conv);
            await _db.SaveChangesAsync(ct);
        }

        _db.WhatsAppMessages.Add(new WhatsAppMessage
        {
            WhatsAppConversationId = conv.Id,
            Inbound = true,
            MetaMessageId = id,
            Texto = text,
            RawPayloadJson = rawBody.Length > 8000 ? rawBody[..8000] : rawBody,
            CreatedAtUtc = now
        });
        conv.LastActivityAtUtc = now;

        if (string.IsNullOrWhiteSpace(text) && type != "text")
        {
            await _db.SaveChangesAsync(ct);
            return;
        }

        text ??= string.Empty;
        var trimmed = text.Trim();

        await RunConversationStateAsync(conv, trimmed, ct);
        await _db.SaveChangesAsync(ct);
    }

    private async Task RunConversationStateAsync(WhatsAppConversation conv, string userText, CancellationToken ct)
    {
        switch (conv.Step)
        {
            case 0:
                await SendTextAsync(conv.MetaWaId,
                    "Hola, bienvenido/a. Para registrar su consulta necesitamos algunos datos.\n\n" +
                    "Por favor escriba su *nombre completo*.", ct);
                conv.Step = 1;
                break;

            case 1:
                conv.NombreCompleto = userText.Length > 300 ? userText[..300] : userText;
                await SendTextAsync(conv.MetaWaId,
                    "Gracias. Indique su *número de afiliado*. Si no tiene, escriba *NO*.", ct);
                conv.Step = 2;
                break;

            case 2:
                conv.NumeroAfiliado = userText.Equals("NO", StringComparison.OrdinalIgnoreCase)
                    ? null
                    : (userText.Length > 80 ? userText[..80] : userText);
                conv.PacienteId = await TryFindPacienteIdAsync(conv.MetaWaId, conv.NumeroAfiliado, ct);
                await SendTextAsync(conv.MetaWaId,
                    "¿Su consulta es por *medicación u órdenes*?\nResponda *1*.\n\n" +
                    "Si es *otro* tipo de consulta, responda *2*.", ct);
                conv.Step = 3;
                break;

            case 3:
                var t = userText.Trim();
                if (t == "1")
                    conv.TipoConsulta = "MedicacionOrdenes";
                else if (t == "2")
                    conv.TipoConsulta = "Otro";
                else
                {
                    await SendTextAsync(conv.MetaWaId,
                        "No entendí. Responda *1* (medicación/órdenes) o *2* (otro).", ct);
                    return;
                }

                await SendTextAsync(conv.MetaWaId,
                    "Describa brevemente el *motivo o detalle* de su consulta.", ct);
                conv.Step = 4;
                break;

            case 4:
                conv.Detalle = userText;
                _db.WhatsAppBotRequests.Add(new WhatsAppBotRequest
                {
                    WhatsAppConversationId = conv.Id,
                    MetaWaId = conv.MetaWaId,
                    PacienteId = conv.PacienteId,
                    NombreCompleto = conv.NombreCompleto,
                    NumeroAfiliado = conv.NumeroAfiliado,
                    TipoConsulta = conv.TipoConsulta,
                    Detalle = conv.Detalle,
                    Status = "New",
                    CreatedAtUtc = DateTime.UtcNow
                });
                await SendTextAsync(conv.MetaWaId,
                    "Recibimos su solicitud. Nos pondremos en contacto a la brevedad. Gracias.", ct);
                conv.NombreCompleto = null;
                conv.NumeroAfiliado = null;
                conv.TipoConsulta = null;
                conv.Detalle = null;
                conv.Step = 0;
                break;

            default:
                conv.Step = 0;
                goto case 0;
        }
    }

    private async Task<int?> TryFindPacienteIdAsync(string waId, string? numeroAfiliado, CancellationToken ct)
    {
        var waDigits = OnlyDigits(waId);
        var list = await _db.Pacientes.AsNoTracking()
            .Select(p => new { p.Id, p.Telefono, p.NumeroAfiliado })
            .ToListAsync(ct);

        foreach (var p in list)
        {
            var td = OnlyDigits(p.Telefono);
            if (td.Length == 0) continue;
            if (td == waDigits || td.EndsWith(waDigits, StringComparison.Ordinal) || waDigits.EndsWith(td, StringComparison.Ordinal))
                return p.Id;
        }

        if (!string.IsNullOrWhiteSpace(numeroAfiliado))
        {
            var aff = numeroAfiliado.Trim();
            var m = list.FirstOrDefault(p =>
                p.NumeroAfiliado != null &&
                p.NumeroAfiliado.Trim().Equals(aff, StringComparison.OrdinalIgnoreCase));
            if (m != null) return m.Id;
        }

        return null;
    }

    private static string OnlyDigits(string? s) =>
        string.IsNullOrEmpty(s) ? "" : new string(s.Where(char.IsDigit).ToArray());

    private bool ValidateSignature(string body, string? header)
    {
        if (string.IsNullOrEmpty(header) || !header.StartsWith("sha256=", StringComparison.Ordinal))
            return false;
        var expectedHex = header["sha256=".Length..];
        var key = Encoding.UTF8.GetBytes(_opt.AppSecret);
        using var hmac = new HMACSHA256(key);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(body));
        var computed = Convert.ToHexString(hash).ToLowerInvariant();
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computed),
            Encoding.UTF8.GetBytes(expectedHex.ToLowerInvariant()));
    }

    private async Task SendTextAsync(string toWaId, string body, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_opt.AccessToken) || string.IsNullOrEmpty(_opt.PhoneNumberId))
        {
            _logger.LogWarning("WhatsApp: AccessToken o PhoneNumberId no configurados; no se envía respuesta");
            return;
        }

        var client = _httpClientFactory.CreateClient("MetaWhatsApp");
        var url = $"https://graph.facebook.com/{_opt.GraphApiVersion.Trim('/')}/{_opt.PhoneNumberId}/messages";
        using var req = new HttpRequestMessage(HttpMethod.Post, url);
        req.Headers.TryAddWithoutValidation("Authorization", $"Bearer {_opt.AccessToken}");
        var payload = new
        {
            messaging_product = "whatsapp",
            to = toWaId,
            type = "text",
            text = new { body }
        };
        req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var resp = await client.SendAsync(req, ct);
        var respText = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogError("WhatsApp send error {Status}: {Body}", resp.StatusCode, respText);
            return;
        }

        _logger.LogInformation("WhatsApp mensaje enviado a {To}", toWaId);
    }

    public async Task<int> GetPendientesCountAsync(CancellationToken ct = default) =>
        await _db.WhatsAppBotRequests.CountAsync(r => r.Status == "New", ct);

    public async Task<IReadOnlyList<WhatsAppBotRequestListItemDto>> GetPendientesAsync(int limit, CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 200);
        var rows = await _db.WhatsAppBotRequests
            .AsNoTracking()
            .Include(r => r.Paciente)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(limit)
            .ToListAsync(ct);

        return rows.Select(r => new WhatsAppBotRequestListItemDto
        {
            Id = r.Id,
            MetaWaId = r.MetaWaId,
            PacienteId = r.PacienteId,
            PacienteNombre = r.Paciente != null ? $"{r.Paciente.Nombre} {r.Paciente.Apellido}".Trim() : null,
            NombreCompleto = r.NombreCompleto,
            NumeroAfiliado = r.NumeroAfiliado,
            TipoConsulta = r.TipoConsulta,
            Detalle = r.Detalle,
            Status = r.Status,
            CreatedAtUtc = r.CreatedAtUtc
        }).ToList();
    }

    public async Task<bool> MarcarLeidoAsync(int requestId, CancellationToken ct = default)
    {
        var r = await _db.WhatsAppBotRequests.FirstOrDefaultAsync(x => x.Id == requestId, ct);
        if (r == null) return false;
        r.Status = "Read";
        r.LeidoAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
