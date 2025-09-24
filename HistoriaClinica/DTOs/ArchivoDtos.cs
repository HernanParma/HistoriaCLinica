namespace HistoriaClinica.DTOs
{
    public class ArchivoConsultaDto
    {
        public string NombreOriginal { get; set; } = "";
        public string NombreArchivo { get; set; } = "";
        public string Extension { get; set; } = "";
        public string TipoMime { get; set; } = "";
        public long TamañoBytes { get; set; }
        public DateTime FechaSubida { get; set; }
        public string RutaArchivo { get; set; } = "";
        public string UrlDescarga { get; set; } = "";
    }
}
