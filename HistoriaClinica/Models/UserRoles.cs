namespace HistoriaClinica.Models
{
    public static class UserRoles
    {
        public const string Admin = "admin";
        public const string Medico = "medico";
        public const string Enfermero = "enfermero";
        public const string Recepcionista = "recepcionista";
        public const string Paciente = "paciente";
    }

    public enum RoleType
    {
        Admin,
        Medico,
        Enfermero,
        Recepcionista,
        Paciente
    }
}





























