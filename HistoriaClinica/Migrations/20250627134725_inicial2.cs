using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class inicial2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "B12",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "COL",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "CR",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "CT",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "FAL",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "GB",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "GLUC",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "GOT",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "GPT",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "GR",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "HB",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "HTO",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notas",
                table: "Consultas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ORINA",
                table: "Consultas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "PLAQ",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TG",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TSH",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "UREA",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "URICO",
                table: "Consultas",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "VITD",
                table: "Consultas",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "B12",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "COL",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "CR",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "CT",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "FAL",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "GB",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "GLUC",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "GOT",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "GPT",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "GR",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "HB",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "HTO",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "Notas",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "ORINA",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "PLAQ",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "TG",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "TSH",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "UREA",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "URICO",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "VITD",
                table: "Consultas");
        }
    }
}
