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

# WhatsApp, mail y redes se editan desde el panel (content/general.json)
import json as _json
_GENERAL = _json.load(open('content/general.json', encoding='utf-8'))['contacto']
WPP_NUMERO  = ''.join(ch for ch in str(_GENERAL['whatsapp_numero']) if ch.isdigit())
WPP_TEXTO   = _GENERAL['whatsapp_mensaje']
WPP_DISPLAY = _GENERAL['whatsapp_visible']

ICONS = {
 'ico_instagram': '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.43.42.7.82.92 1.4.17.42.37 1.05.42 2.24.06 1.28.07 1.66.07 4.88 0 3.2 0 3.6-.07 4.88-.05 1.2-.25 1.82-.42 2.24-.22.58-.49.98-.91 1.4-.43.42-.83.68-1.4.9-.43.17-1.06.37-2.25.42-1.27.06-1.65.07-4.88.07s-3.6 0-4.88-.07c-1.2-.05-1.82-.25-2.24-.42-.58-.22-.98-.48-1.4-.9a3.8 3.8 0 0 1-.91-1.4c-.17-.42-.37-1.05-.42-2.24C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.88c.05-1.2.25-1.82.42-2.24.22-.58.48-.98.9-1.4.43-.42.83-.68 1.4-.9.43-.17 1.06-.37 2.25-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.87-.4.4-.66.8-.87 1.35-.16.4-.35 1.03-.4 2.17-.06 1.23-.07 1.6-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.87 1.35.4.4.8.66 1.35.87.4.16 1.03.35 2.17.4 1.23.06 1.6.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.87.4-.4.66-.8.87-1.35.16-.4.35-1.03.4-2.17.06-1.23.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.87-1.35 3.6 3.6 0 0 0-1.35-.87c-.4-.16-1.03-.35-2.17-.4C15.5 4 15.15 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.2-8.3a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z"/></svg>',
 'ico_tiktok': '<svg viewBox="0 0 24 24"><path d="M16.3 2h-3.1v13.1a2.6 2.6 0 1 1-2-2.53V9.4a5.7 5.7 0 1 0 5.1 5.67V8.6c.98.72 2.17 1.15 3.46 1.17V6.66c-2-.09-3.46-1.7-3.46-4.66Z"/></svg>',
 'ico_whatsapp': '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488"/></svg>',
 'ico_pinterest': '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3.65 19.31c-.09-.78-.17-1.98.03-2.83.19-.78 1.2-4.96 1.2-4.96s-.3-.61-.3-1.52c0-1.42.82-2.48 1.85-2.48.87 0 1.29.66 1.29 1.45 0 .88-.56 2.2-.85 3.43-.24 1.02.51 1.86 1.52 1.86 1.83 0 3.23-1.93 3.23-4.71 0-2.46-1.77-4.18-4.3-4.18-2.93 0-4.65 2.2-4.65 4.47 0 .89.34 1.84.77 2.35.08.1.1.19.07.3l-.28 1.16c-.05.19-.15.23-.35.14-1.3-.6-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.85-6.28 3.6 0 6.4 2.56 6.4 5.99 0 3.57-2.25 6.45-5.38 6.45-1.05 0-2.03-.55-2.37-1.19l-.65 2.46c-.23.9-.86 2.03-1.28 2.72A10 10 0 1 0 12 2Z"/></svg>',
}

# archivo de salida -> (título, descripción, clave del link activo)
PAGES = {
 'index.html':          ('Studio Byluly | Identidad de marca', 'Studio de identidad de marca y diseño para marcas conscientes: veganas, sostenibles, con proyectos sociales o de bienestar.', 'home'),
 'branding.html':       ('Identidad de marca | Studio Byluly', 'Packs de identidad de marca: The Core, The Object, The Voice, The Space y The Universe. Identidad visual con estrategia.', 'branding'),
 'redes-sociales.html': ('Redes Sociales | Studio Byluly', 'Gestión de redes sociales: diseño, edición y estrategia para que tu marca conecte con su comunidad.', 'redes'),
 'contacto.html':       ('Contacto | Studio Byluly', 'Hello, soy Byluly, diseñadora gráfica. Contame de tu proyecto y armamos juntas la propuesta.', 'contacto'),
 'portafolio.html':     ('Portafolio | Studio Byluly', 'Trabajos de identidad de marca, identidad visual, packaging y redes sociales de Studio Byluly.', 'porta'),
}

