using HistoriaClinica.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace HistoriaClinica.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        public DbSet<Usuario> Usuarios { get; set; }

        public DbSet<Paciente> Pacientes { get; set; }

        public DbSet<Consulta> Consultas { get; set; }
    }
}
