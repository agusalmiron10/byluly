// POST /api/login  { password }  -> deja la sesión iniciada (cookie)
// GET  /api/login                 -> { sesion: true|false }
// DELETE /api/login               -> cierra la sesión
import { claveCorrecta, cookieSesion, cookieSalir, sesionValida, json } from '../../lib/panel.js';

export async function onRequestGet({ request, env }) {
  return json({ sesion: await sesionValida(request, env), conectado: !!env.GITHUB_TOKEN });
}

export async function onRequestPost({ request, env }) {
  const { password } = await request.json().catch(() => ({}));
  if (!(await claveCorrecta(String(password || ''), env))) {
    await new Promise((r) => setTimeout(r, 1200)); // frena a quien pruebe contraseñas al azar
    return json({ error: 'Contraseña incorrecta' }, 401);
  }
  if (!env.GITHUB_TOKEN) return json({ error: 'El panel todavía no está conectado: falta GITHUB_TOKEN en Cloudflare.' }, 500);
  return json({ sesion: true }, 200, { 'Set-Cookie': await cookieSesion(env) });
}

export async function onRequestDelete() {
  return json({ sesion: false }, 200, { 'Set-Cookie': cookieSalir });
}
