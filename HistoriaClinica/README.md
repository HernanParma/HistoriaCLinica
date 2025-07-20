# Sistema de Historia Clínica

## Descripción
Sistema web para gestión de historias clínicas de pacientes con autenticación de usuarios y registro de nuevos usuarios.

## Características
- **Autenticación de usuarios**: Login seguro con hash de contraseñas
- **Registro de usuarios**: Creación de nuevas cuentas de usuario
- **Registro de pacientes**: Formulario completo con validaciones (solo para usuarios autenticados)
- **Interfaz moderna**: Diseño responsive y profesional
- **Validaciones en tiempo real**: Feedback inmediato al usuario
- **Gestión de sesiones**: Control de acceso y logout

## Tecnologías Utilizadas
- **Backend**: ASP.NET Core 8.0
- **Base de Datos**: SQL Server con Entity Framework
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Iconos**: Font Awesome
- **Estilos**: CSS Grid y Flexbox

## Estructura del Proyecto
```
HistoriaClinica/
├── Controllers/
│   ├── UsuariosController.cs    # API para autenticación y registro
│   └── PacientesController.cs   # API para gestión de pacientes
├── Models/
│   ├── Usuario.cs              # Modelo de usuario
│   └── Paciente.cs             # Modelo de paciente
├── Data/
│   ├── AppDbContext.cs         # Contexto de base de datos
│   └── SeedData.cs             # Datos iniciales
├── wwwroot/
│   ├── index.html              # Página principal
│   ├── css/
│   │   └── styles.css          # Estilos de la aplicación
│   └── js/
│       ├── app.js              # Lógica del frontend
│       └── config.js           # Configuración
└── Program.cs                  # Configuración de la aplicación
```

## Instalación y Configuración

### Prerrequisitos
- .NET 8.0 SDK
- SQL Server (LocalDB, Express o Developer Edition)
- Visual Studio 2022 o VS Code

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd HistoriaClinica
   ```

2. **Configurar la base de datos**
   - Asegúrate de que SQL Server esté ejecutándose
   - Actualiza la cadena de conexión en `appsettings.json`
   - Ejecuta las migraciones:
   ```bash
   dotnet ef database update
   ```

3. **Ejecutar la aplicación**
   ```bash
   dotnet run
   ```

4. **Acceder a la aplicación**
   - Abre tu navegador en: `https://localhost:7000` o `http://localhost:5000`
   - La API estará disponible en: `https://localhost:7000/api/`

## Uso de la Aplicación

### 1. Registro de Usuario
- Navega a la aplicación
- Haz clic en "Registrar Usuario"
- Completa los campos:
  - **Nombre de Usuario** (debe ser único)
  - **Contraseña** (mínimo 6 caracteres)
  - **Confirmar Contraseña**
- El sistema validará que las contraseñas coincidan
- Después del registro exitoso, serás redirigido al login

### 2. Iniciar Sesión
- Usa las credenciales que acabas de crear o las por defecto:
  - Usuario: `admin`
  - Contraseña: `admin123`
- Haz clic en "Ingresar"
- Serás redirigido al formulario de registro de pacientes

### 3. Registrar Paciente (Solo para usuarios autenticados)
- Completa los campos obligatorios:
  - **DNI** (7 u 8 dígitos)
  - **Número de Afiliado**
  - **Nombre**
  - **Apellido**
- Los campos opcionales incluyen:
  - Email
  - Teléfono
  - Obra Social
  - Fecha de Nacimiento
  - Antecedentes Médicos
  - Medicación Actual
  - Motivo de Consulta

### 4. Cerrar Sesión
- Usa el botón "Cerrar Sesión" en la esquina superior derecha
- Volverás a la página de login

## API Endpoints

### Autenticación
- `POST /api/usuarios/login` - Iniciar sesión
- `POST /api/usuarios/registrar` - Registrar nuevo usuario

### Pacientes
- `POST /api/pacientes` - Crear nuevo paciente
- `GET /api/pacientes/{id}` - Obtener paciente por ID

## Configuración de Base de Datos

### Cadena de Conexión
Actualiza `appsettings.json` con tu configuración:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HistoriaClinica;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### Migraciones
Para crear una nueva migración:
```bash
dotnet ef migrations add NombreDeLaMigracion
```

Para aplicar migraciones:
```bash
dotnet ef database update
```

## Características de Seguridad

- **Hash de contraseñas**: Las contraseñas se almacenan hasheadas
- **Validación de entrada**: Todos los campos se validan en el frontend y backend
- **Control de acceso**: Solo usuarios autenticados pueden registrar pacientes
- **CORS configurado**: Permite acceso desde cualquier origen (configurar según necesidades)
- **Validación de contraseñas**: Mínimo 6 caracteres y confirmación requerida

## Flujo de la Aplicación

```
1. Página Principal
   ├── Iniciar Sesión (con credenciales existentes)
   └── Registrar Usuario (crear nuevas credenciales)

2. Después del Login
   ├── Formulario de Registro de Pacientes
   └── Botón Cerrar Sesión

3. Registro de Usuario
   ├── Validación de contraseñas
   ├── Verificación de usuario único
   └── Redirección automática al login
```

## Personalización

### Cambiar Colores
Edita `wwwroot/css/styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #56ab2f;
}
```

### Agregar Campos
1. Actualiza el modelo `Paciente.cs`
2. Crea una nueva migración
3. Actualiza el formulario HTML
4. Modifica la lógica JavaScript

## Solución de Problemas

### Error de Conexión a Base de Datos
- Verifica que SQL Server esté ejecutándose
- Confirma la cadena de conexión en `appsettings.json`
- Asegúrate de que las migraciones estén aplicadas

### Error de CORS
- Verifica la configuración de CORS en `Program.cs`
- Asegúrate de que el frontend y backend estén en el mismo dominio

### Problemas de Validación
- Revisa la consola del navegador para errores JavaScript
- Verifica que todos los campos requeridos estén completos
- Para registro de usuario: contraseña mínima 6 caracteres

### Usuario ya Existe
- Si intentas registrar un usuario que ya existe, el sistema te avisará
- Usa un nombre de usuario diferente

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo. 