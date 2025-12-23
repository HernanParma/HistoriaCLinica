# 🚀 Solución: Cómo Abrir index.html con Live Server

## ❌ Problema
Estás en la carpeta incorrecta: `C:\Users\herna\source\repos\HistoriaClinica`
El proyecto está en: `C:\Users\herna\source\repos\HistoriaClinica\HistoriaClinica`

## ✅ Solución Paso a Paso

### Opción 1: Desde VS Code (Recomendado)

1. **Cierra VS Code si está abierto**

2. **Abre VS Code desde la carpeta correcta:**
   ```powershell
   # En PowerShell, ejecuta:
   cd C:\Users\herna\source\repos\HistoriaClinica\HistoriaClinica
   code .
   ```

3. **O desde el Explorador de Archivos:**
   - Navega a: `C:\Users\herna\source\repos\HistoriaClinica\HistoriaClinica`
   - Click derecho en la carpeta
   - Selecciona "Abrir con Code" o "Open with Code"

4. **Abre index.html con Live Server:**
   - En VS Code, ve a `wwwroot/index.html`
   - Click derecho en `index.html`
   - Selecciona "Open with Live Server"
   - O haz click en el botón "Go Live" en la barra de estado (esquina inferior derecha)

### Opción 2: Desde PowerShell (Rápido)

1. **Abre PowerShell**

2. **Navega a la carpeta correcta:**
   ```powershell
   cd C:\Users\herna\source\repos\HistoriaClinica\HistoriaClinica
   ```

3. **Ejecuta el servidor Python:**
   ```powershell
   python serve-html.py
   ```

4. **Se abrirá automáticamente en:** `http://localhost:5500/index.html`

### Opción 3: Servidor ASP.NET Core (Completo con API)

1. **Abre PowerShell**

2. **Navega a la carpeta correcta:**
   ```powershell
   cd C:\Users\herna\source\repos\HistoriaClinica\HistoriaClinica
   ```

3. **Ejecuta el proyecto:**
   ```powershell
   dotnet run
   ```

4. **Abre en el navegador:**
   - `https://localhost:7229` (HTTPS)
   - `http://localhost:5000` (HTTP)

## 🔍 Verificar que estás en la carpeta correcta

La carpeta debe contener estos archivos:
- ✅ `HistoriaClinica.csproj`
- ✅ `Program.cs`
- ✅ `wwwroot/` (carpeta)
- ✅ `serve-html.py`
- ✅ `index.html` (dentro de `wwwroot/`)

## ⚠️ Si Live Server no aparece en el menú contextual

1. **Instala la extensión Live Server:**
   - Abre VS Code
   - Ve a Extensiones (Ctrl+Shift+X)
   - Busca "Live Server" de Ritwick Dey
   - Click en "Instalar"

2. **Reinicia VS Code**

3. **Abre la carpeta correcta:**
   - File → Open Folder
   - Selecciona: `C:\Users\herna\source\repos\HistoriaClinica\HistoriaClinica`

## 📝 Comandos Rápidos

```powershell
# Navegar a la carpeta correcta
cd C:\Users\herna\source\repos\HistoriaClinica\HistoriaClinica

# Opción A: Servidor Python simple
python serve-html.py

# Opción B: Servidor ASP.NET Core completo
dotnet run

# Opción C: Abrir VS Code desde aquí
code .
```

## ✅ Verificación Final

Si todo está bien, deberías ver:
- ✅ El servidor corriendo sin errores
- ✅ El navegador abriéndose automáticamente
- ✅ La página `index.html` cargando correctamente
- ✅ Sin errores en la consola del navegador (F12)

---

**¿Sigue fallando?** Asegúrate de estar en la carpeta `HistoriaClinica\HistoriaClinica` (la subcarpeta, no la raíz).

