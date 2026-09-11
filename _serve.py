"""Servidor local para previsualizar el sitio: python3 _serve.py"""
import functools, http.server, os, socketserver

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8765

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print("sirviendo %s en http://localhost:%d" % (ROOT, PORT), flush=True)
    httpd.serve_forever()
