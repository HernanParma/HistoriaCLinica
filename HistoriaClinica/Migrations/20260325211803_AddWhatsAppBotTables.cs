using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HistoriaClinica.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppBotTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WhatsAppConversations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MetaWaId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    PacienteId = table.Column<int>(type: "int", nullable: true),
                    NombreCompleto = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    NumeroAfiliado = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    TipoConsulta = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    Detalle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastActivityAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppConversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppConversations_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppBotRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WhatsAppConversationId = table.Column<int>(type: "int", nullable: false),
                    MetaWaId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    PacienteId = table.Column<int>(type: "int", nullable: true),
                    NombreCompleto = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    NumeroAfiliado = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    TipoConsulta = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    Detalle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LeidoAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppBotRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppBotRequests_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_WhatsAppBotRequests_WhatsAppConversations_WhatsAppConversationId",
                        column: x => x.WhatsAppConversationId,
                        principalTable: "WhatsAppConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WhatsAppConversationId = table.Column<int>(type: "int", nullable: false),
                    Inbound = table.Column<bool>(type: "bit", nullable: false),
                    MetaMessageId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    Texto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RawPayloadJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppMessages_WhatsAppConversations_WhatsAppConversationId",
                        column: x => x.WhatsAppConversationId,
                        principalTable: "WhatsAppConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppBotRequests_PacienteId",
                table: "WhatsAppBotRequests",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppBotRequests_WhatsAppConversationId",
                table: "WhatsAppBotRequests",
                column: "WhatsAppConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppConversations_MetaWaId",
                table: "WhatsAppConversations",
                column: "MetaWaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppConversations_PacienteId",
                table: "WhatsAppConversations",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppMessages_MetaMessageId",
                table: "WhatsAppMessages",
                column: "MetaMessageId",
                unique: true,
                filter: "[MetaMessageId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppMessages_WhatsAppConversationId",
                table: "WhatsAppMessages",
                column: "WhatsAppConversationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WhatsAppBotRequests");

            migrationBuilder.DropTable(
                name: "WhatsAppMessages");

            migrationBuilder.DropTable(
                name: "WhatsAppConversations");
        }
    }
}