ACTIVE_KEYS = ['home', 'serv', 'branding', 'redes', 'contacto', 'porta']

import re
import urllib.parse
WPP_URL = 'https://wa.me/%s?text=%s' % (WPP_NUMERO, urllib.parse.quote(WPP_TEXTO))

def wpp_pack_url(pack):
    """Link de WhatsApp con el nombre del pack ya escrito en el mensaje,
    para que cada botón "LO NECESITOOOOO" avise cuál quiere el cliente."""
    texto = 'Hola Byluly! Quiero el pack %s' % pack
    return 'https://wa.me/%s?text=%s' % (WPP_NUMERO, urllib.parse.quote(texto))

# ---------- contenido editable desde el panel (/admin) ----------
# Los textos y fotos de packs, planes y portafolio viven en content/*.json.
# En las páginas se usan así:
#   {{c:identidad-de-marca.packs.core.nombre}}   -> texto (con **negrita**, saltos de línea y ²)
#   {{a:identidad-de-marca.packs.object.foto}}   -> valor tal cual, para atributos (src, alt)
#   {{portafolio_items}} / {{packs_json}} / {{lista:...}} -> bloques armados acá
import html as _html
import json as _json

CONTENT = {f[:-5]: _json.load(open('content/' + f, encoding='utf-8'))
           for f in sorted(os.listdir('content')) if f.endswith('.json')}

def _get(path):
    """Si algo se borró desde el panel, devuelve vacío en vez de romper el armado de la web."""
    archivo, *claves = path.strip().split('.')
    v = CONTENT.get(archivo, {})
    try:
        for k in claves:
            v = v[int(k)] if isinstance(v, list) else v[k]
    except (KeyError, IndexError, ValueError, TypeError):
        print('  aviso: falta', path)
        return ''
    return '' if v is None else v

def md(texto):
    """Formato mínimo para que Luly escriba sin HTML: **negrita**, Enter = salto de línea, ² = superíndice."""
    t = _html.escape(str(texto), quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t, flags=re.S)
    t = re.sub(r'\*(.+?)\*', r'<em>\1</em>', t, flags=re.S)
    t = t.replace('²', '<sup>2</sup>').replace('\r\n', '\n').replace('\n', '<br>')
    return t

def _foto(src):
    # el panel guarda las fotos subidas como /img/subidas/...; las páginas usan rutas relativas
    return str(src).lstrip('/')

CAT_PORTAFOLIO = {'branding': 'Identidad de marca', 'packaging': 'Packaging', 'redes': 'Redes'}

def portafolio_items():
    out = []
    for p in CONTENT['portafolio']['proyectos']:
        fotos = [_foto(f) for f in p.get('fotos') or []]
        if not fotos:
            continue
        esc = lambda v: _html.escape(str(v or ''), quote=True)
        out.append(
            '    <figure class="gallery__item reveal" data-cat="%s" data-fotos="%s">\n'
            '      <img src="%s" alt="%s" loading="lazy">\n'
            '      <figcaption>%s<span>%s</span><small class="gallery__desc">%s</small></figcaption>\n'
            '    </figure>' % (esc(' '.join(p.get('categorias') or [])), esc('|'.join(fotos)), esc(fotos[0]),
                              esc(p.get('texto_alternativo') or p.get('nombre')), _html.escape(p.get('nombre') or ''),
                              _html.escape(p.get('rubro') or ''), _html.escape(p.get('descripcion') or '')))
    return '\n'.join(out)

def packs_json():
    """Detalle de cada pack (el "qué incluye" del modal) para script.js."""
    packs = {}
    for clave, p in CONTENT['identidad-de-marca']['packs'].items():
        d = dict(p.get('detalle') or {})
        d.update(categoria=p.get('categoria', ''), nombre=p.get('nombre', ''))
        packs[clave] = d
    return '<script>window.BYLULY_PACKS = %s;</script>' % _json.dumps(packs, ensure_ascii=False).replace('</', '<\\/')

def parrafos(texto, clase=''):
    """Una línea en blanco separa párrafos."""
    attr = ' class="%s"' % clase if clase else ''
    return '\n'.join('<p%s>%s</p>' % (attr, md(x.strip())) for x in re.split(r'\n\s*\n', str(texto or '')) if x.strip())

