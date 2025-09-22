# 🚀 Instrucciones de Acceso a la Aplicación

## ✅ **Problema Solucionado**

El error 500 del servidor ha sido corregido. Los problemas identificados y solucionados fueron:

1. **Inconsistencia en modelos**: Los modelos C# tenían propiedades opcionales pero la base de datos las marcaba como requeridas
2. **Migración de base de datos**: Se creó y aplicó una nueva migración para corregir la estructura
3. **Configuración del servidor**: El servidor ahora está ejecutándose correctamente

## 🌐 **Cómo Acceder a la Aplicación**

### **1. Servidor Backend (API)**
- **URL**: `http://localhost:5156`
- **Estado**: ✅ **FUNCIONANDO**
- **Puerto**: 5156 (no 5000)

### **2. Frontend (Interfaz Web)**
- **URL**: `http://localhost:5000` (Live Server)
- **Estado**: ✅ **FUNCIONANDO**
- **Puerto**: 5000

## 📋 **Pasos para Acceder**

### **Opción 1: Usar Live Server (Recomendado)**
1. Abrir Visual Studio Code
2. Abrir la carpeta del proyecto
3. Hacer clic derecho en `wwwroot/index.html`
4. Seleccionar "Open with Live Server"
5. Se abrirá en `http://localhost:5000`

### **Opción 2: Acceso Directo**
1. Abrir navegador
2. Ir a `http://localhost:5000`
3. La aplicación debería cargar correctamente

## 🔧 **Verificación de Funcionamiento**

### **Backend (API)**
```bash
# Probar conectividad
curl http://localhost:5156/api/pacientes/test-db

# Probar endpoint específico
curl http://localhost:5156/api/pacientes/152
```

### **Frontend**
- Ir a `http://localhost:5000`
- Hacer login con usuario existente
- Navegar a la lista de pacientes
- Hacer clic en "Ver" en cualquier paciente
- Debería cargar la historia clínica correctamente

## 🎯 **Página de Historia Clínica**

Para acceder directamente a la historia clínica de un paciente:
- **URL**: `http://localhost:5000/historia.html?id=152`
- **Reemplazar 152** con el ID del paciente que desees ver

## 🛠️ **Comandos Útiles**

### **Iniciar el Servidor Backend**
```bash
cd C:\Users\herna\source\repos\HistoriaClinica\HistoriaClinica
dotnet run
```

### **Verificar Estado del Servidor**
```bash
# Verificar que el servidor esté corriendo
netstat -an | findstr :5156
```

### **Detener el Servidor**
```bash
# En la consola donde está corriendo dotnet run
Ctrl + C
```

## 🔍 **Solución de Problemas**

### **Si el servidor no inicia:**
1. Verificar que no haya otro proceso usando el puerto 5156
2. Ejecutar: `dotnet build` para verificar errores de compilación
3. Ejecutar: `dotnet run` para iniciar el servidor

### **Si la página no carga:**
1. Verificar que Live Server esté ejecutándose en puerto 5000
2. Verificar que el backend esté ejecutándose en puerto 5156
3. Abrir la consola del navegador (F12) para ver errores

### **Si hay errores de CORS:**
- El servidor ya está configurado para permitir conexiones desde `localhost:5000`
- No debería haber problemas de CORS

## 📊 **Estado Actual**

- ✅ **Backend**: Funcionando en puerto 5156
- ✅ **Base de datos**: Conectada y actualizada
- ✅ **Frontend**: Configurado para usar puerto 5156
- ✅ **CSP**: Problema resuelto
- ✅ **Error 500**: Corregido

## 🎉 **¡Listo para Usar!**

La aplicación está completamente funcional. Puedes:
1. Acceder a `http://localhost:5000`
2. Hacer login
3. Ver la lista de pacientes
4. Acceder a la historia clínica de cualquier paciente
5. Todos los datos se cargarán correctamente

---

**Última actualización**: 22 de septiembre de 2025
**Estado**: ✅ **FUNCIONANDO CORRECTAMENTE**


