using HistoriaClinica.Models;
using HistoriaClinica.DTOs;

namespace HistoriaClinica.Services.Interfaces
{
    public interface IDemoService
    {
        Task<object> GenerarDatosDemoAsync();
        Task<object> LimpiarDatosDemoAsync();
        Task<object> TestDatabaseConnectionAsync();
        List<Paciente> GenerarPacientesDemo();
    }
}
