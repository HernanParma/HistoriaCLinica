using System;

namespace HistoriaClinica.Models
{
    public class ArchivoConsulta
    {
        public string NombreOriginal { get; set; } = string.Empty;
        public string NombreArchivo { get; set; } = string.Empty; // Nombre único en el servidor
        public string Extension { get; set; } = string.Empty;
        public string TipoMime { get; set; } = string.Empty;
        public long TamañoBytes { get; set; }
        public DateTime FechaSubida { get; set; }
        public string RutaArchivo { get; set; } = string.Empty; // Ruta relativa en el servidor
    }
}






















