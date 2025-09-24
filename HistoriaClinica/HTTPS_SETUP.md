# Configuración de HTTPS para Historia Clínica

## Problema Resuelto

Cuando habilitas HTTPS en tu host, la aplicación puede romperse debido a:
- Configuraciones de CORS incorrectas
- URLs hardcodeadas para desarrollo
- Falta de redirección HTTPS
- Headers de seguridad faltantes

## Solución Implementada

### 1. Archivos de Configuración

#### `Program.cs`
- ✅ Redirección HTTPS automática en producción
- ✅ Headers de seguridad configurados
- ✅ CORS configurado según el entorno
- ✅ Middleware de seguridad

#### `web.config`
- ✅ Reglas de redirección HTTP → HTTPS
- ✅ Headers de seguridad para IIS
- ✅ Compresión habilitada
- ✅ Configuración de ASP.NET Core

#### `appsettings.Production.json`
- ✅ Configuración específica para producción
- ✅ Seguridad HTTPS habilitada
- ✅ CORS restringido a HTTPS
- ✅ Headers de seguridad

#### `appsettings.Development.json`
- ✅ Configuración específica para desarrollo
- ✅ CORS permite Live Server
- ✅ HTTPS no requerido
- ✅ Configuración flexible

### 2. Archivos JavaScript

#### `js/environment-config.js` (NUEVO)
- ✅ Detecta automáticamente el entorno
- ✅ Configura URLs según el contexto
- ✅ Soporte para Live Server en desarrollo
- ✅ URLs relativas en producción

#### `js/production-urls.js` (NUEVO)
- ✅ Helper para URLs absolutas
- ✅ Redirecciones seguras
- ✅ Detección de HTTPS
- ✅ Manejo de rutas

### 3. Archivos HTML Actualizados

Todos los archivos HTML ahora usan `environment-config.js` en lugar de `config.js`:
- ✅ `index.html`
- ✅ `login.html`
- ✅ `agregar.html`
- ✅ `historia.html`

## Pasos para Desplegar con HTTPS

### 1. En tu Host
- ✅ Habilita HTTPS/SSL
- ✅ Configura el certificado SSL
- ✅ Asegúrate de que el puerto 443 esté abierto

### 2. En tu Aplicación
- ✅ Despliega los archivos actualizados
- ✅ El `web.config` manejará las redirecciones
- ✅ La configuración de producción se activará automáticamente

### 3. Verificación
- ✅ Accede a tu sitio con `https://`
- ✅ Verifica que `http://` redirija a `https://`
- ✅ Revisa la consola del navegador para logs de configuración

## Configuraciones de Seguridad Implementadas

### Headers de Seguridad
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'`

### Redirección HTTPS
- Redirección automática HTTP → HTTPS
- HSTS configurado para producción
- Headers de seguridad automáticos

### CORS
- Desarrollo: Permite Live Server y localhost
- Producción: Solo HTTPS, dominio específico

## Troubleshooting

### Si la página sigue rompiéndose:

1. **Verifica la consola del navegador**
   - Busca errores de JavaScript
   - Verifica que `environment-config.js` se cargue

2. **Verifica la configuración del host**
   - HTTPS debe estar habilitado
   - Puerto 443 debe estar abierto
   - Certificado SSL debe ser válido

3. **Verifica los logs del servidor**
   - Revisa los logs de la aplicación
   - Verifica que no haya errores de CORS

4. **Verifica la configuración de IIS**
   - El módulo de reescritura debe estar instalado
   - Las reglas de redirección deben estar activas

### Logs de Debugging

La aplicación ahora incluye logs detallados:
- 🔧 Configuración de desarrollo
- 🚀 Configuración de producción
- 🌐 URLs de API detectadas
- 🔒 Estado de HTTPS

## Archivos Modificados

- `Program.cs` - Configuración de seguridad y HTTPS
- `web.config` - Reglas de IIS y redirección
- `appsettings.Production.json` - Configuración de producción
- `appsettings.Development.json` - Configuración de desarrollo
- `js/environment-config.js` - Configuración automática de entorno
- `js/production-urls.js` - Helper de URLs para producción
- Todos los archivos HTML - Actualizados para usar nueva configuración

## Notas Importantes

- **Nunca** fuerces el environment en `Program.cs`
- La configuración se detecta automáticamente
- En desarrollo, Live Server seguirá funcionando
- En producción, HTTPS será obligatorio
- Los headers de seguridad se aplican automáticamente

## Soporte

Si sigues teniendo problemas:
1. Revisa los logs de la consola del navegador
2. Verifica que todos los archivos se hayan actualizado
3. Asegúrate de que HTTPS esté habilitado en tu host
4. Verifica que el certificado SSL sea válido



































