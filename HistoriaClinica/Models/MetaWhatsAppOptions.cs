namespace HistoriaClinica.Models;

public class MetaWhatsAppOptions
{
    public const string SectionName = "MetaWhatsApp";

    /// <summary>Token que configurás en Meta al registrar el webhook.</summary>
    public string VerifyToken { get; set; } = "";

    /// <summary>App Secret de la app de Meta (para validar X-Hub-Signature-256).</summary>
    public string AppSecret { get; set; } = "";

    /// <summary>Token de acceso de larga duración del número de WhatsApp Business.</summary>
    public string AccessToken { get; set; } = "";

    /// <summary>Phone number ID de la API de WhatsApp Cloud.</summary>
    public string PhoneNumberId { get; set; } = "";

    public string GraphApiVersion { get; set; } = "v21.0";
}
