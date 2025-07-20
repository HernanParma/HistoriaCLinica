# 🔧 Solución de Problemas de Base de Datos

## 🚨 Problema: Usuarios no se guardan en la base de datos

### 🔍 Diagnóstico

Si al registrar usuarios no se están guardando en la base de datos, sigue estos pasos:

### 1. Verificar la Conexión a la Base de Datos

**Ejecuta la aplicación y visita:**
```
https://localhost:7000/api/usuarios/test
```

**Respuesta esperada:**
```json
{
  "message": "Conexión a la base de datos exitosa",
  "userCount": 1,
  "timestamp": "2024-01-XX..."
}
```

### 2. Verificar SQL Server

**Asegúrate de que SQL Server esté ejecutándose:**

#### Para SQL Server Express:
```bash
# Verificar si el servicio está ejecutándose
sc query MSSQLSERVER

# Si no está ejecutándose, iniciarlo:
net start MSSQLSERVER
```

#### Para LocalDB:
```bash
# Verificar LocalDB
sqllocaldb info

# Si no existe, crearlo:
sqllocaldb create "MSSQLLocalDB"
sqllocaldb start "MSSQLLocalDB"
```

### 3. Verificar la Cadena de Conexión

**Revisa `appsettings.json`:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=HistoriaClinica;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Para SQL Server Express, usa:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=HistoriaClinica;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Para LocalDB, usa:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HistoriaClinica;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

### 4. Crear la Base de Datos Manualmente

**Opción A: Usando Entity Framework**
```bash
# En la carpeta del proyecto
dotnet ef database update
```

**Opción B: Usando SQL Server Management Studio**
```sql
CREATE DATABASE HistoriaClinica;
GO
USE HistoriaClinica;
GO
```

### 5. Verificar las Tablas

**Conecta a la base de datos y ejecuta:**
```sql
USE HistoriaClinica;
GO

-- Verificar si las tablas existen
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';

-- Verificar usuarios existentes
SELECT * FROM Usuarios;
```

### 6. Recrear la Base de Datos

**Si nada funciona, elimina y recrea la base de datos:**

```bash
# Eliminar migraciones existentes
dotnet ef migrations remove

# Crear nueva migración
dotnet ef migrations add InitialCreate

# Actualizar base de datos
dotnet ef database update
```

### 7. Verificar Logs

**Revisa los logs de la aplicación en la consola donde ejecutaste `dotnet run`**

**Busca mensajes como:**
- "Base de datos creada/verificada exitosamente"
- "Usuario registrado exitosamente. Filas afectadas: 1"
- "Error al registrar usuario"

### 8. Probar el Endpoint de Registro

**Usa Postman o curl para probar directamente:**

```bash
curl -X POST https://localhost:7000/api/usuarios/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "testuser",
    "contrasenaHash": "password123"
  }'
```

**Respuesta esperada:**
```json
"Usuario registrado con éxito."
```

### 9. Verificar el Frontend

**Abre la consola del navegador (F12) y busca errores en:**
- Network tab: verifica que la petición se envíe correctamente
- Console tab: busca errores JavaScript

### 10. Soluciones Comunes

#### Problema: "Login failed for user"
**Solución:** Usar autenticación de Windows o configurar SQL Server para autenticación mixta

#### Problema: "Database does not exist"
**Solución:** Crear la base de datos manualmente o usar `EnsureCreatedAsync()`

#### Problema: "Connection timeout"
**Solución:** Verificar que SQL Server esté ejecutándose y accesible

### 11. Configuración de Desarrollo

**Para desarrollo local, usa esta configuración:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HistoriaClinica;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "HistoriaClinica.Controllers": "Information"
    }
  }
}
```

### 12. Verificar el Código

**Asegúrate de que el controlador tenga el namespace correcto:**
```csharp
namespace HistoriaClinica.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        // ...
    }
}
```

### 🎯 Pasos de Verificación Final

1. ✅ SQL Server ejecutándose
2. ✅ Cadena de conexión correcta
3. ✅ Base de datos creada
4. ✅ Tablas existentes
5. ✅ Endpoint de prueba funcionando
6. ✅ Logs mostrando actividad
7. ✅ Frontend enviando datos correctamente

### 📞 Si el Problema Persiste

1. Revisa los logs completos de la aplicación
2. Verifica la configuración de SQL Server
3. Prueba con una cadena de conexión diferente
4. Verifica que no haya conflictos de puertos
5. Asegúrate de que el usuario tenga permisos en la base de datos 