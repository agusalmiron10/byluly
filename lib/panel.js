// Lógica compartida del panel (/admin): sesión con contraseña y acceso a GitHub.
// La llave de GitHub (GITHUB_TOKEN, cargada en Cloudflare como Secret) nunca sale del servidor:
// el navegador solo recibe una cookie de sesión firmada.

export const REPO = 'agusalmiron10/byluly';
export const RAMA = 'main';
export const ARCHIVOS = ['home', 'identidad-de-marca', 'redes-sociales', 'portafolio', 'contacto', 'general'];

// huella PBKDF2 de la contraseña del panel (el código es público: la contraseña en sí no está escrita).
// 100000 vueltas: es el máximo que acepta PBKDF2 en Cloudflare Workers.
// Para cambiarla sin tocar código, cargar ADMIN_PASSWORD en Cloudflare.
const CLAVE = { sal: '836b0a16a40033354dcaabc4b2331f86', vueltas: 100000, huella: '10e3e5500881f558eed4540dd53cfbb5feee1a5b8ffbe066e2313c39f54918c5' };

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

function iguales(a, b) {
  const x = enc.encode(a), y = enc.encode(b);
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] || 0) ^ (y[i] || 0);
  return d === 0;
}

export async function claveCorrecta(clave, env) {
  if (env.ADMIN_PASSWORD) return iguales(clave, env.ADMIN_PASSWORD);
  const sal = new Uint8Array(CLAVE.sal.match(/../g).map((h) => parseInt(h, 16)));
  const base = await crypto.subtle.importKey('raw', enc.encode(clave), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: CLAVE.vueltas }, base, 256);
  return iguales(hex(bits), CLAVE.huella);
}

// ---------- sesión: cookie "vence.firma" firmada con HMAC ----------
const DURACION = 12 * 60 * 60 * 1000; // 12 horas

async function firma(texto, env) {
  const key = await crypto.subtle.importKey('raw', enc.encode('byluly-panel:' + (env.SESSION_SECRET || env.GITHUB_TOKEN || '')),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(texto)));
}

export async function cookieSesion(env) {
  const vence = String(Date.now() + DURACION);
  return `byluly_panel=${vence}.${await firma(vence, env)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DURACION / 1000}`;
}
export const cookieSalir = 'byluly_panel=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';

export async function sesionValida(request, env) {
  const m = (request.headers.get('Cookie') || '').match(/byluly_panel=(\d+)\.([0-9a-f]+)/);
  if (!m || Number(m[1]) < Date.now()) return false;
  return iguales(m[2], await firma(m[1], env));
}

// ---------- respuestas ----------
export const json = (datos, status = 200, extra = {}) =>
  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });

export const sinPermiso = () => json({ error: 'Tu sesión venció. Volvé a entrar con la contraseña.' }, 401);

// ---------- GitHub ----------
export async function github(env, ruta, opciones = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${ruta}`, {
    ...opciones,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'byluly-panel',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const datos = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, datos };
}

export function aBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
export function deBase64(b64) {
  const bin = atob(b64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
