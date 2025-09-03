using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class AddArchivosToConsulta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ArchivosJson",
                table: "Consultas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchivosJson",
                table: "Consultas");
        }
    }
}
