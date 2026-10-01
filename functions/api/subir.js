// POST /api/subir { nombre, base64 } -> guarda la foto en img/subidas/ y devuelve su ruta
import { RAMA, sesionValida, sinPermiso, json, github } from '../../lib/panel.js';

// primeros bytes de cada formato, para aceptar solo fotos de verdad
const TIPOS = { jpg: [0xff, 0xd8], png: [0x89, 0x50], webp: [0x52, 0x49] };

export async function onRequestPost({ request, env }) {
  if (!(await sesionValida(request, env))) return sinPermiso();
  const { nombre, base64 } = await request.json().catch(() => ({}));
  if (!base64 || base64.length > 14_000_000) return json({ error: 'La foto es demasiado grande' }, 400);
  const inicio = Uint8Array.from(atob(base64.slice(0, 16)), (c) => c.charCodeAt(0));
  const ext = Object.keys(TIPOS).find((t) => TIPOS[t][0] === inicio[0] && TIPOS[t][1] === inicio[1]);
  if (!ext) return json({ error: 'El archivo no es una foto (JPG, PNG o WEBP)' }, 400);
  const base = String(nombre || 'foto').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'foto';
  const ruta = `img/subidas/${Date.now().toString(36)}-${base}.${ext}`;
  const r = await github(env, ruta, {
    method: 'PUT',
    body: JSON.stringify({ message: `Panel: sube ${ruta}`, content: base64, branch: RAMA }),
  });
  if (!r.ok) return json({ error: 'No se pudo subir la foto (' + r.status + ')' }, 502);
  return json({ ruta });
}
