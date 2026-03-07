using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class ModalidadViejasEnBlanco : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Poner en blanco la modalidad de consultas que tenían el valor por defecto "Presencial" (viejas)
            migrationBuilder.Sql(@"
                UPDATE Consultas SET Modalidad = '' WHERE Modalidad = 'Presencial';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Opcional: restaurar Presencial donde estaba vacío (no reversible de forma exacta)
            migrationBuilder.Sql(@"
                UPDATE Consultas SET Modalidad = 'Presencial' WHERE Modalidad = '' OR Modalidad IS NULL;
            ");
        }
    }
}
