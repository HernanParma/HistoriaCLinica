using HistoriaClinica.Data;
using HistoriaClinica.DTOs;
using HistoriaClinica.Models;
using HistoriaClinica.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HistoriaClinica.Services
{
    public class ConsultaService : IConsultaService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ConsultaService> _logger;
        private readonly IMapeoService _mapeoService;

        public ConsultaService(AppDbContext context, ILogger<ConsultaService> logger, IMapeoService mapeoService)
        {
            _context = context;
            _logger = logger;
            _mapeoService = mapeoService;
        }

        public async Task<IEnumerable<ConsultaDto>> ObtenerConsultasPorPacienteAsync(int pacienteId)
        {
            _logger.LogInformation("[SERVICE] Obteniendo consultas para paciente {PatientId}", pacienteId);

            var pacienteExiste = await _context.Pacientes.AnyAsync(p => p.Id == pacienteId);
            if (!pacienteExiste)
            {
                _logger.LogWarning("[SERVICE] Paciente {PatientId} no existe", pacienteId);
                throw new ArgumentException($"Paciente con ID {pacienteId} no encontrado");
            }

            var consultas = await _context.Consultas
                .Where(c => c.PacienteId == pacienteId)
                .OrderByDescending(c => c.Fecha)
                .ToListAsync();

            _logger.LogInformation("[SERVICE] {Count} consultas encontradas para paciente {PatientId}", consultas.Count, pacienteId);
            return consultas.Select(_mapeoService.MapearConsultaADto).ToList();
        }

        public async Task<ConsultaDto?> ObtenerConsultaPorIdAsync(int pacienteId, int consultaId)
        {
            _logger.LogInformation("[SERVICE] Obteniendo consulta {ConsultaId} del paciente {PatientId}", consultaId, pacienteId);

            var paciente = await _context.Pacientes.FindAsync(pacienteId);
            if (paciente == null)
            {
                _logger.LogWarning("[SERVICE] Paciente {PatientId} no encontrado", pacienteId);
                throw new ArgumentException("Paciente no encontrado");
            }

            var consulta = await _context.Consultas
                .FirstOrDefaultAsync(c => c.Id == consultaId && c.PacienteId == pacienteId);

            if (consulta == null)
            {
                _logger.LogWarning("[SERVICE] Consulta {ConsultaId} no encontrada para paciente {PatientId}", consultaId, pacienteId);
                throw new ArgumentException("Consulta no encontrada");
            }

            _logger.LogInformation("[SERVICE] Consulta {ConsultaId} encontrada exitosamente", consultaId);
            return _mapeoService.MapearConsultaADto(consulta);
        }

        public async Task<ConsultaDto> CrearConsultaAsync(int pacienteId, CrearConsultaDto crearConsultaDto)
        {
            _logger.LogInformation("[SERVICE] Creando nueva consulta para paciente {PatientId}", pacienteId);

            var paciente = await _context.Pacientes.FindAsync(pacienteId);
            if (paciente == null)
            {
                _logger.LogWarning("[SERVICE] Paciente {PatientId} no encontrado", pacienteId);
                throw new ArgumentException("Paciente no encontrado");
            }

            if (string.IsNullOrWhiteSpace(crearConsultaDto.Motivo))
            {
                _logger.LogWarning("[SERVICE] Motivo de consulta requerido para paciente {PatientId}", pacienteId);
                throw new ArgumentException("El motivo de la consulta es requerido");
            }

            var nuevaConsulta = _mapeoService.MapearCrearConsultaDtoAEntidad(crearConsultaDto, pacienteId);
            _context.Consultas.Add(nuevaConsulta);
            await _context.SaveChangesAsync();

            _logger.LogInformation("[SERVICE] Consulta creada exitosamente con ID: {ConsultaId}", nuevaConsulta.Id);
            return _mapeoService.MapearConsultaADto(nuevaConsulta);
        }

        public async Task<ConsultaDto> ActualizarConsultaAsync(int pacienteId, int consultaId, CrearConsultaDto actualizarConsultaDto)
        {
            _logger.LogInformation("[SERVICE] Actualizando consulta {ConsultaId} del paciente {PatientId}", consultaId, pacienteId);

            var paciente = await _context.Pacientes.FindAsync(pacienteId);
            if (paciente == null)
            {
                _logger.LogWarning("[SERVICE] Paciente {PatientId} no encontrado", pacienteId);
                throw new ArgumentException("Paciente no encontrado");
            }

            var consulta = await _context.Consultas
                .FirstOrDefaultAsync(c => c.Id == consultaId && c.PacienteId == pacienteId);

            if (consulta == null)
            {
                _logger.LogWarning("[SERVICE] Consulta {ConsultaId} no encontrada para paciente {PatientId}", consultaId, pacienteId);
                throw new ArgumentException("Consulta no encontrada");
            }

            if (string.IsNullOrWhiteSpace(actualizarConsultaDto.Motivo))
            {
                _logger.LogWarning("[SERVICE] Motivo de consulta requerido para actualizar consulta {ConsultaId}", consultaId);
                throw new ArgumentException("El motivo de la consulta es requerido");
            }

            _logger.LogInformation("[SERVICE] Campos resaltados recibidos: {CamposResaltados}", 
                actualizarConsultaDto.CamposResaltados != null ? string.Join(", ", actualizarConsultaDto.CamposResaltados) : "null");
            
            _mapeoService.ActualizarConsultaDesdeDto(consulta, actualizarConsultaDto);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("[SERVICE] Campos resaltados guardados en BD: {CamposResaltados}", consulta.CamposResaltados);

            _logger.LogInformation("[SERVICE] Consulta {ConsultaId} actualizada exitosamente", consultaId);
            return _mapeoService.MapearConsultaADto(consulta);
        }

        public async Task<bool> EliminarConsultaAsync(int pacienteId, int consultaId)
        {
            _logger.LogInformation("[SERVICE] Eliminando consulta {ConsultaId} del paciente {PatientId}", consultaId, pacienteId);

            var paciente = await _context.Pacientes.FindAsync(pacienteId);
            if (paciente == null)
            {
                _logger.LogWarning("[SERVICE] Paciente {PatientId} no encontrado", pacienteId);
                throw new ArgumentException("Paciente no encontrado");
            }

            var consulta = await _context.Consultas
                .FirstOrDefaultAsync(c => c.Id == consultaId && c.PacienteId == pacienteId);

            if (consulta == null)
            {
                _logger.LogWarning("[SERVICE] Consulta {ConsultaId} no encontrada para paciente {PatientId}", consultaId, pacienteId);
                throw new ArgumentException("Consulta no encontrada");
            }

            _context.Consultas.Remove(consulta);
            await _context.SaveChangesAsync();

            _logger.LogInformation("[SERVICE] Consulta {ConsultaId} eliminada exitosamente", consultaId);
            return true;
        }

        public async Task<bool> MarcarComoRevisadoAsync(int pacienteId, int consultaId, MarcarRevisadoDto dto)
        {
            _logger.LogInformation("[SERVICE] Marcando como revisado - Paciente: {PacienteId}, Consulta: {ConsultaId}, Campo: {Campo}", 
                pacienteId, consultaId, dto.Campo);

            var consulta = await _context.Consultas
                .FirstOrDefaultAsync(c => c.Id == consultaId && c.PacienteId == pacienteId);

            if (consulta == null)
            {
                _logger.LogWarning("[SERVICE] Consulta {ConsultaId} no encontrada para paciente {PacienteId}", consultaId, pacienteId);
                throw new ArgumentException("Consulta no encontrada");
            }

            if (dto.Campo.ToLower() == "recetar")
            {
                consulta.RecetarRevisado = true;
                _logger.LogInformation("[SERVICE] Campo Recetar marcado como revisado para consulta {ConsultaId}", consultaId);
            }
            else if (dto.Campo.ToLower() == "ome")
            {
                consulta.OmeRevisado = true;
                _logger.LogInformation("[SERVICE] Campo Ome marcado como revisado para consulta {ConsultaId}", consultaId);
            }
            else
            {
                _logger.LogWarning("[SERVICE] Campo inválido: {Campo}", dto.Campo);
                throw new ArgumentException("Campo debe ser 'recetar' u 'ome'");
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("[SERVICE] Consulta {ConsultaId} actualizada exitosamente", consultaId);
            return true;
        }
    }
}
