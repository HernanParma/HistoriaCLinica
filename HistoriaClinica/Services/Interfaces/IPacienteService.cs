using HistoriaClinica.Models;
using HistoriaClinica.DTOs;

namespace HistoriaClinica.Services.Interfaces
{
    public interface IPacienteService
    {
        Task<IEnumerable<Paciente>> ObtenerTodosLosPacientesAsync();
        Task<IEnumerable<PacienteConNotificacionesDto>> ObtenerPacientesConNotificacionesAsync();
        Task<PacienteDto?> ObtenerPacientePorIdAsync(int id);
        Task<PacienteDto> CrearPacienteAsync(CrearPacienteDto crearPacienteDto);
        Task<PacienteDto> ActualizarPacienteAsync(int id, ActualizarPacienteDto actualizarPacienteDto);
        Task<bool> EliminarPacienteAsync(int id);
        Task<bool> ExistePacienteAsync(int id);
        Task<bool> ExistePacientePorDniAsync(string dni);
    }
}
