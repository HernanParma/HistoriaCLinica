using HistoriaClinica.Models;
using HistoriaClinica.DTOs;

namespace HistoriaClinica.Services.Interfaces
{
    public interface IMapeoService
    {
        PacienteDto MapearPacienteADto(Paciente paciente);
        ConsultaDto MapearConsultaADto(Consulta consulta);
        Paciente MapearCrearPacienteDtoAEntidad(CrearPacienteDto dto);
        Consulta MapearCrearConsultaDtoAEntidad(CrearConsultaDto dto, int pacienteId);
        void ActualizarPacienteDesdeDto(Paciente paciente, ActualizarPacienteDto dto);
        void ActualizarConsultaDesdeDto(Consulta consulta, CrearConsultaDto dto);
    }
}
