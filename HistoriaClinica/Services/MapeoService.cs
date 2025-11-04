using HistoriaClinica.Data;
using HistoriaClinica.DTOs;
using HistoriaClinica.Models;
using HistoriaClinica.Services.Interfaces;
using System.Text.Json;

namespace HistoriaClinica.Services
{
    public class MapeoService : IMapeoService
    {
        private readonly IArchivoService _archivoService;

        public MapeoService(IArchivoService archivoService)
        {
            _archivoService = archivoService;
        }

        public PacienteDto MapearPacienteADto(Paciente paciente)
        {
            return new PacienteDto
            {
                Id = paciente.Id,
                Nombre = paciente.Nombre ?? "",
                Apellido = paciente.Apellido ?? "",
                DNI = paciente.DNI ?? "",
                NumeroAfiliado = paciente.NumeroAfiliado ?? "",
                FechaNacimiento = paciente.FechaNacimiento,
                Edad = paciente.Edad,
                Telefono = paciente.Telefono ?? "",
                ObraSocial = paciente.ObraSocial ?? "",
                Particular = paciente.Particular,
                Peso = paciente.Peso,
                Altura = paciente.Altura,
                Email = paciente.Email ?? "",
                Antecedentes = paciente.Antecedentes ?? "",
                Medicacion = paciente.Medicacion ?? "",
                DoctorCabecera = paciente.DoctorCabecera ?? "",
                Consultas = paciente.Consultas?.Select(MapearConsultaADto).ToList() ?? new List<ConsultaDto>()
            };
        }

        public ConsultaDto MapearConsultaADto(Consulta consulta)
        {
            var dto = new ConsultaDto
            {
                Id = consulta.Id,
                Fecha = consulta.Fecha,
                Motivo = consulta.Motivo ?? "",
                Recetar = consulta.Recetar ?? "",
                Ome = consulta.Ome ?? "",
                RecetarRevisado = consulta.RecetarRevisado,
                OmeRevisado = consulta.OmeRevisado,
                Notas = consulta.Notas ?? "",
                Archivos = _archivoService.DeserializarArchivos(consulta.ArchivosJson),
                GR = consulta.GR,
                HTO = consulta.HTO,
                HB = consulta.HB,
                GB = consulta.GB,
                PLAQ = consulta.PLAQ,
                GLUC = consulta.GLUC,
                UREA = consulta.UREA,
                CR = consulta.CR,
                VFG = consulta.VFG,
                GOT = consulta.GOT,
                GPT = consulta.GPT,
                CT = consulta.CT,
                TG = consulta.TG,
                VITD = consulta.VITD,
                FAL = consulta.FAL,
                COL = consulta.COL,
                B12 = consulta.B12,
                TSH = consulta.TSH,
                T4L = consulta.T4L,
                ORINA = consulta.ORINA,
                URICO = consulta.URICO,
                PSA = consulta.PSA,
                HDL = consulta.HDL,
                LDL = consulta.LDL,
                HBA1C = consulta.HBA1C,
                ValoresNoIncluidos = consulta.ValoresNoIncluidos,
                FechaLaboratorio = consulta.FechaLaboratorio,
                CamposResaltados = !string.IsNullOrEmpty(consulta.CamposResaltados) 
                    ? DeserializarCamposResaltados(consulta.CamposResaltados)
                    : new List<string>()
            };
            
            Console.WriteLine($"[MAPEO] T4L mapeado a DTO: {dto.T4L}");
            return dto;
        }

        public Paciente MapearCrearPacienteDtoAEntidad(CrearPacienteDto dto)
        {
            return new Paciente
            {
                Nombre = dto.Nombre.Trim(),
                Apellido = dto.Apellido.Trim(),
                DNI = dto.DNI.Trim(),
                NumeroAfiliado = dto.NumeroAfiliado?.Trim(),
                FechaNacimiento = dto.FechaNacimiento,
                Telefono = dto.Telefono?.Trim(),
                ObraSocial = dto.ObraSocial?.Trim(),
                Particular = dto.Particular,
                Peso = dto.Peso,
                Altura = dto.Altura,
                Email = dto.Email?.Trim(),
                Antecedentes = dto.Antecedentes?.Trim(),
                Medicacion = dto.Medicacion?.Trim(),
                DoctorCabecera = dto.DoctorCabecera?.Trim()
            };
        }

        public Consulta MapearCrearConsultaDtoAEntidad(CrearConsultaDto dto, int pacienteId)
        {
            string? archivosJson = null;
            if (dto.Archivos != null && dto.Archivos.Any())
            {
                var archivos = dto.Archivos.Select(a => new ArchivoConsulta
                {
                    NombreOriginal = a.NombreOriginal,
                    NombreArchivo = a.NombreArchivo,
                    Extension = a.Extension,
                    TipoMime = a.TipoMime,
                    TamañoBytes = a.TamañoBytes,
                    FechaSubida = a.FechaSubida,
                    RutaArchivo = a.RutaArchivo
                }).ToList();
                archivosJson = JsonSerializer.Serialize(archivos);
            }

            return new Consulta
            {
                PacienteId = pacienteId,
                Fecha = dto.Fecha ?? DateTime.Now,
                Motivo = dto.Motivo.Trim(),
                Recetar = dto.Recetar?.Trim(),
                Ome = dto.Ome?.Trim(),
                Notas = dto.Notas?.Trim(),
                ArchivosJson = archivosJson,
                GR = dto.GR,
                HTO = dto.HTO,
                HB = dto.HB,
                GB = dto.GB,
                PLAQ = dto.PLAQ,
                GLUC = dto.GLUC,
                UREA = dto.UREA,
                CR = dto.CR,
                VFG = dto.VFG,
                GOT = dto.GOT,
                GPT = dto.GPT,
                CT = dto.CT,
                TG = dto.TG,
                VITD = dto.VITD,
                FAL = dto.FAL,
                COL = dto.COL,
                B12 = dto.B12,
                TSH = dto.TSH,
                T4L = dto.T4L,
                ORINA = dto.ORINA,
                URICO = dto.URICO,
                PSA = dto.PSA,
                HDL = dto.HDL,
                LDL = dto.LDL,
                HBA1C = dto.HBA1C,
                ValoresNoIncluidos = dto.ValoresNoIncluidos?.Trim(),
                FechaLaboratorio = dto.FechaLaboratorio,
                CamposResaltados = dto.CamposResaltados != null ? JsonSerializer.Serialize(dto.CamposResaltados) : null
            };
        }

