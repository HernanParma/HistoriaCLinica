# 📚 Guía Completa: Base de Datos y Llamadas API

## 🎯 Resumen Rápido

- **BD en Producción**: Se crea automáticamente en el host remoto cuando la app inicia
- **BD en Local**: **SÍ, usas la misma BD del host** (configuración actual)
- **Llamadas API**: El frontend detecta automáticamente si está en local o producción
- **Pruebas en Local**: Swagger disponible en `https://localhost:7229/swagger`

---

## 📋 PARTE 1: Cómo se Genera la Base de Datos en el Host

### Paso 1: Configuración de la Cadena de Conexión

La cadena de conexión está configurada en `appsettings.json` y `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=db24868.public.databaseasp.net;Database=db24868;User Id=db24868;Password=Flor1991;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True"
  }
}
```

**Detalles:**
- **Servidor**: `db24868.public.databaseasp.net` (host remoto)
- **Base de Datos**: `db24868`
- **Usuario**: `db24868`
- **Contraseña**: `Flor1991`

### Paso 2: Proceso de Creación de la BD

Cuando la aplicación inicia, ejecuta este código en `Program.cs` (líneas 103-109):

```csharp
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.EnsureCreatedAsync();  // ← Crea la BD si no existe
    await SeedData.Initialize(scope.ServiceProvider);  // ← Inserta datos iniciales
}
```

**¿Qué hace `EnsureCreatedAsync()`?**
1. ✅ Verifica si la base de datos `db24868` existe en `db24868.public.databaseasp.net`
2. ✅ Si **NO existe**: La crea automáticamente con todas las tablas según tus modelos
3. ✅ Si **ya existe**: No hace nada (no la modifica)
4. ⚠️ **IMPORTANTE**: No aplica migraciones, solo crea desde cero

**Flujo completo:**
```
1. App inicia en producción
   ↓
2. Lee appsettings.Production.json
   ↓
3. Obtiene cadena de conexión al host remoto
   ↓
4. Ejecuta EnsureCreatedAsync()
   ↓
5. Si BD no existe → La crea en el host remoto
   ↓
6. Ejecuta SeedData.Initialize() → Inserta usuarios/roles iniciales
```

### Paso 3: Tablas Creadas

Según tu `AppDbContext.cs`, se crean estas tablas:
- `Usuarios` - Usuarios del sistema
- `Pacientes` - Información de pacientes
- `Consultas` - Consultas médicas
- `ArchivoConsulta` - Archivos adjuntos a consultas

---

## 📋 PARTE 2: Cómo Funcionan las Llamadas API

### En Producción (historia.runasp.net)

#### Paso 1: Detección Automática del Entorno

El frontend detecta automáticamente dónde está corriendo en `wwwroot/js/config.js`:

```javascript
// Líneas 34-39
if (currentHost.includes('historia.runasp.net') || currentHost.includes('runasp.net')) {
    const apiUrl = 'https://historia.runasp.net';
    return apiUrl;  // ← Usa esta URL para todas las llamadas
}
```

#### Paso 2: Configuración de la URL Base

```javascript
window.CONFIG = {
    API_BASE_URL: 'https://historia.runasp.net',  // ← URL base detectada
    API_ENDPOINTS: {
        LOGIN: '/api/usuarios/login',
        REGISTER: '/api/usuarios/registrar',
        PATIENTS: '/api/pacientes',
        CONSULTAS: '/api/consultas'
    }
};
```

#### Paso 3: Ejemplo de Llamada Real

Cuando el usuario hace login, el código hace esto:

```javascript
// wwwroot/js/classes/ApiClient.js
const url = `${this.baseUrl}/api/usuarios/login`;  
// Resultado: https://historia.runasp.net/api/usuarios/login

const response = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombreUsuario: 'admin', contrasena: '123' })
});
```

**Flujo completo en producción:**
```
1. Usuario abre: https://historia.runasp.net/index.html
   ↓
2. JavaScript carga config.js
   ↓
3. Detecta: "Estoy en historia.runasp.net"
   ↓
4. Configura: API_BASE_URL = 'https://historia.runasp.net'
   ↓
5. Usuario hace login
   ↓
6. Frontend llama: POST https://historia.runasp.net/api/usuarios/login
   ↓
7. Backend procesa y responde
   ↓
8. Frontend guarda JWT token y redirige
```

