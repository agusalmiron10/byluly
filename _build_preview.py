"""Arma preview.html: el sitio entero en un solo archivo.

Mete las 8 páginas y todas las imágenes (como data URI) en un HTML autocontenido,
con un ruteo mínimo en JS para poder navegar entre páginas sin servidor.
Sirve para compartir el link del Artifact; el sitio de verdad son los .html sueltos.

    python3 _build_preview.py
"""
import base64, io, json, os, re
from PIL import Image

# ---------- imágenes a data URI ----------
def enc(name):
    im = Image.open('img/' + name).convert('RGB')
    if name.startswith('proyecto'):        box = (460, 640)
    elif name == 'hero.jpg':               box = (700, 1160)
    elif name == 'podcast.jpg':            box = (220, 220)
    elif name == 'sobre-mi.jpg':           box = (560, 700)
    else:                                  box = (680, 680)
    im.thumbnail((box[0] * 2, box[1] * 2)); im.thumbnail(box)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=70, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()

IMGS = {n: enc(n) for n in sorted(os.listdir('img')) if not n.endswith('.svg')}
def inline(html):
    for n, uri in IMGS.items():
        html = html.replace('img/' + n, uri)
    return html

# ---------- piezas ----------
build = __import__('_build')

head_ok = True
header = open('partials/header.html', encoding='utf-8').read()
for key in build.ACTIVE_KEYS:
    header = header.replace('{{a_%s}}' % key, '')
for k, v in build.ICONS.items():
    header = header.replace('{{%s}}' % k, v)

footer = (open('partials/hablemos.html', encoding='utf-8').read()
          + open('partials/site-footer.html', encoding='utf-8').read())
for k, v in build.ICONS.items():
    footer = footer.replace('{{%s}}' % k, v)

css   = open('styles.css', encoding='utf-8').read()
js    = open('script.js', encoding='utf-8').read()

# la única imagen que se referencia desde el CSS (el fondo de estrellitas del popup)
stars_svg = base64.b64encode(open('img/popup-stars-bg.svg', 'rb').read()).decode()
css = css.replace('img/popup-stars-bg.svg', 'data:image/svg+xml;base64,' + stars_svg)

popup = open('partials/popup.html', encoding='utf-8').read()

routes = {out: inline(open('pages/' + out, encoding='utf-8').read())
          for out in build.PAGES}
routes['index.html'] += '\n' + popup
titles = {out: meta[0] for out, meta in build.PAGES.items()}
actives = {out: meta[2] for out, meta in build.PAGES.items()}

router = """
(function () {
  var ROUTES  = %s;
  var TITLES  = %s;
  var ACTIVES = %s;
  var app = document.getElementById('app');

  function paintNav(active) {
    var nav = document.getElementById('nav');
    if (!nav) return;
    nav.querySelectorAll('.nav__link, .nav__sublink').forEach(function (el) {
      el.classList.remove('is-active');
    });
    var map = { home:'index.html', branding:'branding.html', redes:'redes-sociales.html',
                gratis:'cositas-gratis.html', contacto:'contacto.html',
                porta:'portafolio.html', tienda:'tienda.html' };
    var href = map[active];
    if (href) {
      var link = nav.querySelector('[href="' + href + '"]');
      if (link) link.classList.add('is-active');
    }
    if (active === 'branding' || active === 'redes') {
      var t = nav.querySelector('.nav__toggle');
      if (t) t.classList.add('is-active');
    }
  }

  function go(route) {
    route = (route || 'index.html').split('#')[0];
    if (!ROUTES[route]) return false;
    if (window.__bylulyCleanup) window.__bylulyCleanup();
    app.innerHTML = ROUTES[route];
    document.title = TITLES[route];
    paintNav(ACTIVES[route]);
    window.scrollTo(0, 0);
    window.__bylulyInit();
    document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('is-in'); });
    return true;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('.html') === -1) return;
    e.preventDefault();
    go(href);
  });

  go('index.html');
})();
""" % (json.dumps(routes, ensure_ascii=False),
       json.dumps(titles, ensure_ascii=False),
       json.dumps(actives, ensure_ascii=False))

# script.js es un IIFE: lo convierto en función para poder re-ejecutarlo al navegar
js_fn = js.replace("(function () {\n  'use strict';", "window.__bylulyInit = function () {\n  'use strict';", 1)
js_fn = re.sub(r'\}\)\(\);\s*$', '};\n', js_fn)

out = (
    '<title>Studio Byluly | Branding</title>\n'
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600'
    '&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">\n'
    '<style>\n' + css + '\n</style>\n\n'
    + inline(header) + '\n'
    '<div id="app"></div>\n'
    + inline(footer) + '\n'
    '<script>\n' + js_fn + '\n' + router + '\n</script>\n'
)
open('preview.html', 'w', encoding='utf-8').write(out)
print('preview.html', round(os.path.getsize('preview.html') / 1024), 'KB')