        public void ActualizarPacienteDesdeDto(Paciente paciente, ActualizarPacienteDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.Nombre))
                paciente.Nombre = dto.Nombre.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Apellido))
                paciente.Apellido = dto.Apellido.Trim();
            if (!string.IsNullOrWhiteSpace(dto.DNI))
                paciente.DNI = dto.DNI.Trim();
            if (!string.IsNullOrWhiteSpace(dto.NumeroAfiliado))
                paciente.NumeroAfiliado = dto.NumeroAfiliado.Trim();
            if (!string.IsNullOrWhiteSpace(dto.ObraSocial))
                paciente.ObraSocial = dto.ObraSocial.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Telefono))
                paciente.Telefono = dto.Telefono.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Email))
                paciente.Email = dto.Email.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Antecedentes))
                paciente.Antecedentes = dto.Antecedentes.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Medicacion))
                paciente.Medicacion = dto.Medicacion.Trim();
            if (!string.IsNullOrWhiteSpace(dto.DoctorCabecera))
                paciente.DoctorCabecera = dto.DoctorCabecera.Trim();
            if (dto.FechaNacimiento.HasValue)
                paciente.FechaNacimiento = dto.FechaNacimiento.Value;
            if (dto.Peso.HasValue)
                paciente.Peso = dto.Peso.Value;
            if (dto.Altura.HasValue)
                paciente.Altura = dto.Altura.Value;
            if (dto.Particular.HasValue)
                paciente.Particular = dto.Particular.Value;
        }

        public void ActualizarConsultaDesdeDto(Consulta consulta, CrearConsultaDto dto)
        {
            if (dto.Fecha.HasValue)
            {
                consulta.Fecha = dto.Fecha.Value;
                Console.WriteLine($"[MAPEO] Fecha actualizada: {dto.Fecha.Value}");
            }
            else
            {
                Console.WriteLine($"[MAPEO] Fecha no recibida o es null");
            }
            consulta.FechaLaboratorio = dto.FechaLaboratorio ?? consulta.FechaLaboratorio;
            consulta.Motivo = dto.Motivo.Trim();
            consulta.Recetar = dto.Recetar?.Trim();
            consulta.Ome = dto.Ome?.Trim();
            consulta.Notas = dto.Notas?.Trim();
            consulta.GR = dto.GR;
            consulta.HTO = dto.HTO;
            consulta.HB = dto.HB;
            consulta.GB = dto.GB;
            consulta.PLAQ = dto.PLAQ;
            consulta.GLUC = dto.GLUC;
            consulta.UREA = dto.UREA;
            consulta.CR = dto.CR;
            consulta.GOT = dto.GOT;
            consulta.GPT = dto.GPT;
            consulta.CT = dto.CT;
            consulta.TG = dto.TG;
            consulta.VITD = dto.VITD;
            consulta.FAL = dto.FAL;
            consulta.COL = dto.COL;
            consulta.B12 = dto.B12;
            consulta.TSH = dto.TSH;
            consulta.T4L = dto.T4L;
            Console.WriteLine($"[MAPEO] T4L recibido: {dto.T4L}");
            Console.WriteLine($"[MAPEO] T4L asignado a consulta: {consulta.T4L}");
            consulta.ORINA = dto.ORINA;
            consulta.URICO = dto.URICO;
            consulta.PSA = dto.PSA;
            consulta.HDL = dto.HDL;
            consulta.LDL = dto.LDL;
            consulta.HBA1C = dto.HBA1C;
            Console.WriteLine($"[MAPEO] HBA1C recibido: {dto.HBA1C}");
            Console.WriteLine($"[MAPEO] HBA1C asignado a consulta: {consulta.HBA1C}");
            consulta.ValoresNoIncluidos = dto.ValoresNoIncluidos?.Trim();
            
            // Manejar archivos si se proporcionan
            if (dto.Archivos != null && dto.Archivos.Any())
            {
                var archivosJson = JsonSerializer.Serialize(dto.Archivos);
                consulta.ArchivosJson = archivosJson;
                Console.WriteLine($"[MAPEO] Archivos actualizados: {archivosJson}");
            }
            
            if (dto.CamposResaltados != null)
            {
                var camposJson = JsonSerializer.Serialize(dto.CamposResaltados);
                consulta.CamposResaltados = camposJson;
                Console.WriteLine($"[MAPEO] Campos resaltados serializados: {camposJson}");
            }
        }

        private List<string> DeserializarCamposResaltados(string camposJson)
        {
            var campos = JsonSerializer.Deserialize<List<string>>(camposJson);
            Console.WriteLine($"[MAPEO] Campos resaltados deserializados: {JsonSerializer.Serialize(campos)}");
            return campos ?? new List<string>();
        }
    }
}
