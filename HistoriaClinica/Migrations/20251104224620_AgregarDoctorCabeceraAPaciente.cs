using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class AgregarDoctorCabeceraAPaciente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DoctorCabecera",
                table: "Pacientes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioId",
                table: "Pacientes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_UsuarioId",
                table: "Pacientes",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pacientes_Usuarios_UsuarioId",
                table: "Pacientes",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_Usuarios_UsuarioId",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_UsuarioId",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "DoctorCabecera",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "UsuarioId",
                table: "Pacientes");
        }
    }
}
