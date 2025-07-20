# 🚀 Instrucciones Rápidas - Sistema de Historia Clínica

## ⚡ Inicio Rápido

### 1. Ejecutar la Aplicación
```bash
cd HistoriaClinica
dotnet run
```

### 2. Acceder a la Aplicación
- **URL**: `https://localhost:7000` o `http://localhost:5000`
- **API Swagger**: `https://localhost:7000/swagger`

### 3. Credenciales por Defecto
- **Usuario**: `admin`
- **Contraseña**: `admin123`

## 📋 Funcionalidades

### 🔐 Login
1. Ingresa con las credenciales por defecto
2. El sistema te redirigirá automáticamente al formulario de pacientes

### 👤 Registrar Usuario
1. Haz clic en "Registrar Usuario" en la navegación
2. Completa los campos:
   - **Nombre de Usuario** (único)
   - **Contraseña** (mínimo 6 caracteres)
   - **Confirmar Contraseña**
3. El sistema validará que las contraseñas coincidan
4. Después del registro exitoso, serás redirigido al login

### 👥 Registrar Paciente (Solo después del login)
1. Después del login exitoso, serás redirigido al formulario de registro de pacientes
2. Completa los campos obligatorios:
   - **DNI** (7 u 8 dígitos)
   - **Número de Afiliado**
   - **Nombre**
   - **Apellido**

3. Campos opcionales:
   - Email
   - Teléfono
   - Obra Social
   - Fecha de Nacimiento
   - Antecedentes Médicos
   - Medicación Actual
   - Motivo de Consulta

4. Usa el botón "Cerrar Sesión" para volver al login

## 🛠️ Configuración de Base de Datos

### Si usas LocalDB (recomendado para desarrollo):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HistoriaClinica;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### Si usas SQL Server Express:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=HistoriaClinica;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### Aplicar Migraciones:
```bash
dotnet ef database update
```

## 🔧 Solución de Problemas

### Error de Conexión a Base de Datos
1. Verifica que SQL Server esté ejecutándose
2. Confirma la cadena de conexión en `appsettings.json`
3. Ejecuta: `dotnet ef database update`

### Error de CORS
- La aplicación ya tiene CORS configurado para desarrollo
- Si persiste, verifica que estés accediendo desde `localhost`

### Problemas de Validación
- Revisa la consola del navegador (F12)
- Verifica que todos los campos requeridos estén completos
- Para registro de usuario: contraseña mínima 6 caracteres

### Usuario ya Existe
- Si intentas registrar un usuario que ya existe, el sistema te avisará
- Usa un nombre de usuario diferente

## 📱 Características del Frontend

- **Diseño Responsive**: Funciona en móviles y tablets
- **Validaciones en Tiempo Real**: Feedback inmediato
- **Animaciones Suaves**: Transiciones profesionales
- **Mensajes de Estado**: Confirmaciones y errores claros
- **Persistencia de Sesión**: Mantiene el login activo
- **Navegación Intuitiva**: Entre login, registro de usuario y pacientes

## 🎨 Personalización

### Cambiar Colores
Edita `wwwroot/css/styles.css`:
```css
:root {
    --primary-color: #667eea;    /* Color principal */
    --secondary-color: #764ba2;  /* Color secundario */
    --success-color: #56ab2f;    /* Color de éxito */
}
```

### Agregar Campos
1. Actualiza `Models/Paciente.cs`
2. Crea migración: `dotnet ef migrations add NuevoCampo`
3. Aplica migración: `dotnet ef database update`
4. Actualiza el formulario HTML
5. Modifica la lógica JavaScript

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (F12)
2. Verifica los logs de la aplicación
3. Confirma que la base de datos esté configurada correctamente

## 🎯 Flujo de la Aplicación

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

## 🎯 Próximos Pasos

- [ ] Agregar listado de pacientes
- [ ] Implementar búsqueda y filtros
- [ ] Agregar edición de pacientes
- [ ] Implementar roles de usuario
- [ ] Agregar reportes y estadísticas
- [ ] Implementar recuperación de contraseña 