### En Local (localhost)

#### Paso 1: Detección del Entorno Local

```javascript
// Líneas 20-32 de config.js
if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    let apiUrl;
    if (currentPort) {
        apiUrl = `${currentProtocol}//${currentHost}:${currentPort}`;
        // Ejemplo: http://localhost:5000 o https://localhost:7229
    } else {
        apiUrl = `${currentProtocol}//${currentHost}`;
    }
    return apiUrl;  // ← Usa el mismo origen (mismo servidor)
}
```

#### Paso 2: Configuración en Local

```javascript
window.CONFIG = {
    API_BASE_URL: 'https://localhost:7229',  // ← Detectado automáticamente
    // o 'http://localhost:5000' si usas HTTP
};
```

#### Paso 3: Ejemplo de Llamada en Local

```javascript
// Mismo código, pero la URL cambia automáticamente
const url = `${this.baseUrl}/api/usuarios/login`;
// Resultado: https://localhost:7229/api/usuarios/login
```

**Flujo completo en local:**
```
1. Ejecutas: dotnet run
   ↓
2. App inicia en: https://localhost:7229
   ↓
3. Abres: https://localhost:7229/index.html
   ↓
4. JavaScript detecta: "Estoy en localhost:7229"
   ↓
5. Configura: API_BASE_URL = 'https://localhost:7229'
   ↓
6. Usuario hace login
   ↓
7. Frontend llama: POST https://localhost:7229/api/usuarios/login
   ↓
8. Backend procesa (usando BD del host remoto)
   ↓
9. Frontend recibe respuesta
```

---

## 📋 PARTE 3: Cómo Hacer Pruebas en Local

### Opción 1: Usar Swagger (Recomendado para probar endpoints)

#### Paso 1: Iniciar la Aplicación

```bash
# En la carpeta del proyecto
dotnet run
```

O desde Visual Studio:
- Presiona F5 o selecciona el perfil "https"

#### Paso 2: Acceder a Swagger

La aplicación iniciará en:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:7229`

Abre en el navegador:
```
https://localhost:7229/swagger
```

#### Paso 3: Probar Endpoints

1. **Login**:
   - Endpoint: `POST /api/usuarios/login`
   - Body:
     ```json
     {
       "nombreUsuario": "admin",
       "contrasena": "tu_contraseña"
     }
     ```
   - Respuesta: Obtendrás un JWT token

2. **Obtener Pacientes**:
   - Endpoint: `GET /api/pacientes`
   - Click en "Authorize" (arriba a la derecha)
   - Pega el token JWT obtenido del login
   - Click en "Try it out" → "Execute"

3. **Crear Paciente**:
   - Endpoint: `POST /api/pacientes`
   - Body con los datos del paciente

### Opción 2: Usar el Frontend HTML

#### Paso 1: Iniciar la Aplicación

```bash
dotnet run
```

#### Paso 2: Abrir el Frontend

Abre en el navegador:
```
https://localhost:7229/index.html
```

#### Paso 3: Usar la Interfaz

- Login, registro, gestión de pacientes, etc.
- Todo funciona igual que en producción, pero apuntando a localhost

### Opción 3: Usar Live Server (Solo Frontend, sin Backend)

#### Paso 1: Abrir con Live Server

En VS Code:
- Click derecho en `wwwroot/index.html`
- "Open with Live Server"
- Se abre en: `http://localhost:5500/index.html`

#### Paso 2: Configurar la URL de la API

El frontend detectará que está en `localhost:5500`, pero necesitas que apunte a tu backend.

**Opción A**: Modificar temporalmente `config.js`:
```javascript
// Forzar URL del backend
window.CONFIG.API_BASE_URL = 'https://localhost:7229';
```

**Opción B**: Ejecutar el backend también:
```bash
# Terminal 1: Backend
dotnet run

# Terminal 2: Live Server (o usar extensión VS Code)
# Frontend en http://localhost:5500
# Backend en https://localhost:7229
```

**⚠️ Problema de CORS**: Si usas Live Server en puerto 5500, el backend debe permitir ese origen (ya está configurado en `Program.cs` líneas 33-35).

---

## 📋 PARTE 4: ¿Usas la BD del Host en Local?

### ✅ SÍ - Configuración Actual

