# api/health.py
from http.server import BaseHTTPRequestHandler
import json, sys, platform

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        data = {"ok": True, "python": sys.version, "platform": platform.platform()}
        self.send_response(200)
        self.send_header("content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
