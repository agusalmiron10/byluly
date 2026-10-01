// GET /api/contenido?archivo=home            -> { datos, sha }
// PUT /api/contenido { archivo, datos, sha } -> guarda content/<archivo>.json en GitHub
import { ARCHIVOS, RAMA, sesionValida, sinPermiso, json, github, aBase64, deBase64 } from '../../lib/panel.js';

export async function onRequestGet({ request, env }) {
  if (!(await sesionValida(request, env))) return sinPermiso();
  const archivo = new URL(request.url).searchParams.get('archivo');
  if (!ARCHIVOS.includes(archivo)) return json({ error: 'Sección desconocida' }, 400);
  const r = await github(env, `content/${archivo}.json?ref=${RAMA}`);
  if (!r.ok) return json({ error: 'No se pudo leer el contenido (' + r.status + ')' }, 502);
  return json({ datos: JSON.parse(deBase64(r.datos.content)), sha: r.datos.sha });
}

export async function onRequestPut({ request, env }) {
  if (!(await sesionValida(request, env))) return sinPermiso();
  const { archivo, datos, sha } = await request.json().catch(() => ({}));
  if (!ARCHIVOS.includes(archivo) || !datos || typeof datos !== 'object') return json({ error: 'Datos inválidos' }, 400);
  const texto = JSON.stringify(datos, null, 2) + '\n';
  const r = await github(env, `content/${archivo}.json`, {
    method: 'PUT',
    body: JSON.stringify({ message: `Panel: actualiza ${archivo}`, content: aBase64(new TextEncoder().encode(texto)), sha, branch: RAMA }),
  });
  if (r.status === 409 || r.status === 422) {
    return json({ error: 'Alguien guardó cambios en esta sección mientras editabas. Recargá la página y volvé a hacer tu cambio.' }, 409);
  }
  if (!r.ok) return json({ error: 'No se pudo guardar (' + r.status + ')' }, 502);
  return json({ sha: r.datos.content.sha });
}
