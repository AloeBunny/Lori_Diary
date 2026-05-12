"""
Pace PWA 本地測試伺服器
用法：python serve.py
然後開 http://localhost:8000
"""
import http.server
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("Pace PWA running at http://localhost:8001")
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=8001)
