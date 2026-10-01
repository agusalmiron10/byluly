/* =========================================================
   Panel de byluly
   Arma los formularios a partir de admin/esquema.json y guarda
   cada sección en content/<archivo>.json a través de /api/*.
   ========================================================= */
(function () {
  'use strict';

  var ICONOS = { home: '🏠', 'identidad-de-marca': '✦', 'redes-sociales': '📱', portafolio: '🖼️', contacto: '💌', general: '⚙️' };

  var esquema = [];
  var seccion = null;      // la sección abierta del esquema
  var datos = null;        // lo que se está editando
  var original = '';       // cómo estaba al cargar (para saber si hay cambios)
  var sha = '';
  var recien = {};       // fotos subidas en esta sesión: se muestran desde acá hasta que se publiquen

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var el = function (tag, attrs, hijos) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    (hijos || []).forEach(function (h) { if (h) e.appendChild(typeof h === 'string' ? document.createTextNode(h) : h); });
    return e;
  };

  function api(ruta, opciones) {
    opciones = opciones || {};
    if (opciones.body && typeof opciones.body !== 'string') opciones.body = JSON.stringify(opciones.body);
    opciones.headers = { 'Content-Type': 'application/json' };
    opciones.credentials = 'same-origin';
    return fetch(ruta, opciones).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && ruta !== '/api/login') { mostrarLogin(j.error); throw new Error(j.error); }
        if (!r.ok) throw new Error(j.error || 'Algo falló (' + r.status + ')');
        return j;
      });
    });
  }

  var toastTimer;
  function aviso(html, error) {
    var t = $('#toast');
    t.innerHTML = html;
    t.classList.toggle('is-error', !!error);
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, error ? 7000 : 6000);
  }

  // ---------- ingreso ----------
  function mostrarLogin(msg) {
    $('#app').hidden = true;
    $('#login').hidden = false;
    $('#loginError').textContent = msg || '';
    setTimeout(function () { $('#loginPass').focus(); }, 50);
  }

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('#loginBtn');
    btn.disabled = true; btn.textContent = 'Entrando…';
    $('#loginError').textContent = '';
    api('/api/login', { method: 'POST', body: { password: $('#loginPass').value } })
      .then(function () { $('#loginPass').value = ''; iniciar(); })
      .catch(function (err) { $('#loginError').textContent = err.message; })
      .then(function () { btn.disabled = false; btn.textContent = 'Entrar'; });
  });

  $('#salir').addEventListener('click', function () {
    if (hayCambios() && !confirm('Tenés cambios sin guardar. ¿Salir igual?')) return;
    api('/api/login', { method: 'DELETE' }).then(function () { original = JSON.stringify(datos); mostrarLogin(); });
  });

  // ---------- secciones ----------
  function iniciar() {
    $('#login').hidden = true;
    $('#app').hidden = false;
    var menu = $('#menu');
    menu.innerHTML = '';
    esquema.forEach(function (s) {
      menu.appendChild(el('button', { class: 'menu__item', type: 'button', 'data-archivo': s.archivo, onclick: function () { irA(s.archivo); } }, [
        el('span', { class: 'menu__icono', text: ICONOS[s.archivo] || '•' }),
        el('span', { class: 'menu__titulo', text: s.titulo })
      ]));
    });
    var pedido = location.hash.slice(1);
    irA(esquema.some(function (s) { return s.archivo === pedido; }) ? pedido : esquema[0].archivo, true);
  }

  function irA(archivo, sinPreguntar) {
    if (!sinPreguntar && hayCambios() && !confirm('Tenés cambios sin guardar en "' + seccion.titulo + '". ¿Cambiar de sección igual?')) return;
    seccion = esquema.filter(function (s) { return s.archivo === archivo; })[0];
    history.replaceState(null, '', '#' + archivo);
    Array.prototype.forEach.call(document.querySelectorAll('.menu__item'), function (b) {
      b.classList.toggle('is-activo', b.getAttribute('data-archivo') === archivo);
    });
    var cont = $('#contenido');
    cont.innerHTML = '<div class="cargando">Cargando ' + seccion.titulo + '…</div>';
    $('#guardar').hidden = true;
    window.scrollTo(0, 0);
    api('/api/contenido?archivo=' + archivo).then(function (r) {
      datos = r.datos; sha = r.sha; original = JSON.stringify(datos);
      pintar();
    }).catch(function (err) { cont.innerHTML = '<div class="cargando">' + err.message + '</div>'; });
  }

  function pintar() {
    var cont = $('#contenido');
    cont.innerHTML = '';
    cont.appendChild(el('div', { class: 'encabezado' }, [
      el('div', {}, [el('h1', { text: seccion.titulo }), el('p', { text: seccion.descripcion })]),
      el('a', { class: 'boton boton--suave', href: '/' + seccion.url, target: '_blank', rel: 'noopener', text: 'Ver esta página ↗' })
    ]));
    seccion.campos.forEach(function (campo, i) {
      if (campo.widget === 'object') {
        var det = el('details', { class: 'tarjeta' }, [el('summary', { text: campo.label })]);
        if (i === 0) det.open = true;
        var cuerpo = el('div', { class: 'tarjeta__cuerpo' });
        if (campo.hint) cuerpo.appendChild(el('p', { class: 'campo__ayuda', text: campo.hint }));
        if (!datos[campo.name]) datos[campo.name] = {};
        campo.fields.forEach(function (f) { cuerpo.appendChild(campoUI(f, datos[campo.name], f.name)); });
        det.appendChild(cuerpo);
        cont.appendChild(det);
      } else {
        var t = el('section', { class: 'tarjeta' }, [el('div', { class: 'tarjeta__cuerpo' }, [campoUI(campo, datos, campo.name)])]);
        cont.appendChild(t);
      }
    });
    actualizarBarra();
  }

  // ---------- cambios ----------
  function hayCambios() { return datos && JSON.stringify(datos) !== original; }
  function actualizarBarra() { $('#guardar').hidden = !hayCambios(); }
  function cambio() { actualizarBarra(); }

  window.addEventListener('beforeunload', function (e) { if (hayCambios()) { e.preventDefault(); e.returnValue = ''; } });

  $('#descartar').addEventListener('click', function () {
    if (!confirm('¿Descartar los cambios que no guardaste?')) return;
    datos = JSON.parse(original);
    pintar();
  });

  $('#guardarBtn').addEventListener('click', guardar);

  function pendientes(obj, lista) {
    lista = lista || [];
    if (Array.isArray(obj)) obj.forEach(function (v, i) { if (v && v.__subir) lista.push([obj, i]); else pendientes(v, lista); });
    else if (obj && typeof obj === 'object') Object.keys(obj).forEach(function (k) {
      if (obj[k] && obj[k].__subir) lista.push([obj, k]); else pendientes(obj[k], lista);
    });
    return lista;
  }

  function guardar() {
    var btn = $('#guardarBtn'), txt = $('#guardarTexto');
    btn.disabled = true; $('#descartar').disabled = true;
    var fotos = pendientes(datos);
    var n = 0;
    var subir = fotos.reduce(function (p, par) {
      return p.then(function () {
        n++;
        btn.textContent = 'Subiendo foto ' + n + ' de ' + fotos.length + '…';
        var f = par[0][par[1]];
        return api('/api/subir', { method: 'POST', body: { nombre: f.nombre, base64: f.__subir.split(',')[1] } })
          .then(function (r) { recien[r.ruta] = f.__subir; par[0][par[1]] = r.ruta; });
      });
    }, Promise.resolve());
    subir.then(function () {
      btn.textContent = 'Guardando…';
      return api('/api/contenido', { method: 'PUT', body: { archivo: seccion.archivo, datos: datos, sha: sha } });
    }).then(function (r) {
      sha = r.sha; original = JSON.stringify(datos);
      pintar();
      aviso('¡Guardado! ✨ En 2 o 3 minutos lo vas a ver en la web. <a href="/' + seccion.url + '" target="_blank" rel="noopener">Ver página ↗</a>');
    }).catch(function (err) {
      aviso(err.message, true);
    }).then(function () {
      btn.disabled = false; $('#descartar').disabled = false; btn.textContent = 'Guardar cambios'; txt.textContent = 'Tenés cambios sin guardar';
      actualizarBarra();
    });
  }

  // ---------- fotos ----------
  function urlFoto(v) {
    if (!v) return '';
    if (v.__subir) return v.__subir;
    if (recien[v]) return recien[v];
    return '/' + String(v).replace(/^\//, '');
  }

  function elegirFoto(listo) {
    var input = el('input', { type: 'file', accept: 'image/*' });
    input.addEventListener('change', function () {
      var archivo = input.files[0];
      if (!archivo) return;
      achicar(archivo).then(function (dataUrl) { listo({ __subir: dataUrl, nombre: archivo.name }); })
        .catch(function () { aviso('No se pudo leer esa foto. Probá con otra (JPG o PNG).', true); });
    });
    input.click();
  }

  // achica la foto a 2000 px como máximo para que la web cargue rápido
  function achicar(archivo) {
    return new Promise(function (ok, mal) {
      var img = new Image();
      var url = URL.createObjectURL(archivo);
      img.onload = function () {
        var max = 2000, w = img.naturalWidth, h = img.naturalHeight;
        var k = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        ok(c.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = mal;
      img.src = url;
    });
  }

  function verGrande(src) { if (src) window.open(src, '_blank'); }

  // ---------- campos ----------
  function etiqueta(campo) {
    return el('span', { class: 'campo__etiqueta', text: campo.label });
  }
  function ayuda(campo) { return campo.hint ? el('p', { class: 'campo__ayuda', text: campo.hint }) : null; }

  function campoUI(campo, padre, clave) {
    var w = campo.widget;
    if (w === 'object') return objetoUI(campo, padre, clave);
    if (w === 'list') return listaUI(campo, padre, clave);
    if (w === 'image') return fotoUI(campo, padre, clave);
    if (w === 'boolean') return interruptorUI(campo, padre, clave);
    if (w === 'select') return chipsUI(campo, padre, clave);
    if (w === 'color') return colorUI(campo, padre, clave);
    return textoUI(campo, padre, clave);
  }

  function textoUI(campo, padre, clave) {
    var caja = el('label', { class: 'campo' }, [etiqueta(campo)]);
    var valor = padre[clave] == null ? '' : padre[clave];
    var input;
    if (campo.widget === 'text') {
      input = el('textarea', { rows: Math.min(10, Math.max(3, String(valor).split('\n').length + 1)) });
      input.value = valor;
    } else {
      input = el('input', { type: campo.widget === 'number' ? 'number' : 'text' });
      input.value = valor;
    }
    var inicial = String(valor);
    input.addEventListener('input', function () {
      padre[clave] = campo.widget === 'number' ? (parseInt(input.value, 10) || 0) : input.value;
      caja.classList.toggle('campo--cambiado', input.value !== inicial);
      if (campo.widget === 'text') input.rows = Math.min(14, Math.max(3, input.value.split('\n').length + 1));
      cambio();
    });
    if (campo.widget === 'text') {
      // botones de formato: envuelven lo seleccionado con ** (negrita) o * (cursiva)
      var envolver = function (marca) {
        var i = input.selectionStart, f = input.selectionEnd, v = input.value;
        var sel = v.slice(i, f) || 'texto';
        input.value = v.slice(0, i) + marca + sel + marca + v.slice(f);
        input.focus();
        input.setSelectionRange(i + marca.length, i + marca.length + sel.length);
        input.dispatchEvent(new Event('input'));
      };
      var barra = el('div', { class: 'formato' }, [
        el('button', { type: 'button', class: 'formato__b', title: 'Negrita', onclick: function (e) { e.preventDefault(); envolver('**'); } }, [el('b', { text: 'B' }), ' Negrita']),
        el('button', { type: 'button', class: 'formato__b', title: 'Cursiva', onclick: function (e) { e.preventDefault(); envolver('*'); } }, [el('i', { text: 'I' }), ' Cursiva'])
      ]);
      caja.appendChild(barra);
    }
    caja.appendChild(input);
    var a = ayuda(campo); if (a) caja.appendChild(a);
    return caja;
  }

  function interruptorUI(campo, padre, clave) {
    var input = el('input', { type: 'checkbox' });
    input.checked = !!padre[clave];
    input.addEventListener('change', function () { padre[clave] = input.checked; cambio(); });
    return el('div', { class: 'campo' }, [el('label', { class: 'interruptor' }, [input, el('span', { class: 'campo__etiqueta', text: campo.label })]), ayuda(campo)]);
  }

  function chipsUI(campo, padre, clave) {
    if (!Array.isArray(padre[clave])) padre[clave] = [];
    var chips = el('div', { class: 'chips' });
    campo.options.forEach(function (op) {
      var b = el('button', { type: 'button', class: 'chip' + (padre[clave].indexOf(op.value) > -1 ? ' is-on' : ''), text: op.label });
      b.addEventListener('click', function () {
        var i = padre[clave].indexOf(op.value);
        if (i > -1) padre[clave].splice(i, 1); else padre[clave].push(op.value);
        b.classList.toggle('is-on', i === -1);
        cambio();
      });
      chips.appendChild(b);
    });
    return el('div', { class: 'campo' }, [etiqueta(campo), chips, ayuda(campo)]);
  }

  function colorUI(campo, padre, clave) {
    var input = el('input', { type: 'color' });
    input.value = /^#[0-9a-f]{6}$/i.test(padre[clave] || '') ? padre[clave] : (campo.default || '#770523');
    var muestra = el('span', { class: 'campo__ayuda', text: padre[clave] ? '' : '(sin color: se usa bordó)' });
    input.addEventListener('input', function () { padre[clave] = input.value; muestra.textContent = ''; cambio(); });
    return el('div', { class: 'campo' }, [etiqueta(campo), el('div', { class: 'color' }, [input, muestra])]);
  }

  function fotoUI(campo, padre, clave) {
    var img = el('img', { class: 'foto__img', alt: '' });
    var nueva = el('span', { class: 'foto__nueva' });
    var refrescar = function () {
      img.src = urlFoto(padre[clave]);
      nueva.textContent = padre[clave] && padre[clave].__subir ? 'Foto nueva: se sube al guardar' : '';
    };
    img.addEventListener('click', function () { verGrande(img.src); });
    var btn = el('button', { type: 'button', class: 'boton boton--suave boton--chico', text: '📷 Cambiar foto' });
    btn.addEventListener('click', function () { elegirFoto(function (f) { padre[clave] = f; refrescar(); cambio(); }); });
    refrescar();
    return el('div', { class: 'campo' }, [etiqueta(campo), el('div', { class: 'foto' }, [img, el('div', { class: 'foto__acciones' }, [btn, nueva, ayuda(campo)])])]);
  }

  function objetoUI(campo, padre, clave) {
    if (!padre[clave] || typeof padre[clave] !== 'object') padre[clave] = {};
    var det = el('details', { class: 'bloque' }, [el('summary', { text: campo.label })]);
    var cuerpo = el('div', { class: 'bloque__cuerpo' });
    var a = ayuda(campo); if (a) cuerpo.appendChild(a);
    campo.fields.forEach(function (f) { cuerpo.appendChild(campoUI(f, padre[clave], f.name)); });
    det.appendChild(cuerpo);
    if (campo.collapsed === false) det.open = true;
    return det;
  }

  // ---------- listas ----------
  function botonIcono(txt, titulo, accion, deshabilitado) {
    var b = el('button', { type: 'button', class: 'boton--icono', title: titulo, 'aria-label': titulo, text: txt });
    if (deshabilitado) b.disabled = true;
    b.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); accion(); });
    return b;
  }

  function mover(arr, i, d) { var x = arr[i]; arr.splice(i, 1); arr.splice(i + d, 0, x); }

  function listaUI(campo, padre, clave) {
    if (!Array.isArray(padre[clave])) padre[clave] = [];
    var caja = el('div', { class: 'campo' }, [etiqueta(campo), ayuda(campo)]);
    var zona = el('div');
    caja.appendChild(zona);
    var abierto = -1;
    var redibujar = function () { zona.innerHTML = ''; zona.appendChild(contenidoLista()); cambio(); };

    var contenidoLista = function () {
      var arr = padre[clave];
      var singular = campo.label_singular || 'ítem';

      // lista de fotos -> galería
      if (campo.field && campo.field.widget === 'image') {
        var g = el('div', { class: 'galeria' });
        arr.forEach(function (v, i) {
          var img = el('img', { src: urlFoto(v), alt: '' });
          img.addEventListener('click', function () { verGrande(img.src); });
          g.appendChild(el('div', { class: 'galeria__item' }, [
            img,
            i === 0 ? el('span', { class: 'galeria__portada', text: 'Portada' }) : null,
            el('div', { class: 'galeria__botones' }, [
              botonIcono('←', 'Mover antes', function () { mover(arr, i, -1); redibujar(); }, i === 0),
              botonIcono('→', 'Mover después', function () { mover(arr, i, 1); redibujar(); }, i === arr.length - 1),
              botonIcono('🔄', 'Cambiar esta foto', function () { elegirFoto(function (f) { arr[i] = f; redibujar(); }); }),
              botonIcono('✕', 'Quitar foto', function () { if (confirm('¿Quitar esta foto?')) { arr.splice(i, 1); redibujar(); } })
            ])
          ]));
        });
        var add = el('button', { type: 'button', class: 'galeria__agregar' }, [el('span', {}, [el('b', { text: '+' }), 'Agregar foto'])]);
        add.addEventListener('click', function () { elegirFoto(function (f) { arr.push(f); redibujar(); }); });
        g.appendChild(add);
        return g;
      }

      var lista = el('div', { class: 'lista' });

      // lista de textos simples
      if (campo.field) {
        arr.forEach(function (v, i) {
          var input = el('input', { type: 'text' });
          input.value = v == null ? '' : v;
          input.addEventListener('input', function () { arr[i] = input.value; cambio(); });
          lista.appendChild(el('div', { class: 'item item--simple' }, [
            input,
            botonIcono('↑', 'Subir', function () { mover(arr, i, -1); redibujar(); }, i === 0),
            botonIcono('↓', 'Bajar', function () { mover(arr, i, 1); redibujar(); }, i === arr.length - 1),
            botonIcono('✕', 'Borrar', function () { arr.splice(i, 1); redibujar(); })
          ]));
        });
        lista.appendChild(el('button', { type: 'button', class: 'boton boton--suave boton--chico agregar', text: '+ Agregar', onclick: function () { arr.push(''); redibujar(); var ins = zona.querySelectorAll('input'); if (ins.length) ins[ins.length - 1].focus(); } }));
        return lista;
      }

      // lista de objetos (proyectos, testimonios, tarjetas…)
      arr.forEach(function (item, i) {
        var mini = miniatura(campo, item);
        var res = resumen(campo, item, i);
        var cabeza = el('div', { class: 'item__cabeza' }, [
          mini ? el('img', { class: 'item__mini', src: mini, alt: '' }) : null,
          el('div', { class: 'item__resumen' }, [res[0], res[1] ? el('small', { text: res[1] }) : null]),
          el('div', { class: 'item__botones' }, [
            botonIcono('↑', 'Subir', function () { mover(arr, i, -1); abierto = -1; redibujar(); }, i === 0),
            botonIcono('↓', 'Bajar', function () { mover(arr, i, 1); abierto = -1; redibujar(); }, i === arr.length - 1),
            botonIcono('✕', 'Borrar', function () { if (confirm('¿Borrar "' + res[0] + '"?')) { arr.splice(i, 1); abierto = -1; redibujar(); } })
          ])
        ]);
        var cuerpo = el('div', { class: 'item__cuerpo' });
        campo.fields.forEach(function (f) { cuerpo.appendChild(campoUI(f, item, f.name)); });
        cuerpo.hidden = abierto !== i;
        cabeza.addEventListener('click', function () { cuerpo.hidden = !cuerpo.hidden; abierto = cuerpo.hidden ? -1 : i; });
        lista.appendChild(el('div', { class: 'item' }, [cabeza, cuerpo]));
      });
      lista.appendChild(el('button', {
        type: 'button', class: 'boton boton--suave boton--chico agregar', text: '+ Agregar ' + singular,
        onclick: function () { arr.push(nuevoItem(campo)); abierto = arr.length - 1; redibujar(); }
      }));
      return lista;
    };

    zona.appendChild(contenidoLista());
    return caja;
  }

  function nuevoItem(campo) {
    var o = {};
    campo.fields.forEach(function (f) {
      if (f.widget === 'list' || (f.widget === 'select' && f.multiple)) o[f.name] = [];
      else if (f.widget === 'boolean') o[f.name] = !!f.default;
      else if (f.widget === 'number') o[f.name] = 0;
      else if (f.widget === 'object') o[f.name] = {};
      else o[f.name] = f.default || '';
    });
    return o;
  }

  function miniatura(campo, item) {
    for (var k = 0; k < campo.fields.length; k++) {
      var f = campo.fields[k];
      if (f.widget === 'image' && item[f.name]) return urlFoto(item[f.name]);
      if (f.widget === 'list' && f.field && f.field.widget === 'image' && item[f.name] && item[f.name][0]) return urlFoto(item[f.name][0]);
    }
    return '';
  }

  function resumen(campo, item, i) {
    var textos = campo.fields.filter(function (f) { return (f.widget === 'string' || f.widget === 'text' || f.widget === 'number') && item[f.name] !== '' && item[f.name] != null; })
      .map(function (f) { return String(item[f.name]).replace(/\*/g, '').replace(/\n/g, ' '); });
    if (campo.name === 'numeros' && item.numero != null) return ['+' + item.numero + ' ' + (item.etiqueta || ''), ''];
    return [textos[0] || ((campo.label_singular || 'Ítem') + ' ' + (i + 1)), textos[1] || ''];
  }

  // ---------- arranque ----------
  fetch('esquema.json').then(function (r) { return r.json(); }).then(function (e) {
    esquema = e;
    return api('/api/login');
  }).then(function (r) {
    if (r.sesion) iniciar(); else mostrarLogin(r.conectado === false ? 'El panel todavía no está conectado (falta GITHUB_TOKEN en Cloudflare).' : '');
  }).catch(function () { mostrarLogin(); });
})();
