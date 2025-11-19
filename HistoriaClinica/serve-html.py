#!/usr/bin/env python3
"""
Servidor simple para servir archivos HTML con recarga automática
Uso: python serve-html.py
"""
import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 5500
DIRECTORY = "wwwroot"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Agregar headers para evitar caché
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    # Cambiar al directorio del script
    os.chdir(Path(__file__).parent)
    
    # Verificar que existe el directorio wwwroot
    if not os.path.exists(DIRECTORY):
        print(f"❌ Error: No se encuentra el directorio '{DIRECTORY}'")
        return
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print(f"🚀 Servidor iniciado en http://localhost:{PORT}")
        print(f"📄 Abriendo {url} en el navegador...")
        print(f"💡 Presiona Ctrl+C para detener el servidor")
        print(f"📁 Sirviendo archivos desde: {os.path.abspath(DIRECTORY)}")
        
        # Abrir el navegador automáticamente
        webbrowser.open(url)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor detenido")

if __name__ == "__main__":
    main()

