# Servidor simple para servir archivos HTML en Windows
# Uso: .\serve-html.ps1

$port = 5500
$directory = "wwwroot"

# Verificar que existe el directorio
if (-not (Test-Path $directory)) {
    Write-Host "❌ Error: No se encuentra el directorio '$directory'" -ForegroundColor Red
    exit 1
}

# Cambiar al directorio del script
Set-Location $PSScriptRoot

Write-Host "🚀 Iniciando servidor en http://localhost:$port" -ForegroundColor Green
Write-Host "📄 Abriendo index.html en el navegador..." -ForegroundColor Cyan
Write-Host "💡 Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host "📁 Sirviendo archivos desde: $(Resolve-Path $directory)" -ForegroundColor Gray
Write-Host ""

# Abrir el navegador
$url = "http://localhost:$port/index.html"
Start-Process $url

# Iniciar servidor HTTP simple
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "✅ Servidor iniciado. Presiona Ctrl+C para detener." -ForegroundColor Green
Write-Host ""

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/" -or $localPath -eq "") {
            $localPath = "/index.html"
        }
        
        $filePath = Join-Path $directory $localPath.TrimStart('/')
        
        # Headers para evitar caché
        $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
        $response.Headers.Add("Pragma", "no-cache")
        $response.Headers.Add("Expires", "0")
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            
            # Determinar content type
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css" }
                ".js" { "application/javascript" }
                ".json" { "application/json" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif" { "image/gif" }
                ".svg" { "image/svg+xml" }
                ".woff" { "font/woff" }
                ".woff2" { "font/woff2" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $contentType
            
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - Archivo no encontrado")
            $response.ContentLength64 = $notFound.Length
            $response.ContentType = "text/plain; charset=utf-8"
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        
        $response.Close()
    }
} catch {
    Write-Host "`n🛑 Servidor detenido" -ForegroundColor Yellow
} finally {
    $listener.Stop()
    $listener.Close()
}