**Tanto en desarrollo como en producción usas la misma BD remota:**

| Archivo | Connection String |
|---------|-------------------|
| `appsettings.json` | `db24868.public.databaseasp.net` |
| `appsettings.Development.json` | `db24868.public.databaseasp.net` |
| `appsettings.Production.json` | `db24868.public.databaseasp.net` |

**Ventajas:**
- ✅ No necesitas instalar SQL Server localmente
- ✅ Mismos datos en desarrollo y producción
- ✅ Fácil de probar

**Desventajas:**
- ⚠️ Puedes modificar datos de producción desde local
- ⚠️ Si la BD remota cae, no puedes desarrollar
- ⚠️ Más lento que una BD local

### 🔄 Alternativa: Usar BD Local para Desarrollo

Si quieres usar una BD local para desarrollo:

#### Paso 1: Instalar SQL Server LocalDB

```bash
# Ya viene con Visual Studio, o descarga SQL Server Express
```

#### Paso 2: Modificar `appsettings.Development.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HistoriaClinica_Dev;Trusted_Connection=True;MultipleActiveResultSets=True"
  }
}
```

#### Paso 3: Aplicar Migraciones

```bash
# Crear migración (si no existe)
dotnet ef migrations add InitialCreate

# Aplicar migraciones a BD local
dotnet ef database update
```

#### Paso 4: Ejecutar

```bash
dotnet run
# Ahora usará la BD local en desarrollo
```

---

## 🔍 Verificación y Debugging

### Verificar Conexión a la BD

Abre en el navegador:
```
https://localhost:7229/test-db
```

Respuesta esperada:
```json
"✅ Conexión OK. Total usuarios: X"
```

### Ver Logs de la Aplicación

En la consola donde ejecutaste `dotnet run`, verás:
```
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (XXms) [Parameters=[...], CommandType='Text', CommandTimeout='30']
      SELECT COUNT(*) FROM [Usuarios]
```

### Verificar Llamadas API en el Navegador

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Filtra por "Fetch/XHR"
4. Verás todas las llamadas API con:
   - URL completa
   - Método (GET, POST, etc.)
   - Status code
   - Response

---

## 📝 Resumen de Comandos Útiles

```bash
# Iniciar aplicación en desarrollo
dotnet run

# Iniciar con perfil específico
dotnet run --launch-profile https

# Verificar migraciones
dotnet ef migrations list

# Aplicar migraciones (si cambias a MigrateAsync)
dotnet ef database update

# Verificar conexión a BD
curl https://localhost:7229/test-db
```

---

## 🎯 Checklist de Configuración

- [x] Cadena de conexión configurada en `appsettings.json`
- [x] BD remota accesible desde tu máquina
- [x] Frontend detecta automáticamente el entorno
- [x] CORS configurado para localhost en desarrollo
- [x] Swagger habilitado solo en desarrollo
- [x] Endpoint `/test-db` disponible para verificar conexión

---

## ⚠️ Notas Importantes

1. **`EnsureCreatedAsync()` vs `MigrateAsync()`**:
   - Actualmente usas `EnsureCreatedAsync()` que NO aplica migraciones
   - Si cambias el modelo, la BD no se actualiza automáticamente
   - Recomendación: Cambiar a `MigrateAsync()` para aplicar migraciones

2. **Swagger en Producción**:
   - Actualmente deshabilitado (solo en Development)
   - Los endpoints funcionan igual sin Swagger
   - Si necesitas Swagger en producción, habilitarlo con restricciones de seguridad

3. **Misma BD en Local y Producción**:
   - Cuidado al hacer pruebas que modifiquen datos
   - Considera usar una BD de desarrollo separada

---

## 🆘 Solución de Problemas

### Error: "Cannot open database"

**Solución**: Verifica que:
- La cadena de conexión sea correcta
- El servidor remoto esté accesible
- Las credenciales sean válidas

### Error: CORS en localhost:5500

**Solución**: Ya está configurado en `Program.cs`, pero verifica que:
- El backend esté corriendo
- El origen `http://localhost:5500` esté permitido

### Swagger no aparece

**Solución**: 
- Verifica que `ASPNETCORE_ENVIRONMENT=Development`
- Accede a `https://localhost:7229/swagger` (no `/swagger/index.html`)

---

¿Necesitas ayuda con alguna parte específica? 🚀


