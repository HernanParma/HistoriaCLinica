using HistoriaClinica.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Collections.Generic;

namespace HistoriaClinica.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(w =>
                w.Ignore(RelationalEventId.PendingModelChangesWarning));
        }
        public DbSet<Usuario> Usuarios { get; set; }

        public DbSet<Paciente> Pacientes { get; set; }

        public DbSet<Consulta> Consultas { get; set; }

        public DbSet<WhatsAppConversation> WhatsAppConversations { get; set; }
        public DbSet<WhatsAppMessage> WhatsAppMessages { get; set; }
        public DbSet<WhatsAppBotRequest> WhatsAppBotRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Paciente>()
                .Property(p => p.Peso)
                .HasPrecision(5, 2); // 

            // Configurar relación entre Paciente y Usuario (opcional)
            modelBuilder.Entity<Paciente>()
                .HasOne(p => p.Usuario)
                .WithMany()
                .HasForeignKey(p => p.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            modelBuilder.Entity<WhatsAppConversation>()
                .HasIndex(c => c.MetaWaId)
                .IsUnique();

            modelBuilder.Entity<WhatsAppMessage>()
                .HasIndex(m => m.MetaMessageId)
                .IsUnique()
                .HasFilter("[MetaMessageId] IS NOT NULL");

            modelBuilder.Entity<WhatsAppConversation>()
                .HasOne(c => c.Paciente)
                .WithMany()
                .HasForeignKey(c => c.PacienteId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<WhatsAppBotRequest>()
                .HasOne(r => r.Conversation)
                .WithMany(c => c.BotRequests)
                .HasForeignKey(r => r.WhatsAppConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WhatsAppBotRequest>()
                .HasOne(r => r.Paciente)
                .WithMany()
                .HasForeignKey(r => r.PacienteId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<WhatsAppMessage>()
                .HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.WhatsAppConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
