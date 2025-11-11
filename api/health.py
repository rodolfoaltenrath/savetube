from http.server import BaseHTTPRequestHandler
import json, sys
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("content-type","application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True, "python": sys.version}).encode())
