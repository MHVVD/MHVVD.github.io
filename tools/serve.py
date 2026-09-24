#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
serve.py — preview the portfolio locally.

The blog fetches Markdown and JSON files, which browsers block when you open
index.html directly (file://). Run this instead:

    python tools/serve.py           # http://localhost:8000
    python tools/serve.py 5500      # choose a port

Then open http://localhost:8000/ in your browser. Ctrl+C to stop.
Standard library only (Python 3.6+).
"""
import os
import sys
import http.server
import socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

os.chdir(ROOT)  # 3.6 has no `directory=` arg, so serve from here

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({".md": "text/markdown; charset=utf-8"})
socketserver.TCPServer.allow_reuse_address = True

try:
    httpd = socketserver.TCPServer(("", PORT), Handler)
except OSError as e:
    sys.exit("! Could not bind port {} ({}). Try another: python tools/serve.py 8080".format(PORT, e))

print("Serving portfolio from: {}".format(ROOT))
print("  ->  http://localhost:{}/".format(PORT))
print("  ->  http://localhost:{}/blog.html".format(PORT))
print("Press Ctrl+C to stop.")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nStopped.")
    httpd.server_close()
