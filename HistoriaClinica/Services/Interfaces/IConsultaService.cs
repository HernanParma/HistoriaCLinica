using HistoriaClinica.Models;
using HistoriaClinica.DTOs;

namespace HistoriaClinica.Services.Interfaces
{
    public interface IConsultaService
    {
        Task<IEnumerable<ConsultaDto>> ObtenerConsultasPorPacienteAsync(int pacienteId);
        Task<ConsultaDto?> ObtenerConsultaPorIdAsync(int pacienteId, int consultaId);
        Task<ConsultaDto> CrearConsultaAsync(int pacienteId, CrearConsultaDto crearConsultaDto);
        Task<ConsultaDto> ActualizarConsultaAsync(int pacienteId, int consultaId, CrearConsultaDto actualizarConsultaDto);
        Task<bool> EliminarConsultaAsync(int pacienteId, int consultaId);
        Task<bool> MarcarComoRevisadoAsync(int pacienteId, int consultaId, MarcarRevisadoDto dto);
    }
}
