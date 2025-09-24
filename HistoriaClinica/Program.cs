using HistoriaClinica.Data;
using HistoriaClinica.Services;
using HistoriaClinica.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// NUNCA fuerces el environment aquí. Déjalo a cargo de dotnet/launchSettings/env del SO.
// Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Production");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registrar servicios de dominio
builder.Services.AddScoped<IPacienteService, PacienteService>();
builder.Services.AddScoped<IConsultaService, ConsultaService>();
builder.Services.AddScoped<IArchivoService, ArchivoService>();
builder.Services.AddScoped<IMapeoService, MapeoService>();
builder.Services.AddScoped<IDemoService, DemoService>();

// CORS: en dev podés permitir Live Server; en prod, restringí a tu dominio real.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins(
                    "http://127.0.0.1:5500",
                    "http://localhost:5500"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            // En producción, permitir solo HTTPS
            policy.WithOrigins(
                    "https://" + builder.Configuration["AllowedHosts"]?.Split(',')[0]?.Trim(),
                    "https://www." + builder.Configuration["AllowedHosts"]?.Split(',')[0]?.Trim()
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        // .AllowCredentials(); // si vas a usar cookies o auth basada en cookies
    });
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "clave_super_secreta_para_dev";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar autorización por roles
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
    options.AddPolicy("MedicoOnly", policy => policy.RequireRole("medico"));
    options.AddPolicy("EnfermeroOnly", policy => policy.RequireRole("enfermero"));
    options.AddPolicy("RecepcionistaOnly", policy => policy.RequireRole("recepcionista"));
    options.AddPolicy("PacienteOnly", policy => policy.RequireRole("paciente"));
    
    // Políticas combinadas
    options.AddPolicy("MedicoOrAdmin", policy => 
        policy.RequireRole("medico", "admin"));
    options.AddPolicy("PersonalMedico", policy => 
        policy.RequireRole("medico", "enfermero", "admin"));
    options.AddPolicy("PersonalClinica", policy => 
        policy.RequireRole("medico", "enfermero", "recepcionista", "admin"));
});

var app = builder.Build();

// DB ensure + seed (para desarrollo; en prod preferí Migraciones)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.EnsureCreatedAsync();
    await SeedData.Initialize(scope.ServiceProvider);
}

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Configuración de seguridad para HTTPS
if (!app.Environment.IsDevelopment())
{
    // En producción, forzar HTTPS
    app.UseHttpsRedirection();
    
    // Configurar headers de seguridad
    app.Use(async (context, next) =>
    {
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        context.Response.Headers["X-Frame-Options"] = "DENY";
        context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
        context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        context.Response.Headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
        
        await next();
    });
}

app.UseStaticFiles();
app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthentication(); // JWT
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

// Endpoint de prueba DB
app.MapGet("/test-db", async (AppDbContext context) =>
{
    var count = await context.Usuarios.CountAsync();
    return Results.Ok($"✅ Conexión OK. Total usuarios: {count}");
});

app.Run();
