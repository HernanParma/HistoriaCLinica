using HistoriaClinica.Data;
using HistoriaClinica.DTOs;
using HistoriaClinica.Models;
using HistoriaClinica.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HistoriaClinica.Services
{
    public class PacienteService : IPacienteService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PacienteService> _logger;
        private readonly IMapeoService _mapeoService;

        public PacienteService(AppDbContext context, ILogger<PacienteService> logger, IMapeoService mapeoService)
        {
            _context = context;
            _logger = logger;
            _mapeoService = mapeoService;
        }

        public async Task<IEnumerable<Paciente>> ObtenerTodosLosPacientesAsync()
        {
            _logger.LogInformation("[SERVICE] Obteniendo todos los pacientes");
            return await _context.Pacientes.ToListAsync();
        }

        public async Task<IEnumerable<PacienteConNotificacionesDto>> ObtenerPacientesConNotificacionesAsync()
        {
            _logger.LogInformation("[SERVICE] Obteniendo pacientes con notificaciones");
            return await _context.Pacientes
                .Select(p => new PacienteConNotificacionesDto
                {
                    Id = p.Id,
                    Nombre = p.Nombre ?? "",
                    Apellido = p.Apellido ?? "",
                    DNI = p.DNI ?? "",
                    NumeroAfiliado = p.NumeroAfiliado ?? "",
                    FechaNacimiento = p.FechaNacimiento,
                    Telefono = p.Telefono ?? "",
                    ObraSocial = p.ObraSocial ?? "",
                    Particular = p.Particular,
                    Peso = p.Peso,
                    Altura = p.Altura,
                    Email = p.Email ?? "",
                    Antecedentes = p.Antecedentes ?? "",
                    Medicacion = p.Medicacion ?? "",
                    TieneNotificaciones = p.Consultas.Any(c => 
                        (c.Recetar != null && c.Recetar.Trim() != "" && !c.RecetarRevisado) ||
                        (c.Ome != null && c.Ome.Trim() != "" && !c.OmeRevisado)
                    ),
                    TieneRecetarPendiente = p.Consultas.Any(c => 
                        c.Recetar != null && c.Recetar.Trim() != "" && !c.RecetarRevisado
                    ),
                    TieneOmePendiente = p.Consultas.Any(c => 
                        c.Ome != null && c.Ome.Trim() != "" && !c.OmeRevisado
                    )
                })
                .ToListAsync();
        }

        public async Task<PacienteDto?> ObtenerPacientePorIdAsync(int id)
        {
            _logger.LogInformation("[SERVICE] Obteniendo paciente con ID: {PatientId}", id);
            
            var paciente = await _context.Pacientes
                .AsNoTracking()
                .Include(p => p.Consultas)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (paciente == null)
            {
                _logger.LogWarning("[SERVICE] Paciente {PatientId} no encontrado", id);
                return null;
            }

            var dto = _mapeoService.MapearPacienteADto(paciente);
            
            // Cargar archivos para cada consulta
            if (dto.Consultas != null)
            {
                foreach (var consulta in dto.Consultas)
                {
                    var consultaCompleta = await _context.Consultas.FindAsync(consulta.Id);
                    if (consultaCompleta != null)
                    {
                        consulta.Archivos = _mapeoService.MapearConsultaADto(consultaCompleta).Archivos;
                    }
                }
            }

            _logger.LogInformation("[SERVICE] Paciente encontrado: {Nombre} {Apellido}", dto.Nombre, dto.Apellido);
            return dto;
        }

        public async Task<PacienteDto> CrearPacienteAsync(CrearPacienteDto crearPacienteDto)
        {
            _logger.LogInformation("[SERVICE] Creando nuevo paciente: {Nombre} {Apellido}", 
                crearPacienteDto.Nombre, crearPacienteDto.Apellido);

            // Validaciones
            if (string.IsNullOrWhiteSpace(crearPacienteDto.Nombre))
                throw new ArgumentException("El nombre del paciente es requerido");
            if (string.IsNullOrWhiteSpace(crearPacienteDto.Apellido))
                throw new ArgumentException("El apellido del paciente es requerido");
            if (string.IsNullOrWhiteSpace(crearPacienteDto.DNI))
                throw new ArgumentException("El DNI del paciente es requerido");

            // Verificar DNI único
            var pacienteExistente = await _context.Pacientes
                .FirstOrDefaultAsync(p => p.DNI == crearPacienteDto.DNI);
            if (pacienteExistente != null)
            {
                _logger.LogWarning("[SERVICE] Ya existe un paciente con DNI: {DNI}", crearPacienteDto.DNI);
                throw new ArgumentException("Ya existe un paciente con este DNI");
            }

            var nuevoPaciente = _mapeoService.MapearCrearPacienteDtoAEntidad(crearPacienteDto);
            _context.Pacientes.Add(nuevoPaciente);
            await _context.SaveChangesAsync();

            _logger.LogInformation("[SERVICE] Paciente creado exitosamente con ID: {PacienteId}", nuevoPaciente.Id);
            return _mapeoService.MapearPacienteADto(nuevoPaciente);
        }

        public async Task<PacienteDto> ActualizarPacienteAsync(int id, ActualizarPacienteDto actualizarPacienteDto)
        {
            _logger.LogInformation("[SERVICE] Actualizando paciente con ID: {PatientId}", id);

            var paciente = await _context.Pacientes.FindAsync(id);
            if (paciente == null)
            {
                _logger.LogWarning("[SERVICE] Paciente {PatientId} no encontrado", id);
                throw new ArgumentException("Paciente no encontrado");
            }

            _mapeoService.ActualizarPacienteDesdeDto(paciente, actualizarPacienteDto);
            await _context.SaveChangesAsync();

            _logger.LogInformation("[SERVICE] Paciente {PatientId} actualizado exitosamente", id);
            return _mapeoService.MapearPacienteADto(paciente);
        }

        public async Task<bool> ExistePacienteAsync(int id)
        {
            return await _context.Pacientes.AnyAsync(p => p.Id == id);
        }

        public async Task<bool> ExistePacientePorDniAsync(string dni)
        {
            return await _context.Pacientes.AnyAsync(p => p.DNI == dni);
        }
    }
}
