using HistoriaClinica.Data;
using HistoriaClinica.DTOs;
using HistoriaClinica.Models;
using HistoriaClinica.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace HistoriaClinica.Services
{
    public class ArchivoService : IArchivoService
    {
        private readonly ILogger<ArchivoService> _logger;

        public ArchivoService(ILogger<ArchivoService> logger)
        {
            _logger = logger;
        }

        public async Task<ArchivoConsultaDto> SubirArchivoAsync(IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
            {
                throw new ArgumentException("No se recibió archivo o está vacío");
            }

            const long maxFileSize = 10 * 1024 * 1024; // 10MB
            if (archivo.Length > maxFileSize)
            {
                _logger.LogWarning("[SERVICE] Archivo demasiado grande: {Tamaño} bytes", archivo.Length);
                throw new ArgumentException("El archivo es demasiado grande. Máximo 10MB");
            }

            var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".doc", ".docx", ".txt" };
            var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                _logger.LogWarning("[SERVICE] Extensión no permitida: {Extension}", extension);
                throw new ArgumentException("Tipo de archivo no permitido");
            }

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            var nombreArchivo = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsPath, nombreArchivo);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await archivo.CopyToAsync(stream);
            }

            var archivoDto = new ArchivoConsultaDto
            {
                NombreOriginal = archivo.FileName,
                NombreArchivo = nombreArchivo,
                Extension = extension,
                TipoMime = archivo.ContentType,
                TamañoBytes = archivo.Length,
                FechaSubida = DateTime.Now,
                RutaArchivo = filePath,
                UrlDescarga = $"/api/pacientes/archivos/{nombreArchivo}"
            };

            _logger.LogInformation("[SERVICE] Archivo subido exitosamente: {NombreOriginal} -> {NombreArchivo}", 
                archivo.FileName, nombreArchivo);

            return archivoDto;
        }

        public async Task<IActionResult> DescargarArchivoAsync(string nombreArchivo)
        {
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            var filePath = Path.Combine(uploadsPath, nombreArchivo);

            if (!System.IO.File.Exists(filePath))
            {
                _logger.LogWarning("[SERVICE] Archivo no encontrado: {NombreArchivo}", nombreArchivo);
                return new NotFoundObjectResult(new { mensaje = "Archivo no encontrado" });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var contentType = GetContentType(nombreArchivo);

            _logger.LogInformation("[SERVICE] Archivo descargado: {NombreArchivo}", nombreArchivo);
            return new FileContentResult(fileBytes, contentType)
            {
                FileDownloadName = nombreArchivo
            };
        }

        public List<ArchivoConsultaDto>? DeserializarArchivos(string? archivosJson)
        {
            if (string.IsNullOrEmpty(archivosJson))
                return null;

            try
            {
                var archivos = JsonSerializer.Deserialize<List<ArchivoConsulta>>(archivosJson);
                if (archivos == null)
                    return null;

                return archivos.Select(a => new ArchivoConsultaDto
                {
                    NombreOriginal = a.NombreOriginal,
                    NombreArchivo = a.NombreArchivo,
                    Extension = a.Extension,
                    TipoMime = a.TipoMime,
                    TamañoBytes = a.TamañoBytes,
                    FechaSubida = a.FechaSubida,
                    RutaArchivo = a.RutaArchivo,
                    UrlDescarga = $"/api/pacientes/archivos/{a.NombreArchivo}"
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SERVICE] Error al deserializar archivos JSON");
                return null;
            }
        }

        public string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".txt" => "text/plain",
                _ => "application/octet-stream"
            };
        }
    }
}

