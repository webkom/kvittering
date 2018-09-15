from http.server import BaseHTTPRequestHandler, HTTPServer
from subprocess import call
import json

def addImages(tex, images):
    i = 0
    embedded = ""
    immediate = ""
    graphics = ""
    for image in images:
       embedded += "\\begin{{filecontents*}}{{\jobname.embedded{0}}}\n{1}\n\\end{{filecontents*}}\n".format(i, image)
       immediate += "\\immediate\\write18{{base64 -d \\jobname.embedded{0} > \\jobname-tmp{0}.pdf}}\n".format(i)
       graphics += "\\newpage\n\\fbox{{\\includegraphics[width=3cm]{{\\jobname-tmp{0}.pdf}}}}".format(i)
       i += 1
    tex = tex.replace("%EMBEDDED_IMAGES%", embedded)
    tex = tex.replace("%EMBEDDED_IMMEDIATE%", immediate)
    tex = tex.replace("%EMBEDDED_GRAPHICS%", graphics)
    return tex

def generateTex(values):
    tex = ""
    with open("template.tex", "r") as f:
        tex = "".join(f.readlines())
    for field, value in values.items():
        tex = addImages(tex, value) if field == "images" else tex.replace("%{0}%".format(field.upper()), value)
    with open("out.tex", "w") as f:
        f.write(tex)

def generatePdf():
    call(["pdflatex", "--shell-escape", "out.tex"])

class server(BaseHTTPRequestHandler):
    def do_POST(self):
        self.send_response(200)
        print("POST")
        varLen = int(self.headers['Content-Length'])
        body = json.loads(self.rfile.read(varLen).decode())
        print(body)
        self.send_header('Content-type','application/pdf')
        self.end_headers()

        generateTex(body)
        generatePdf()
        with open("out.pdf", "rb") as f:
            self.wfile.write(f.read())
        return

def run():
    print('starting server...')
    server_address = ("0.0.0.0", 8080)
    httpd = HTTPServer(server_address, server)
    print('running server...')
    httpd.serve_forever()
run()
