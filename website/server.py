#!/usr/bin/env python3
"""
SPA Server - Serves React SPA with proper client-side routing.
Falls back to index.html for all non-file routes.
"""
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

class SPARequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        """Override GET to serve index.html for SPA routing"""
        # Parse the path
        path = self.translate_path(self.path)
        
        # Remove query string for file checking
        request_path = self.path.split('?')[0]
        
        # Check if file exists
        if os.path.isfile(path):
            return super().do_GET()
        
        # Check if directory with index.html
        if os.path.isdir(path):
            index_path = os.path.join(path, 'index.html')
            if os.path.isfile(index_path):
                self.path = os.path.join(request_path, 'index.html')
                return super().do_GET()
        
        # For all other routes (SPA routing), serve index.html
        self.path = '/index.html'
        return super().do_GET()
    
    def end_headers(self):
        """Add cache control headers"""
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, public, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    # Get dist directory
    dist_dir = '/Users/visionalventure/Pepo/website/dist'
    
    # Check if dist exists
    if not os.path.isdir(dist_dir):
        print(f'Error: {dist_dir} not found')
        sys.exit(1)
    
    os.chdir(dist_dir)
    
    port = 5174
    server = HTTPServer(('127.0.0.1', port), SPARequestHandler)
    
    print(f'\n🚀 SPA Server running at http://localhost:{port}/')
    print(f'   Serving from: {os.getcwd()}')
    print(f'   All routes fallback to index.html')
    print(f'   Try: http://localhost:5174/login')
    print(f'        http://localhost:5174/browse')
    print(f'        http://localhost:5174/give\n')
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n✓ Server stopped\n')
        sys.exit(0)
