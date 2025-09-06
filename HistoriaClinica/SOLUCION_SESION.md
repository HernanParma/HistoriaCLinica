# Solución para el Problema de Sesiones

## Problema Identificado

Cuando navegas normalmente (con cookies y sesión activa), no se muestran los datos del paciente, pero en modo incógnito sí funciona. Esto se debe a inconsistencias en la gestión de tokens JWT.

## Causa Raíz

- **Múltiples claves de token**: El sistema usaba diferentes claves (`userToken`, `jwtToken`, `token`, `authToken`, `accessToken`)
- **Inconsistencia en localStorage**: Los tokens se guardaban en diferentes claves, causando conflictos
- **Falta de validación**: No se validaba el formato o validez de los tokens antes de usarlos
- **Gestión de sesión conflictiva**: Indicadores de login obsoletos cuando los tokens expiraban

## Solución Implementada

### 1. Unificación de Tokens
- **Clave única**: Todos los tokens ahora se guardan en `jwtToken`
- **Limpieza automática**: Se eliminan automáticamente las claves duplicadas
- **Migración automática**: Los tokens existentes se migran a la nueva clave

### 2. Validación de Tokens
- **Formato JWT**: Se verifica que el token tenga el formato correcto (3 partes separadas por puntos)
- **Limpieza automática**: Los tokens inválidos se eliminan automáticamente
- **Renovación automática**: Se intenta renovar tokens expirados

### 3. Gestión de Sesión Mejorada
- **Limpieza de sesión**: Se resuelven conflictos entre indicadores de login y tokens
- **Login automático**: Cuando falla la autenticación, se intenta login automático
- **Debug mejorado**: Información detallada del estado de la sesión

### 4. Interfaz de Debug
- **Botón de debug**: Permite ver el estado actual de la sesión
- **Información detallada**: Muestra tokens, localStorage, sessionStorage y configuración
- **Logs en consola**: Información detallada para debugging

## Archivos Modificados

### `wwwroot/js/historia.js`
- ✅ Unificación de gestión de tokens
- ✅ Validación automática de tokens JWT
- ✅ Limpieza automática de sesiones conflictivas
- ✅ Login automático mejorado
- ✅ Funciones de debug y validación

### `wwwroot/js/config.js`
- ✅ Clave de token unificada a `jwtToken`

### `wwwroot/historia.html`
- ✅ Botón de debug agregado
- ✅ Panel de información de debug

### `wwwroot/css/styles.css`
- ✅ Estilos para botón de debug y panel de información

## Cómo Probar la Solución

### 1. Probar en Navegación Normal
1. Abre la aplicación en una ventana normal (no incógnito)
2. Inicia sesión con usuario `admin` y contraseña `admin123`
3. Navega a la historia clínica de un paciente
4. Verifica que se muestren los datos correctamente

### 2. Probar el Botón de Debug
1. En la página de historia clínica, haz clic en el botón "🐛 Debug"
2. Revisa la información mostrada:
   - Estado del token
   - Configuración de la API
   - Contenido del localStorage y sessionStorage

### 3. Probar en Consola del Navegador
1. Abre las herramientas de desarrollador (F12)
2. Ve a la consola
3. Ejecuta: `testSession.runAllTests()`
4. Revisa los logs de las pruebas de sesión

### 4. Verificar Limpieza Automática
1. En la consola, ejecuta:
   ```javascript
   // Simular estado conflictivo
   localStorage.setItem('userToken', 'old-token');
   localStorage.setItem('jwtToken', 'new-token');
   localStorage.setItem('token', 'conflict-token');
   
   // Recargar la página para activar la limpieza automática
   window.location.reload();
   ```

## Funciones de Debug Disponibles

### En la Consola del Navegador
- `testSession.runAllTests()` - Ejecuta todas las pruebas
- `testSession.testSessionStates()` - Prueba diferentes estados de sesión
- `testSession.testTokenCleanup()` - Prueba la limpieza de tokens
- `testSession.testTokenValidation()` - Prueba la validación de tokens

### En la Interfaz
- Botón "🐛 Debug" - Muestra información de debug en la página
- Logs detallados en la consola con emojis para fácil identificación

## Logs de Debug

El sistema ahora proporciona logs detallados con emojis:

- 🚀 - Inicio de operaciones
- 🔍 - Búsqueda/verificación
- ✅ - Operación exitosa
- ❌ - Error
- 🔄 - Reintento/renovación
- 🧹 - Limpieza
- 🔑 - Token/autenticación
- 📡 - Respuesta del servidor
- 💾 - Guardado de datos
- 🐛 - Información de debug

## Estado Esperado Después de la Solución

1. **Tokens unificados**: Solo debe existir la clave `jwtToken`
2. **Sesión consistente**: `isLoggedIn` y `username` deben coincidir con el token
3. **Funcionamiento normal**: Los datos del paciente deben mostrarse en navegación normal
4. **Login automático**: Debe funcionar cuando expire la sesión
5. **Debug disponible**: Información clara del estado de la sesión

## Troubleshooting

### Si el problema persiste:
1. Abre las herramientas de desarrollador (F12)
2. Ve a la consola y revisa los logs
3. Haz clic en el botón "🐛 Debug" para ver el estado actual
4. Verifica que solo exista la clave `jwtToken` en localStorage
5. Si hay conflictos, recarga la página para activar la limpieza automática

### Comandos útiles en consola:
```javascript
// Ver estado actual
console.log('localStorage:', Object.keys(localStorage));
console.log('sessionStorage:', Object.keys(sessionStorage));

// Limpiar manualmente si es necesario
localStorage.clear();
sessionStorage.clear();

// Verificar token actual
console.log('Token actual:', localStorage.getItem('jwtToken'));
```

## Notas Técnicas

- **Compatibilidad**: La solución es compatible con navegadores modernos
- **Performance**: La limpieza automática se ejecuta solo al cargar la página
- **Seguridad**: Los tokens inválidos se eliminan automáticamente
- **Mantenimiento**: La solución es autodocumentada con logs detallados









