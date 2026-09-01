# Studio Byluly — sitio web

Réplica del sitio de referencia (https://vanessalinas01.wixsite.com/nanu) en HTML, CSS y
JavaScript puro. Sin frameworks, sin dependencias, sin build obligatorio: se abre haciendo
doble clic en `index.html` y se sube a cualquier hosting arrastrando la carpeta.

## Las 8 páginas

| Archivo | Página |
|---|---|
| `index.html` | Home |
| `branding.html` | Servicios → Branding |
| `redes-sociales.html` | Servicios → Redes Sociales |
| `cositas-gratis.html` | Cositas Gratis |
| `portafolio.html` | Portafolio |
| `tienda.html` | Tienda |
| `carrito.html` | Carrito |
| `contacto.html` | Contacto |

## Cómo editar

```
partials/     el menú, el pie y el <head>: viven UNA sola vez
pages/        el contenido de cada página, sin menú ni pie
_build.py     junta partials + pages y escribe los .html de la raíz
styles.css    todos los estilos (la paleta está arriba de todo, en :root)
script.js     menú, slider, carrito, formularios, popup
img/          las fotos que usa el sitio
originales/   las fotos de Drive sin recortar
```

**Regla importante:** los `.html` de la raíz son generados. Si los editás a mano, el próximo
`_build.py` los pisa. Editá `pages/` o `partials/` y después corré:

```bash
python3 _build.py
```

Así el menú y el pie se cambian en un solo lugar y se actualizan las 8 páginas juntas.

## Las fotos

Están las 9 fotos de la carpeta de Drive, convertidas de HEIC a JPG y recortadas para cada
lugar. Los originales quedaron en `originales/`.

| Archivo | Dónde aparece | Original |
|---|---|---|
| `hero.jpg` | foto principal de la home | IMG_6492 |
| `servicio-branding.jpg` | bloque "branding" de la home | IMG_6516 |
| `servicio-redes.jpg` | bloque "redes sociales" de la home | IMG_6491 |
| `podcast.jpg` | tapa del podcast | IMG_6512 |
| `sobre-mi.jpg` | Contacto | IMG_6494 |
| `proyecto-1..8.jpg` | Portafolio, tira de la home, productos | el resto |

Para cambiar una: pisá el archivo en `img/` con el mismo nombre. Si el encuadre no te gusta,
`_recortar.py` lo rehace desde el original:

```bash
python3 _recortar.py IMG_6492.jpg hero.jpg 900 1500 0.10
```

El último número es el encuadre vertical: 0 pega la foto arriba, 1 la pega abajo.

**Las fotos del portafolio son placeholders, no piezas de marca.** Cuando tengas los trabajos
reales, reemplazá los `proyecto-N.jpg` y agregá el nombre de cada marca con un
`<figcaption>Nombre</figcaption>` adentro de cada `<figure class="shot">` en
`pages/index.html` (hay un comentario marcando el lugar). El estilo ya está escrito.

## Qué falta conectar

- **Logo**: hoy es texto, en `partials/header.html`. Cuando tengas el SVG/PNG, cambiá el
  `<span class="logo__text">` por un `<img src="img/logo.svg" alt="Studio Byluly">`.
- **Formulario de contacto** (`contacto.html` y home): hoy solo muestra un mensaje de éxito.
  Para que envíe de verdad hay que conectarlo a Formspree, Netlify Forms, EmailJS o un backend.
  Está marcado con un `TODO` en `script.js`.
- **Popup y formulario del calendario de contenido**: tampoco envían el mail todavía.
- **Carrito**: suma productos y calcula el total, pero se guarda solo en el navegador de cada
  visitante y el botón "Finalizar compra" no cobra nada. Para vender hay que enchufar una
  pasarela (Mercado Pago, Lemon Squeezy, Gumroad).
- **Testimonios**: los textos de la home son de relleno. Los nombres y fechas (Malavuena,
  Del Barrio, Velisse, Mollis) sí son los del sitio original. Los de Branding y Redes Sociales
  (Maca y Majo) sí son textos reales del sitio.
- **Usuarios de redes**: Instagram, TikTok y Pinterest todavía apuntan a `@nanusalinas`, que son
  las cuentas reales del sitio original. Cuando tengas los usuarios de Byluly, se cambian en
  `partials/header.html` y `partials/footer.html`.

## Los precios

Salieron de los lightboxes "Lee toda la info" del sitio de Nanu (están en USD) con un 30%
de descuento aplicado. Cada tarjeta muestra el precio nuevo y el anterior tachado.

| Pack | Antes | Ahora (−30%) |
|---|---|---|
| branding esencial | 790 USD | **553 USD** |
| branding packaging | 890 USD | **623 USD** |
| branding social media | 890 USD | **623 USD** |
| branding web | 800 USD | **desde 560 USD** |
| branding gold | 990 USD | **693 USD** |
| plan integral 360º | 450 USD | **desde 315 USD / mes** |
| contratá a tu diseñadora | 300 USD | **desde 210 USD / mes** |

"Desde" es porque esos tres tienen varios niveles: web va de 800 a 950 (con extras de 1100 y
1300 según fotos propias o imágenes IA), integral 360º tiene 2 planes (450 y 550) y
tu diseñadora tiene 3 (300, 350 y 400). Si querés que aparezcan todos los niveles y no solo
el más barato, se agregan.

**Ojo con una cosa del sitio de Nanu:** en los packs de branding la suma de los dos pagos no
da el total que figura (335 + 335 pero dice 790; 395 + 395 pero dice 890). Tomé el **total**,
que es el número grande. Si el bueno era la suma de los pagos, los precios cambian.

Se editan en `pages/branding.html` y `pages/redes-sociales.html`, en las líneas
`pack__price` y `pack__before` de cada tarjeta.

## La sección del podcast

La saqué de la home porque su único contenido era el link al Spotify. Quedó guardada entera en
`pages/_podcast-guardado.html`: para volver a ponerla, pegá ese bloque en `pages/index.html`
antes del comentario de TESTIMONIOS y corré `python3 _build.py`.

## WhatsApp

El número está en **cuatro lugares**: un botón verde flotante abajo a la derecha en las 8
páginas, un botón "Escribime por WhatsApp" en el bloque *Hablemos!* (home y Contacto), el
ícono en el menú, y el número escrito al lado del mail en el pie.

Todos abren el chat con un mensaje ya escrito: *"Hola Byluly! Quiero hablar de mi proyecto"*.

El botón usa el **blood orange `#DD4E28`** de la paleta, no el verde de WhatsApp. Se cambia
con la variable `--wpp` en `styles.css` (hoy apunta a `var(--orange)`).

El número vive en **un solo lugar**, arriba de `_build.py`:

```python
WPP_NUMERO  = '5491160169886'          # 54 (país) + 9 (celular) + 11 (área) + número
WPP_TEXTO   = 'Hola Byluly! Quiero hablar de mi proyecto'
WPP_DISPLAY = '+54 9 11 6016-9886'     # cómo se ve escrito en el pie
```

Lo cambiás ahí, corrés `python3 _build.py` y se actualiza en todo el sitio.

## Links que ya funcionan

Menú, submenú de Servicios, botones, tags del portafolio, carrito, WhatsApp y pie: todos van
a algún lado real. Las redes que quedaron son Instagram, TikTok y Pinterest.
El mail del pie es `byluly.dsg@gmail.com`.

## Paleta

```
peony        #FAD2E1   rosa claro   → Tienda, textos sobre fondos oscuros
burgundy     #770523   bordó        → hero, cabeceras de página, Contacto
burgundy dp  #55031A   bordó oscuro → footer y bandas de cierre
pistachio    #D0D996   verde        → "branding", Podcast, títulos sobre bordó
fuchsia      #D81A67   fucsia       → botones, títulos de servicios, precios de oferta
blood orange #DD4E28   naranja      → play del podcast, tags, checks, carrito
brown        #63422A   marrón       → Testimonios, Medios de pago
```

Neutros cálidos derivados de la paleta: `--cream #FBF5E7` (fondo general),
`--sand #F2E8D4` (panel del hero), `--ink #3A2318`, `--grey #7A6455`.
Todo vive en `:root`, arriba de `styles.css`.

Tipografías: Poppins (títulos) e Inter (texto), desde Google Fonts.

## preview.html

Es el sitio entero metido en un solo archivo (páginas + imágenes embebidas + un ruteo mínimo
en JS) para poder compartirlo por link sin hosting. Se genera con `python3 _build_preview.py`.
No es el sitio que se sube: eso son los `.html` sueltos.
