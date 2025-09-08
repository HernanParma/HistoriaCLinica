using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class AddRevisionStatusToConsulta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "OmeRevisado",
                table: "Consultas",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RecetarRevisado",
                table: "Consultas",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OmeRevisado",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "RecetarRevisado",
                table: "Consultas");
        }
    }
}
