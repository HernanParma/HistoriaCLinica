# 🎭 Modo Demostración - Sistema de Historia Clínica

## 📋 Descripción

El **Modo Demostración** es una funcionalidad especial que te permite mostrar el funcionamiento completo de tu sistema de historia clínica sin exponer datos reales de pacientes. Incluye 20 pacientes ficticios con datos completamente realistas pero falsos.

## 🚀 Características

### ✅ Datos Incluidos
- **20 Pacientes Ficticios** con nombres, apellidos, DNI y datos personales realistas
- **Consultas Médicas** (2-5 por paciente) con motivos, recetas y OME
- **Medicaciones** comunes y realistas
- **Antecedentes Médicos** típicos
- **Valores de Laboratorio** dentro de rangos normales
- **Datos de Contacto** (teléfonos, emails ficticios)
- **Obras Sociales** reales (PAMI, OSDE, Swiss Medical, etc.)

### 🎯 Casos de Uso
- **Presentaciones a Clientes**: Mostrar funcionalidades sin exponer datos reales
- **Capacitación**: Enseñar a nuevos usuarios cómo usar el sistema
- **Demostraciones**: Exhibir el sistema en ferias o eventos
- **Testing**: Probar funcionalidades con datos consistentes

## 🛠️ Cómo Usar

### 1. Acceder a la Administración
1. Inicia sesión en el sistema
2. Haz clic en tu nombre de usuario (esquina superior derecha)
3. Selecciona **"Administración Demo"**

### 2. Generar Datos de Demostración
1. En la página de administración, haz clic en **"Generar Datos Demo"**
2. Espera a que se creen los 20 pacientes ficticios
3. Verás un mensaje de confirmación

### 3. Usar el Sistema Normalmente
- Los pacientes de demo aparecerán en la lista principal
- Puedes abrir sus historias clínicas
- Ver consultas, medicaciones, antecedentes
- Agregar nuevas consultas
- Editar datos (se marcan como "DEMO" en el apellido)

### 4. Limpiar Datos de Demostración
1. Ve a **"Administración Demo"**
2. Haz clic en **"Limpiar Datos Demo"**
3. Confirma la eliminación
4. Todos los pacientes ficticios serán eliminados

## 🔍 Identificación de Datos Demo

### En la Lista de Pacientes
- Los apellidos incluyen la palabra **"DEMO"**
- Ejemplo: "González DEMO", "Rodríguez DEMO"

### Indicador Visual
- Cuando el modo demo está activo, aparece una **barra azul** en la parte superior
- Muestra: "Modo Demo Activo - X pacientes ficticios"
- Puedes cerrarla haciendo clic en la "X"

### En el Menú de Usuario
- Aparece la opción **"Administración Demo"** cuando estás logueado

## 📊 Datos Generados

### Pacientes (20 total)
- **Nombres**: María, Carlos, Ana, Luis, Laura, Roberto, Sofía, Diego, etc.
- **Apellidos**: González, Rodríguez, Martínez, Fernández, López, etc.
- **DNI**: Números ficticios únicos
- **Edades**: Entre 25 y 60 años
- **Obras Sociales**: PAMI, OSDE, Swiss Medical, Galeno, Medicus

### Consultas (2-5 por paciente)
- **Motivos**: Control de presión, diabetes, dolor de cabeza, etc.
- **Recetas**: Medicamentos comunes (Metformina, Losartan, etc.)
- **OME**: "Control en 30 días"
- **Laboratorio**: Valores dentro de rangos normales

### Medicaciones
- Metformina 850mg
- Losartan 50mg
- Atorvastatina 20mg
- Omeprazol 20mg
- AAS 100mg
- Y más...

### Antecedentes
- Hipertensión arterial
- Diabetes tipo 2
- Dislipidemia
- Hipotiroidismo
- Artrosis
- Gastritis
- Ansiedad
- Depresión
- Asma
- Migraña

## ⚠️ Consideraciones Importantes

### Seguridad
- Los datos son **completamente ficticios**
- No hay riesgo de exposición de información real
- Los emails y teléfonos son inventados

### Rendimiento
- Los datos se generan una sola vez
- No afectan el rendimiento del sistema
- Se pueden eliminar fácilmente

### Uso Recomendado
- **Solo para demostraciones**
- **No para uso productivo**
- **Limpiar después de cada presentación**

## 🔧 Endpoints de API

### Generar Datos Demo
```
POST /api/pacientes/generar-datos-demo
```

### Limpiar Datos Demo
```
DELETE /api/pacientes/limpiar-datos-demo
```

### Verificar Estado
```
GET /api/pacientes/con-notificaciones
```
(Filtra pacientes que contengan "DEMO" en nombre o apellido)

## 🎨 Personalización

Si necesitas modificar los datos de demostración:

1. **Edita el archivo**: `Controllers/PacientesController.cs`
2. **Busca la función**: `GenerarPacientesDemo()`
3. **Modifica los arrays**:
   - `datosPacientes`: Información personal
   - `motivosConsulta`: Motivos de consulta
   - `medicaciones`: Medicamentos
   - `antecedentes`: Antecedentes médicos

## 📞 Soporte

Si tienes problemas con el modo demo:

1. Verifica que estés logueado correctamente
2. Asegúrate de tener permisos de administración
3. Revisa la consola del navegador (F12) para errores
4. Intenta limpiar y regenerar los datos

## 🎉 ¡Listo para Demostrar!

Con el modo demo activado, puedes mostrar todas las funcionalidades de tu sistema de historia clínica de manera profesional y segura, sin preocuparte por la privacidad de los datos reales.

---

**Desarrollado con ❤️ para facilitar las demostraciones del Sistema de Historia Clínica**


