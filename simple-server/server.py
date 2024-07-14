import os
from http.server import SimpleHTTPRequestHandler, HTTPServer

class CustomHandler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None):
        if code == 404:
            # Serve custom 404 page
            self.send_response(404)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            with open('404.html', 'rb') as file:
                self.wfile.write(file.read())
            
        else:
            # Default behavior for other errors
            super().send_error(code, message)

    def do_GET(self):
        # Serve index.html at the root level
        if self.path == '/':
            self.path = '/index.html'

        # Check if the requested path exists
        if not os.path.exists(self.path[1:]):
            self.send_error(404)
        else:
            super().do_GET()

def run(server_class=HTTPServer, handler_class=CustomHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting httpd server on port {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
