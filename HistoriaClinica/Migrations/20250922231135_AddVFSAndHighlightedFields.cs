using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class AddVFSAndHighlightedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CamposResaltados",
                table: "Consultas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaLaboratorio",
                table: "Consultas",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "VFS",
                table: "Consultas",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CamposResaltados",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "FechaLaboratorio",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "VFS",
                table: "Consultas");
        }
    }
}
