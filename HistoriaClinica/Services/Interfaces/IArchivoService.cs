using HistoriaClinica.Models;
using HistoriaClinica.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace HistoriaClinica.Services.Interfaces
{
    public interface IArchivoService
    {
        Task<ArchivoConsultaDto> SubirArchivoAsync(IFormFile archivo);
        Task<IActionResult> DescargarArchivoAsync(string nombreArchivo);
        List<ArchivoConsultaDto>? DeserializarArchivos(string? archivosJson);
        string GetContentType(string fileName);
    }
}
