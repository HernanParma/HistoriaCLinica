using Microsoft.EntityFrameworkCore.Migrations;

namespace HistoriaClinica.Migrations
{
    public partial class AddParticularColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Particular",
                table: "Pacientes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Particular",
                table: "Pacientes");
        }
    }
}























