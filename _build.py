"""Arma las páginas del sitio.

El menú, el pie y el <head> viven una sola vez en partials/. El contenido de cada
página vive en pages/. Este script los junta y escribe los .html de la raíz.

    python3 _build.py

Cada vez que toques partials/ o pages/, corré esto de nuevo.
"""
import hashlib
import os

def file_ver(path):
    """Hash corto del contenido: cambia el número y el navegador de cada
    visitante descarga la versión nueva de styles.css / script.js sin
    quedarse con una copia vieja en caché."""
    with open(path, 'rb') as f:
        return hashlib.sha1(f.read()).hexdigest()[:8]

VER_CSS = file_ver('styles.css')
VER_JS  = file_ver('script.js')

# WhatsApp: se cambia acá y se actualiza en todo el sitio.
# El formato del link es 54 (país) + 9 (celular) + 11 (área, sin el 0) + número (sin el 15).
WPP_NUMERO  = '5491160169886'
WPP_TEXTO   = 'Hola Byluly! Quiero hablar de mi proyecto'
WPP_DISPLAY = '+54 9 11 6016-9886'

ICONS = {
 'ico_instagram': '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.43.42.7.82.92 1.4.17.42.37 1.05.42 2.24.06 1.28.07 1.66.07 4.88 0 3.2 0 3.6-.07 4.88-.05 1.2-.25 1.82-.42 2.24-.22.58-.49.98-.91 1.4-.43.42-.83.68-1.4.9-.43.17-1.06.37-2.25.42-1.27.06-1.65.07-4.88.07s-3.6 0-4.88-.07c-1.2-.05-1.82-.25-2.24-.42-.58-.22-.98-.48-1.4-.9a3.8 3.8 0 0 1-.91-1.4c-.17-.42-.37-1.05-.42-2.24C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.88c.05-1.2.25-1.82.42-2.24.22-.58.48-.98.9-1.4.43-.42.83-.68 1.4-.9.43-.17 1.06-.37 2.25-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.87-.4.4-.66.8-.87 1.35-.16.4-.35 1.03-.4 2.17-.06 1.23-.07 1.6-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.87 1.35.4.4.8.66 1.35.87.4.16 1.03.35 2.17.4 1.23.06 1.6.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.87.4-.4.66-.8.87-1.35.16-.4.35-1.03.4-2.17.06-1.23.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.87-1.35 3.6 3.6 0 0 0-1.35-.87c-.4-.16-1.03-.35-2.17-.4C15.5 4 15.15 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.2-8.3a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z"/></svg>',
 'ico_tiktok': '<svg viewBox="0 0 24 24"><path d="M16.3 2h-3.1v13.1a2.6 2.6 0 1 1-2-2.53V9.4a5.7 5.7 0 1 0 5.1 5.67V8.6c.98.72 2.17 1.15 3.46 1.17V6.66c-2-.09-3.46-1.7-3.46-4.66Z"/></svg>',
 'ico_whatsapp': '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488"/></svg>',
 'ico_pinterest': '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3.65 19.31c-.09-.78-.17-1.98.03-2.83.19-.78 1.2-4.96 1.2-4.96s-.3-.61-.3-1.52c0-1.42.82-2.48 1.85-2.48.87 0 1.29.66 1.29 1.45 0 .88-.56 2.2-.85 3.43-.24 1.02.51 1.86 1.52 1.86 1.83 0 3.23-1.93 3.23-4.71 0-2.46-1.77-4.18-4.3-4.18-2.93 0-4.65 2.2-4.65 4.47 0 .89.34 1.84.77 2.35.08.1.1.19.07.3l-.28 1.16c-.05.19-.15.23-.35.14-1.3-.6-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.85-6.28 3.6 0 6.4 2.56 6.4 5.99 0 3.57-2.25 6.45-5.38 6.45-1.05 0-2.03-.55-2.37-1.19l-.65 2.46c-.23.9-.86 2.03-1.28 2.72A10 10 0 1 0 12 2Z"/></svg>',
}

# archivo de salida -> (título, descripción, clave del link activo)
PAGES = {
 'index.html':          ('Studio Byluly | Branding', 'Studio de branding y diseño para marcas conscientes: veganas, sostenibles, con proyectos sociales o de bienestar.', 'home'),
 'branding.html':       ('Branding | Studio Byluly', 'Packs de branding: esencial, packaging, social media, web y gold. Identidad visual con estrategia.', 'branding'),
 'redes-sociales.html': ('Redes Sociales | Studio Byluly', 'Gestión de redes sociales: diseño, edición y estrategia para que tu marca conecte con su comunidad.', 'redes'),
 'contacto.html':       ('Contacto | Studio Byluly', 'Hello, soy Byluly, diseñadora gráfica. Contame de tu proyecto y armamos juntas la propuesta.', 'contacto'),
 'portafolio.html':     ('Portafolio | Studio Byluly', 'Trabajos de branding, identidad visual, packaging y redes sociales de Studio Byluly.', 'porta'),
}

ACTIVE_KEYS = ['home', 'serv', 'branding', 'redes', 'contacto', 'porta']

import urllib.parse
WPP_URL = 'https://wa.me/%s?text=%s' % (WPP_NUMERO, urllib.parse.quote(WPP_TEXTO))

def wpp_fill(html):
    html = html.replace('{{wpp_url}}', WPP_URL).replace('{{wpp_display}}', WPP_DISPLAY)
    for k, v in ICONS.items():
        html = html.replace('{{%s}}' % k, v)
    return html

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

head_tpl     = read('partials/head.html')
header_tpl   = read('partials/header.html')
hablemos_tpl = read('partials/hablemos.html')
footer_tpl   = read('partials/site-footer.html')
wpp_float    = read('partials/wpp.html')

# La página de Contacto arma su propio bloque "Hablemos!" (pages/contacto.html),
# así que no repite el genérico que sí llevan las otras 4 páginas.
PAGES_SIN_HABLEMOS_COMPARTIDO = {'contacto.html'}

for out, (title, desc, active) in PAGES.items():
    head = head_tpl.replace('{{title}}', title).replace('{{desc}}', desc).replace('{{ver_css}}', VER_CSS)

    header = header_tpl
    for key in ACTIVE_KEYS:
        on = (key == active) or (active in ('branding', 'redes') and key == 'serv')
        header = header.replace('{{a_%s}}' % key, ' is-active' if on else '')
    for k, v in ICONS.items():
        header = header.replace('{{%s}}' % k, v)
    header = wpp_fill(header)

    hablemos = '' if out in PAGES_SIN_HABLEMOS_COMPARTIDO else wpp_fill(hablemos_tpl)

    footer = footer_tpl
    for k, v in ICONS.items():
        footer = footer.replace('{{%s}}' % k, v)
    footer = wpp_fill(footer)

    body = wpp_fill(read('pages/' + out))

    page = (
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        + head +
        '</head>\n<body data-page="' + active + '">\n\n'
        + header + '\n'
        + body + '\n'
        + hablemos + '\n'
        + footer + '\n'
        + wpp_fill(wpp_float) +
        '\n<script src="script.js?v=' + VER_JS + '"></script>\n</body>\n</html>\n'
    )
    with open(out, 'w', encoding='utf-8') as f:
        f.write(page)
    print('escrito', out, len(page), 'bytes')
