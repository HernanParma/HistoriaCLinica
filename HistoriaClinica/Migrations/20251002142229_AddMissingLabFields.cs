using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingLabFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "HBA1C",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "HDL",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "LDL",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "PSA",
                table: "Consultas",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HBA1C",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "HDL",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "LDL",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "PSA",
                table: "Consultas");
        }
    }
}
