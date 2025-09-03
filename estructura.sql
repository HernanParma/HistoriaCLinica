IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Pacientes] (
    [Id] int NOT NULL IDENTITY,
    [DNI] nvarchar(max) NOT NULL,
    [NumeroAfiliado] nvarchar(max) NOT NULL,
    [Nombre] nvarchar(max) NOT NULL,
    [Apellido] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Telefono] nvarchar(max) NOT NULL,
    [ObraSocial] nvarchar(max) NOT NULL,
    [FechaNacimiento] datetime2 NOT NULL,
    [Antecedentes] nvarchar(max) NOT NULL,
    [Medicacion] nvarchar(max) NOT NULL,
    [Consulta] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Pacientes] PRIMARY KEY ([Id])
);

CREATE TABLE [Usuarios] (
    [Id] int NOT NULL IDENTITY,
    [NombreUsuario] nvarchar(max) NOT NULL,
    [ContrasenaHash] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250620233449_AddUsuario', N'9.0.6');

DECLARE @var sysname;
SELECT @var = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Pacientes]') AND [c].[name] = N'Consulta');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [Pacientes] DROP CONSTRAINT [' + @var + '];');
ALTER TABLE [Pacientes] DROP COLUMN [Consulta];

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Pacientes]') AND [c].[name] = N'Medicacion');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Pacientes] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [Pacientes] ALTER COLUMN [Medicacion] nvarchar(MAX) NOT NULL;

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Pacientes]') AND [c].[name] = N'Antecedentes');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Pacientes] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [Pacientes] ALTER COLUMN [Antecedentes] nvarchar(MAX) NOT NULL;

CREATE TABLE [Consultas] (
    [Id] int NOT NULL IDENTITY,
    [Fecha] datetime2 NOT NULL,
    [Motivo] nvarchar(max) NOT NULL,
    [PacienteId] int NOT NULL,
    CONSTRAINT [PK_Consultas] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Consultas_Pacientes_PacienteId] FOREIGN KEY ([PacienteId]) REFERENCES [Pacientes] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_Consultas_PacienteId] ON [Consultas] ([PacienteId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250622143809_inicial', N'9.0.6');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250622144318_mia', N'9.0.6');

ALTER TABLE [Consultas] ADD [B12] float NULL;

ALTER TABLE [Consultas] ADD [COL] float NULL;

ALTER TABLE [Consultas] ADD [CR] float NULL;

ALTER TABLE [Consultas] ADD [CT] float NULL;

ALTER TABLE [Consultas] ADD [FAL] float NULL;

ALTER TABLE [Consultas] ADD [GB] float NULL;

ALTER TABLE [Consultas] ADD [GLUC] float NULL;

ALTER TABLE [Consultas] ADD [GOT] float NULL;

ALTER TABLE [Consultas] ADD [GPT] float NULL;

ALTER TABLE [Consultas] ADD [GR] float NULL;

ALTER TABLE [Consultas] ADD [HB] float NULL;

ALTER TABLE [Consultas] ADD [HTO] float NULL;

ALTER TABLE [Consultas] ADD [Notas] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Consultas] ADD [ORINA] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Consultas] ADD [PLAQ] float NULL;

ALTER TABLE [Consultas] ADD [TG] float NULL;

ALTER TABLE [Consultas] ADD [TSH] float NULL;

ALTER TABLE [Consultas] ADD [UREA] float NULL;

ALTER TABLE [Consultas] ADD [URICO] float NULL;

ALTER TABLE [Consultas] ADD [VITD] float NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250627134725_inicial2', N'9.0.6');

ALTER TABLE [Pacientes] ADD [Altura] int NULL;

ALTER TABLE [Pacientes] ADD [Peso] decimal(18,2) NULL;

ALTER TABLE [Consultas] ADD [Ome] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Consultas] ADD [Recetar] nvarchar(max) NOT NULL DEFAULT N'';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250710212458_full', N'9.0.6');

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Pacientes]') AND [c].[name] = N'Peso');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Pacientes] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [Pacientes] ALTER COLUMN [Peso] decimal(5,2) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250806001258_PrecisionPeso', N'9.0.6');

COMMIT;
GO

