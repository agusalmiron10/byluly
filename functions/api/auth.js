// Inicio de sesión del panel (/admin) con contraseña, sin cuentas.
// Variables a cargar en Cloudflare Pages (Settings > Variables and Secrets, como "Secret"):
//   ADMIN_PASSWORD  la contraseña del panel
//   GITHUB_TOKEN    llave de GitHub con permiso de escritura SOLO sobre este repositorio
// Si la contraseña es correcta, se le pasa la llave al panel (protocolo de Decap CMS)
// y el panel guarda los cambios en GitHub; Cloudflare vuelve a publicar la web.

const PAGINA = (mensaje) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Ingresar | Studio Byluly</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FAD2E1;font-family:"Avenir Next",Avenir,system-ui,sans-serif;color:#770523}
  form{background:#FBF5E7;padding:34px 30px;border-radius:24px;width:min(320px,86vw);text-align:center;box-shadow:0 20px 50px rgba(84,3,20,.18)}
  img{width:120px;margin-bottom:10px}
  h1{font-family:"Times New Roman",serif;font-weight:400;font-size:30px;margin:0 0 18px}
  input{width:100%;box-sizing:border-box;padding:12px 16px;border-radius:999px;border:1.5px solid #E0AAB8;background:#fff;font:inherit;font-size:16px;color:#770523;text-align:center}
  button{margin-top:14px;width:100%;padding:12px;border:0;border-radius:999px;background:#770523;color:#FBF5E7;font:inherit;font-size:16px;cursor:pointer}
  p{margin:12px 0 0;font-size:14px;color:#EF0066;min-height:1.2em}
</style></head><body>
<form method="post">
  <img src="/img/logo-byluly.png" alt="byluly">
  <h1>Panel</h1>
  <input type="password" name="password" placeholder="Contraseña" autofocus required>
  <button type="submit">Entrar</button>
  <p>${mensaje}</p>
</form></body></html>`;

const html = (body, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

// comparación que tarda lo mismo acierte o no (para no dar pistas sobre la contraseña)
function iguales(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] || 0) ^ (y[i] || 0);
  return d === 0;
}

export async function onRequestGet({ env }) {
  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN) {
    return html(PAGINA('Falta configurar el panel en Cloudflare (ADMIN_PASSWORD y GITHUB_TOKEN).'), 500);
  }
  return html(PAGINA(''));
}

export async function onRequestPost({ request, env }) {
  const datos = await request.formData();
  const clave = String(datos.get('password') || '');
  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN || !iguales(clave, env.ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 1200)); // frena a quien pruebe contraseñas al azar
    return html(PAGINA('Contraseña incorrecta'), 401);
  }
  const origin = new URL(request.url).origin;
  const mensaje = 'authorization:github:success:' + JSON.stringify({ token: env.GITHUB_TOKEN, provider: 'github' });
  return html(`<!doctype html><html><body><script>
    (function () {
      function recibir(e) {
        if (e.origin !== ${JSON.stringify(origin)}) return;
        window.opener.postMessage(${JSON.stringify(mensaje)}, e.origin);
        window.removeEventListener('message', recibir);
      }
      window.addEventListener('message', recibir);
      window.opener.postMessage('authorizing:github', ${JSON.stringify(origin)});
    })();
  </script></body></html>`);
}
