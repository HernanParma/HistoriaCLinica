using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class full : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Altura",
                table: "Pacientes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Peso",
                table: "Pacientes",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ome",
                table: "Consultas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Recetar",
                table: "Consultas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Altura",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Peso",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Ome",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "Recetar",
                table: "Consultas");
        }
    }
}
