# 📎 Instrucciones para Probar Archivos Adjuntos

## ✅ **Funcionalidad Implementada:**

### **Backend:**
- ✅ Endpoint para subir archivos: `POST /api/pacientes/archivos/subir`
- ✅ Endpoint para descargar archivos: `GET /api/pacientes/archivos/{nombreArchivo}`
- ✅ Almacenamiento de archivos en `wwwroot/uploads/`
- ✅ Validación de tipos de archivo (PDF, imágenes, documentos)
- ✅ Límite de tamaño: 10MB por archivo
- ✅ Límite de cantidad: 5 archivos por consulta

### **Frontend:**
- ✅ Interfaz para seleccionar archivos
- ✅ Visualización de archivos en consultas
- ✅ Enlaces de descarga
- ✅ Iconos según tipo de archivo
- ✅ Estilos CSS atractivos

## 🧪 **Cómo Probar:**

### **Opción 1: Versión Local (Recomendada)**
1. **Abrir navegador** en: `http://localhost:5156/historia.html?id=156`
2. **Hacer clic** en "Nueva Consulta"
3. **Seleccionar archivos** en la sección "Archivos Adjuntos"
4. **Completar motivo** (requerido)
5. **Hacer clic** en "Guardar Consulta"
6. **Verificar** que los archivos aparezcan en la consulta creada
7. **Hacer clic** en los enlaces para descargar

### **Opción 2: Versión de Producción**
1. **Abrir navegador** en: `https://historia.runasp.net/historia.html?id=156`
2. **Seguir los mismos pasos** que en la versión local

## 🔧 **Archivos Modificados:**

### **Backend:**
- `Controllers/PacientesController.cs` - Endpoints de archivos
- `Models/ArchivoConsulta.cs` - Modelo de archivos
- `Models/Consulta.cs` - Campo ArchivosJson

### **Frontend:**
- `wwwroot/js/historia.js` - Lógica de subida y visualización
- `wwwroot/css/styles.css` - Estilos para archivos
- `wwwroot/historia.html` - CSP para Font Awesome

## 🐛 **Problemas Solucionados:**

1. **Error 405 Method Not Allowed** - Agregado endpoint POST para crear consultas
2. **Error 405 Method Not Allowed** - Agregado endpoint PUT para actualizar pacientes
3. **Archivos no se muestran** - Implementada funcionalidad completa
4. **Errores CSP** - Configurado Content Security Policy para Font Awesome

## 📋 **Tipos de Archivo Soportados:**

- **PDF**: `.pdf`
- **Imágenes**: `.jpg`, `.jpeg`, `.png`, `.gif`
- **Documentos**: `.doc`, `.docx`, `.txt`

## 🚀 **Estado Actual:**

- ✅ **Compilación**: Exitosa
- ✅ **Aplicación**: Ejecutándose en puerto 5156
- ✅ **Base de datos**: Conectada
- ✅ **Funcionalidad**: Completamente implementada

## 📞 **Soporte:**

Si encuentras algún problema:
1. Revisar la consola del navegador (F12)
2. Verificar que la aplicación esté ejecutándose
3. Comprobar que los archivos se suban correctamente
4. Verificar que los archivos aparezcan en las consultas

¡La funcionalidad de archivos adjuntos está completamente operativa! 🎉
















