"""Recorta una foto de originales/ y la deja en img/.

    python3 _recortar.py IMG_6492.jpg hero.jpg 900 1500 0.10

El último número es el encuadre vertical: 0 = pegado arriba, 1 = pegado abajo.
Subilo si querés bajar el recorte, bajalo si querés subirlo.
"""
import sys
from PIL import Image, ImageOps

src, dst, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
bias = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5

im = ImageOps.exif_transpose(Image.open('originales/' + src)).convert('RGB')
sw, sh = im.size
ratio = w / h
if sw / sh > ratio:
    nw = int(sh * ratio); x = (sw - nw) // 2
    im = im.crop((x, 0, x + nw, sh))
else:
    nh = int(sw / ratio); y = int((sh - nh) * bias)
    im = im.crop((0, y, sw, y + nh))
im.resize((w, h), Image.LANCZOS).save('img/' + dst, 'JPEG', quality=82,
                                      optimize=True, progressive=True)
print('img/' + dst, 'listo')
