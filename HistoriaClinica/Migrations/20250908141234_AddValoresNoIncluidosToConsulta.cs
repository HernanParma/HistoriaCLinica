using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class AddValoresNoIncluidosToConsulta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ValoresNoIncluidos",
                table: "Consultas",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValoresNoIncluidos",
                table: "Consultas");
        }
    }
}