def _entero(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0

def numeros_items():
    return '\n'.join(
        '  <div class="stats__item reveal"><p class="stats__num">+<span class="count" data-to="%d">%d</span></p>'
        '<p class="stats__label">%s</p></div>' % (_entero(n.get('numero')), _entero(n.get('numero')), md(n.get('etiqueta') or ''))
        for n in CONTENT['home']['numeros'])

def testimonios_items():
    out = []
    for i, m in enumerate(CONTENT['home']['testimonios']['mensajes']):
        pos = 'abcdefghij'[i % 10]
        color = re.sub(r'[^#0-9a-fA-F]', '', m.get('color') or '') or '#770523'
        nombre = _html.escape(m.get('nombre') or '')
        hora = '<time>%s</time>' % _html.escape(m['hora']) if m.get('hora') else ''
        if nombre and m.get('nombre_en_el_texto'):
            cuerpo = '<p><b class="chat__de chat__de--inline" style="--de:%s">%s</b> %s</p>' % (color, nombre, md(m.get('texto')))
        else:
            cuerpo = ('<p class="chat__de" style="--de:%s">%s</p>' % (color, nombre) if nombre else '') + '<p>%s</p>' % md(m.get('texto'))
        out.append('    <article class="chat chat--%s">%s%s</article>' % (pos, cuerpo, hora))
    return '\n'.join(out)

def marcas_items():
    out = []
    for m in CONTENT['home']['marcas']['lista']:
        f = _html.escape(_foto(m.get('foto') or ''), quote=True)
        out.append('    <li><a class="marcas__row" href="portafolio.html" data-img="%s"><span class="marcas__name">%s</span>'
                   '<span class="marcas__cat">%s</span><img class="marcas__thumb" src="%s" alt="" loading="lazy"></a></li>'
                   % (f, _html.escape(m.get('nombre') or ''), _html.escape(m.get('rubro') or ''), f))
    return '\n'.join(out)

def cinta_html():
    grupo = ''.join('<span>%s</span><i>✦</i>' % _html.escape(w) for w in CONTENT['general']['cinta']['palabras'])
    mitad = grupo * max(1, -(-12 // max(1, len(CONTENT['general']['cinta']['palabras']))))
    return ('<div class="cinta" aria-hidden="true">\n  <div class="cinta__track">\n'
            '    <div class="cinta__half">%s</div>\n    <div class="cinta__half">%s</div>\n  </div>\n</div>' % (mitad, mitad))

def pasos_items():
    return '\n'.join('    <li><span>%d</span>%s</li>' % (i + 1, md(x)) for i, x in enumerate(CONTENT['general']['hablemos']['pasos']))

def aviso_html():
    a = CONTENT['general'].get('aviso') or {}
    if not a.get('activo') or not a.get('texto'):
        return ''
    txt = md(a['texto'])
    if a.get('link'):
        txt = '<a href="%s">%s</a>' % (_html.escape(a['link'], quote=True), txt)
    return '<div class="aviso">%s</div>' % txt

def porque_items():
    return '\n'.join('    <article class="why__card reveal">\n      <h3>%s</h3>\n      <p>%s</p>\n    </article>' % (md(t.get('titulo')), md(t.get('texto')))
                     for t in CONTENT['identidad-de-marca']['porque']['tarjetas'])

def tira_items():
    return '\n'.join('    <img src="%s" alt="" loading="lazy">' % _html.escape(_foto(f), quote=True)
                     for f in (CONTENT['home'].get('tira') or {}).get('fotos') or [] if f)

def servicios_items():
    return '\n'.join('        <label><input type="checkbox" name="servicio" value="%s"><i></i>%s</label>' % (_html.escape(x, quote=True), _html.escape(x))
                     for x in CONTENT['general']['formulario'].get('servicios') or [])

GOOGLE = {'index.html': 'inicio', 'branding.html': 'identidad', 'redes-sociales.html': 'redes',
          'contacto.html': 'contacto', 'portafolio.html': 'portafolio'}

def titulo_google(out, title, desc):
    g = (CONTENT['general'].get('google') or {}).get(GOOGLE.get(out, ''), {})
    return (g.get('titulo') or title), (g.get('descripcion') or desc)

def popup_activo():
    return bool((CONTENT['general'].get('popup') or {}).get('activo'))

def content_fill(html):
    for token, fn in (('{{numeros_items}}', numeros_items), ('{{testimonios_items}}', testimonios_items),
                      ('{{marcas_items}}', marcas_items), ('{{cinta}}', cinta_html),
                      ('{{pasos_items}}', pasos_items), ('{{aviso}}', aviso_html), ('{{porque_items}}', porque_items), ('{{tira_items}}', tira_items), ('{{servicios_items}}', servicios_items)):
        if token in html:
            html = html.replace(token, fn())
    html = re.sub(r'\{\{p:([^}|]+)(?:\|([^}]*))?\}\}', lambda m: parrafos(_get(m.group(1)), m.group(2) or ''), html)
    html = re.sub(r'\{\{opciones:([^}]+)\}\}', lambda m: '\n'.join('          <option>%s</option>' % _html.escape(x) for x in (_get(m.group(1)) or [])), html)
    html = re.sub(r'\{\{cbr:([^}]+)\}\}', lambda m: md(_get(m.group(1))).replace('<br>', '<br class="d-only">'), html)
    if '{{portafolio_items}}' in html:
        html = html.replace('{{portafolio_items}}', portafolio_items())
    if '{{packs_json}}' in html:
        html = html.replace('{{packs_json}}', packs_json())
    html = re.sub(r'\{\{lista:([^}]+)\}\}',
                  lambda m: ''.join('<li>%s</li>' % md(x) for x in (_get(m.group(1)) or [])), html)
    html = re.sub(r'\{\{a:([^}]+)\}\}', lambda m: _html.escape(_foto(_get(m.group(1))), quote=True), html)
    html = re.sub(r'\{\{c:([^}]+)\}\}', lambda m: md(_get(m.group(1))), html)
    return html

def wpp_fill(html):
    html = content_fill(html)
    html = html.replace('{{wpp_url}}', WPP_URL).replace('{{wpp_display}}', WPP_DISPLAY)
    html = re.sub(r'\{\{wpp_pack:([^}]+)\}\}', lambda m: wpp_pack_url(m.group(1)), html)
    for k, v in ICONS.items():
        html = html.replace('{{%s}}' % k, v)
    return html

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

head_tpl     = read('partials/head.html')
header_tpl   = read('partials/header.html')
hablemos_tpl = read('partials/hablemos.html')
hablemos_rosa_tpl = read('partials/hablemos-rosa.html')
footer_tpl   = read('partials/site-footer.html')
wpp_float    = read('partials/wpp.html')
popup_tpl    = read('partials/popup.html')

# "Hablemos!": el genérico bordó (con formulario) va en Home y Portafolio.
# Branding y Redes Sociales llevan la versión rosa de sus PDF (sello "ly",
# pasos y botón a WhatsApp). Contacto arma el suyo dentro de la página.
PAGES_HABLEMOS_ROSA = {'branding.html', 'redes-sociales.html'}
PAGES_SIN_HABLEMOS_COMPARTIDO = {'contacto.html'}

for out, (title, desc, active) in PAGES.items():
    title, desc = titulo_google(out, title, desc)
    head = head_tpl.replace('{{title}}', _html.escape(title)).replace('{{desc}}', _html.escape(desc, quote=True)).replace('{{ver_css}}', VER_CSS)

    header = header_tpl
    for key in ACTIVE_KEYS:
        on = (key == active) or (active in ('branding', 'redes') and key == 'serv')
        header = header.replace('{{a_%s}}' % key, ' is-active' if on else '')
    for k, v in ICONS.items():
        header = header.replace('{{%s}}' % k, v)
    header = wpp_fill(header)

    if out in PAGES_SIN_HABLEMOS_COMPARTIDO:
        hablemos = ''
    elif out in PAGES_HABLEMOS_ROSA:
        hablemos = wpp_fill(hablemos_rosa_tpl)
    else:
        hablemos = wpp_fill(hablemos_tpl)

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
        + wpp_fill(wpp_float) + '\n'
        + (wpp_fill(popup_tpl) if out == 'index.html' and popup_activo() else '') +
        '\n<script src="script.js?v=' + VER_JS + '"></script>\n</body>\n</html>\n'
    )
    with open(out, 'w', encoding='utf-8') as f:
        f.write(page)
    print('escrito', out, len(page), 'bytes')
