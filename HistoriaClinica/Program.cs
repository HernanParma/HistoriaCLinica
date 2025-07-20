using HistoriaClinica.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Agregar servicio de DB Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar CORS para permitir el origen del frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()  // Permite cualquier método HTTP (GET, POST, etc.)
              .AllowAnyHeader(); // Permite cualquier cabecera
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Asegurar que la base de datos existe
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        // Crear la base de datos si no existe
        await context.Database.EnsureCreatedAsync();
        Console.WriteLine("Base de datos creada/verificada exitosamente");
        
        // Inicializar datos semilla
        await SeedData.Initialize(scope.ServiceProvider);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error al crear/verificar la base de datos: {ex.Message}");
    }
}

// Configurar el pipeline de HTTP en el orden correcto
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Servir archivos estáticos como index.html, css, js
app.UseStaticFiles();

// Habilitar enrutamiento
app.UseRouting();

// Aplicar la política de CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

// Sembrar la base de datos
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        SeedData.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Mapear los controladores de la API
app.MapControllers();

// Configurar ruta por defecto para servir la aplicación de una sola página (SPA)
app.MapFallbackToFile("index.html");

app.Run();
