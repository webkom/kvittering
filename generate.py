from http.server import BaseHTTPRequestHandler, HTTPServer
from subprocess import call
import json
import os
import sys

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
    tex = tex.replace("%RECEIPT%", "{0} vedlegg".format(len(values.get("images") or [])))
    with open("out.tex", "w") as f:
        f.write(tex)

def generatePdf():
    call(["pdflatex", "--shell-escape", "out.tex"], stdout=open(os.devnull, 'wb'))

def handle(req):
    body = json.loads(req)

    generateTex(body)
    generatePdf()
    with open("out.pdf", "rb") as f:
        sys.stdout.buffer.write(f.read())

def get_stdin():
    buf = ""
    for line in sys.stdin:
        buf = buf + line
    return buf

if __name__ == "__main__":
    st = get_stdin()
    handle(st)
