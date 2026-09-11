# Studio Byluly — sitio web

Sitio en HTML, CSS y JavaScript puro. Sin frameworks, sin dependencias, sin build obligatorio:
se abre haciendo doble clic en `index.html` y se sube a cualquier hosting arrastrando la carpeta.

La **home replica el diseño de `web inicio - byluly.pdf`** (el mockup de Illustrator): mismos
textos, mismos colores, mismas fotos y mockups de marca, mismo orden de secciones.

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
script.js     menú, carrito, formularios, popup
img/          las fotos y mockups que usa el sitio
originales/   las fotos de Drive sin recortar
_serve.py     servidor local para previsualizar: python3 _serve.py → localhost:8765
```

**Regla importante:** los `.html` de la raíz son generados. Si los editás a mano, el próximo
`_build.py` los pisa. Editá `pages/` o `partials/` y después corré:

```bash
python3 _build.py
```

Así el menú y el pie se cambian en un solo lugar y se actualizan las 8 páginas juntas.

## Estructura de la home

Sigue el PDF de arriba a abajo:

1. **Hero** — panel bordó a la izquierda (*branding & diseño* + la Mac), foto de Luly a la
   derecha con la estrella rosa y el sticker *"Diseño con intención para marcas con intención"*.
2. **Branding** — bloque centrado con 4 mockups de marca en las esquinas.
3. **Social Media** — texto a la izquierda, feed de Afloré sobre la textura rosa a la derecha.
4. **Testimonios** — fondo fucsia, globo con forma de corazón y 10 burbujas de WhatsApp.
   **Las burbujas están hechas en HTML/CSS, no son capturas**: se editan en `pages/index.html`
   (el nombre del remitente lleva su color en el atributo `style="--de:#…"`).
5. **Proyectos** — texto + tira de 5 mockups a todo el ancho.
6. **Tienda** — bloque rosa.
7. **Hablemos!** — está en `partials/footer.html`, así que aparece en las 8 páginas.

## Las fotos y los mockups

Los **mockups de marca** (`mk-*.jpg`) salieron del propio PDF: son las piezas reales de
Vive Liviano, Alegría BeWell, grETa, Vigno Bar, Eleva, Afloré, Flash de Vida y Débora Pedace.
Se usan en la home y en el portafolio.

Las **fotos de Luly** salieron de la carpeta de Drive. Los originales quedaron en `originales/`.

| Archivo | Dónde aparece |
|---|---|
| `hero-luly.jpg` | foto principal de la home |
| `sobre-mi.jpg` | Contacto |
| `mk-*.jpg` | Branding, Proyectos, Portafolio, Tienda |
| `producto-*.jpg` | Tienda y Cositas Gratis |
| `mac-cafe.png`, `star-pink.png`, `star-gold.png`, `tulips.png`, `heart.png` | recortes con fondo transparente del PDF |
| `bg-rosa.jpg` | textura de fondo de la sección Social Media |
| `logo-byluly.png` | logo del menú |
| `badge-ring.png`, `badge-logo.png` | sello del pie: el aro gira, el "by luly" del centro queda fijo |

Para cambiar una: pisá el archivo en `img/` con el mismo nombre. Si el encuadre no te gusta,
`_recortar.py` lo rehace desde el original:

```bash
python3 _recortar.py IMG_6492.jpg hero-luly.jpg 900 1204 0.10
```

El último número es el encuadre vertical: 0 pega la foto arriba, 1 la pega abajo.

## Qué falta conectar

- **Formulario *Hablemos!*** (pie de las 8 páginas): hoy solo muestra un mensaje de éxito.
  Para que envíe de verdad hay que conectarlo a Formspree, Netlify Forms, EmailJS o un backend.
  Está marcado con un `TODO` en `script.js`.
- **Popup del calendario de contenido**: tampoco envía el mail todavía.
- **Carrito**: suma productos y calcula el total, pero se guarda solo en el navegador de cada
  visitante y el botón "Finalizar compra" no cobra nada. Para vender hay que enchufar una
  pasarela (Mercado Pago, Lemon Squeezy, Gumroad).
- **Usuarios de redes**: quedaron apuntando a `@byluly.dsg` en Instagram y TikTok y a
  `bylulydsg` en Pinterest. Si los usuarios reales son otros, se cambian en
  `partials/header.html` y `partials/footer.html`.
- **Nombres del portafolio**: puse los de los mockups del PDF. Si alguno no corresponde,
  se edita el `<figcaption>` en `pages/portafolio.html`.

## Los precios

Salieron de los lightboxes "Lee toda la info" del sitio de referencia (están en USD) con un 30%
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
tu diseñadora tiene 3 (300, 350 y 400).

Se editan en `pages/branding.html` y `pages/redes-sociales.html`, en las líneas
`pack__price` y `pack__before` de cada tarjeta.

## WhatsApp

El número está en **cuatro lugares**: un botón flotante abajo a la derecha en las 8 páginas,
el botón "Escribime por WhatsApp" del bloque *Hablemos!*, el ícono del menú y el número
escrito al lado del mail en el pie.

Todos abren el chat con un mensaje ya escrito: *"Hola Byluly! Quiero hablar de mi proyecto"*.
El botón usa el blood orange `#DD4E28`, igual que en el diseño.

El número vive en **un solo lugar**, arriba de `_build.py`:

```python
WPP_NUMERO  = '5491160169886'          # 54 (país) + 9 (celular) + 11 (área) + número
WPP_TEXTO   = 'Hola Byluly! Quiero hablar de mi proyecto'
WPP_DISPLAY = '+54 9 11 6016-9886'     # cómo se ve escrito en el pie
```

Lo cambiás ahí, corrés `python3 _build.py` y se actualiza en todo el sitio.

## Paleta

Los valores son los muestreados del PDF, no aproximaciones.

```
burgundy      #770523   bordó         → hero, cabeceras, Hablemos!
burgundy dark #55041A   bordó oscuro  → barra final del pie
cream         #F2E8D4   crema         → fondo general de las secciones
cream light   #FBF5E7   crema claro   → fondo del menú
peony         #FAD2E1   rosa claro    → botones, Tienda, textos sobre bordó
pistachio     #D0D996   verde         → "branding", "Hablemos!", botones
fuchsia       #EF0066   fucsia        → fondo de Testimonios, acentos
blood orange  #DD4E28   naranja       → botón de WhatsApp, badge del carrito
brown         #63422A   marrón        → Podcast y bloques secundarios
```

Todo vive en `:root`, arriba de `styles.css`.

## Tipografías

Son las mismas que usa el PDF:

- **Avenir Next** para todo el texto y los títulos sans (*branding & diseño*, *Hablemos!*).
  Viene instalada en Mac y iPhone; en Windows y Android cae a **Mulish**, de Google Fonts.
- **Times New Roman** para los títulos serif (*Creando marcas…*, *Lo que dicen mis clientes*).
  Donde no está instalada cae a **Tinos**, que es el clon libre de Times y tiene las mismas
  proporciones.

Se cambian con `--sans` y `--serif` en `:root`.

## preview.html

Es el sitio entero metido en un solo archivo (páginas + imágenes embebidas + un ruteo mínimo
en JS) para poder compartirlo por link sin hosting. Se genera con `python3 _build_preview.py`.
No es el sitio que se sube: eso son los `.html` sueltos.
