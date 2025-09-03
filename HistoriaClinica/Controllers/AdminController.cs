using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HistoriaClinica.Models;

namespace HistoriaClinica.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requiere autenticación
    public class AdminController : ControllerBase
    {
        // Solo administradores pueden acceder
        [HttpGet("users")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult GetAllUsers()
        {
            return Ok("Solo los administradores pueden ver esto");
        }

        // Médicos y administradores pueden acceder
        [HttpGet("medical-data")]
        [Authorize(Policy = "MedicoOrAdmin")]
        public IActionResult GetMedicalData()
        {
            return Ok("Médicos y administradores pueden ver esto");
        }

        // Todo el personal de la clínica puede acceder
        [HttpGet("clinic-info")]
        [Authorize(Policy = "PersonalClinica")]
        public IActionResult GetClinicInfo()
        {
            return Ok("Todo el personal de la clínica puede ver esto");
        }

        // Usar roles directamente
        [HttpDelete("delete-user/{id}")]
        [Authorize(Roles = "admin")]
        public IActionResult DeleteUser(int id)
        {
            return Ok($"Usuario {id} eliminado por administrador");
        }

        // Múltiples roles
        [HttpPost("create-appointment")]
        [Authorize(Roles = "medico,recepcionista,admin")]
        public IActionResult CreateAppointment()
        {
            return Ok("Cita creada");
        }
    }
}











