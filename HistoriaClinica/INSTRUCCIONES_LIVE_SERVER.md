# 📺 Cómo Ver index.html con Recarga en Tiempo Real

Hay varias formas de ver `index.html` con recarga automática cuando haces cambios:

## 🎯 Opción 1: Live Server (Recomendado para VS Code)

### Paso 1: Instalar la extensión Live Server
1. Abre VS Code
2. Ve a la pestaña de Extensiones (Ctrl+Shift+X)
3. Busca "Live Server" de Ritwick Dey
4. Haz clic en "Instalar"

### Paso 2: Usar Live Server
**Método A - Desde el explorador de archivos:**
1. Abre el archivo `wwwroot/index.html` en VS Code
2. Haz clic derecho en el archivo
3. Selecciona "Open with Live Server"
4. Se abrirá automáticamente en `http://localhost:5500/index.html`

**Método B - Desde la barra de estado:**
1. Abre cualquier archivo HTML en VS Code
2. Haz clic en el botón "Go Live" en la barra de estado (esquina inferior derecha)
3. Se abrirá automáticamente en el navegador

**Método C - Atajo de teclado:**
- Presiona `Alt+L` luego `Alt+O` para iniciar Live Server

### Configuración
La configuración de Live Server ya está lista en `.vscode/settings.json`:
- Puerto: 5500
- Directorio raíz: wwwroot
- Archivo por defecto: index.html

---

## 🐍 Opción 2: Script Python (si tienes Python instalado)

1. Abre PowerShell o Terminal en la raíz del proyecto
2. Ejecuta:
```bash
python serve-html.py
```
3. Se abrirá automáticamente en `http://localhost:5500/index.html`
4. Presiona `Ctrl+C` para detener el servidor

---

## 💻 Opción 3: Script PowerShell (Solo Windows)

1. Abre PowerShell en la raíz del proyecto
2. Ejecuta:
```powershell
.\serve-html.ps1
```
3. Se abrirá automáticamente en `http://localhost:5500/index.html`
4. Presiona `Ctrl+C` para detener el servidor

**Nota:** Si tienes problemas de ejecución de scripts en PowerShell, ejecuta primero:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🚀 Opción 4: Servidor ASP.NET Core (Para desarrollo completo)

Si necesitas probar la integración completa con la API:

1. Ejecuta el proyecto ASP.NET Core:
```bash
dotnet run
```

2. Abre en el navegador:
- `http://localhost:5000/index.html` (HTTP)
- `https://localhost:7229/index.html` (HTTPS)

**Ventaja:** Funciona con la API completa y autenticación
**Desventaja:** No tiene recarga automática (necesitas refrescar manualmente)

---

## ⚡ Opción 5: Extensión "Live Preview" de Microsoft

1. Instala la extensión "Live Preview" de Microsoft
2. Abre `wwwroot/index.html`
3. Haz clic derecho → "Show Preview" o presiona `Ctrl+Shift+V`
4. Se abrirá una vista previa con recarga automática

---

## 🔧 Solución de Problemas

### Live Server no se abre
- Verifica que el puerto 5500 no esté en uso
- Reinicia VS Code
- Verifica que la extensión esté instalada correctamente

### Los cambios no se reflejan
- Asegúrate de guardar el archivo (Ctrl+S)
- Verifica que Live Server esté corriendo (verás "Port: 5500" en la barra de estado)
- Refresca el navegador manualmente (F5)

### Problemas con rutas de archivos
- Asegúrate de que todos los archivos estén en `wwwroot/`
- Verifica que las rutas en HTML sean relativas (ej: `css/styles.css`, no `/css/styles.css`)

---

## 📝 Nota Importante

Si `index.html` hace llamadas a la API, necesitarás:
- **Para desarrollo local:** Usar la Opción 4 (dotnet run) o configurar CORS correctamente
- **Para solo ver el HTML/CSS/JS:** Cualquiera de las opciones 1-3 funcionará perfectamente

---

## ✅ Recomendación

Para desarrollo rápido de HTML/CSS/JS: **Opción 1 (Live Server)**
Para desarrollo completo con API: **Opción 4 (dotnet run)**

