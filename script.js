/* =========================================================
   Studio Byluly — interacciones
   Un solo archivo para todas las páginas. Cada bloque se
   activa solo si los elementos que necesita están en el DOM.
   ========================================================= */
(function () {
  'use strict';

  var timer, popupTimer;

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Menú mobile ---------- */
  var burger = $('#burger');
  var nav = $('#nav');

  if (burger && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    burger.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.matches('.nav__link:not(.nav__toggle), .nav__sublink')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------- Submenú de Servicios (en mobile se abre al tocar) ---------- */
  var toggle = $('.nav__toggle');
  var submenu = $('#submenu');
  if (toggle && submenu) {
    toggle.addEventListener('click', function () {
      var open = submenu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- Sombra del header al scrollear ---------- */
  var header = $('#header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-stuck', window.scrollY > 10);
    }, { passive: true });
  }

  /* ---------- Aparición de secciones ---------- */
  var reveals = $$('.reveal, .stagger');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Slider de testimonios ---------- */
  var track = $('#track');
  var dotsBox = $('#dots');
  if (track && dotsBox) {
    var slides = track.children.length;
    var index = 0;

    var go = function (i) {
      index = (i + slides) % slides;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      Array.prototype.forEach.call(dotsBox.children, function (d, n) {
        d.classList.toggle('is-active', n === index);
      });
    };
    var autoplay = function () {
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 6500);
    };

    for (var i = 0; i < slides; i++) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Testimonio ' + (i + 1));
      dot.dataset.i = i;
      dotsBox.appendChild(dot);
    }
    dotsBox.addEventListener('click', function (e) {
      if (e.target.dataset.i !== undefined) { go(+e.target.dataset.i); autoplay(); }
    });
    $('#prev').addEventListener('click', function () { go(index - 1); autoplay(); });
    $('#next').addEventListener('click', function () { go(index + 1); autoplay(); });

    var x0 = null;
    var slider = $('#slider');
    slider.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { go(index + (dx < 0 ? 1 : -1)); autoplay(); }
      x0 = null;
    });

    go(0);
    autoplay();
  }

  /* ---------- Marquee: duplico las tarjetas para el loop infinito ---------- */
  var mt = $('#marqueeTrack');
  if (mt) mt.innerHTML += mt.innerHTML;

  /* ---------- Tira de proyectos: mismo truco, imágenes duplicadas para el loop ---------- */
  var tiraTrack = $('#tiraTrack');
  if (tiraTrack) {
    Array.prototype.slice.call(tiraTrack.children).forEach(function (img) {
      var clone = img.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('alt', '');
      tiraTrack.appendChild(clone);
    });
  }

  /* ---------- Formularios de contacto ---------- */
  [['#form', '#formMsg'], ['#formContacto', '#formContactoMsg']].forEach(function (pair) {
    var form = $(pair[0]);
    if (!form) return;
    var msg = $(pair[1], form) || $(pair[1]);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (!data.get('nombre') || !data.get('email')) {
        if (msg) msg.textContent = 'Completá al menos tu nombre y tu email.';
        return;
      }
      // TODO: conectar con el servicio de envío (Formspree, Netlify Forms, backend propio...)
      if (msg) msg.textContent = '¡Gracias! Te voy a estar escribiendo en menos de un día.';
      form.reset();
    });
  });

  /* ---------- Popup del recurso gratis (solo en la home) ---------- */
  var lb = $('#lightbox');
  if (lb) {
    var openLb = function () {
      lb.hidden = false;
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
    };
    var closeLb = function () {
      lb.classList.remove('is-open');
      setTimeout(function () { lb.hidden = true; }, 350);
      try { sessionStorage.setItem('byluly_lb', '1'); } catch (err) {}
    };

    var seen = false;
    try { seen = sessionStorage.getItem('byluly_lb') === '1'; } catch (err) {}
    if (!seen) popupTimer = setTimeout(openLb, 7000);

    $('#lbClose').addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lb.hidden) closeLb();
    });
    $('#lbForm').addEventListener('submit', function (e) {
      e.preventDefault();
      // TODO: conectar con el servicio de email marketing
      e.target.innerHTML = '<p style="margin:0;font-size:15px">¡Listo! Revisá tu casilla en los próximos días.</p>';
      setTimeout(closeLb, 2200);
    });
  }

  /* ---------- Modal "qué incluye" de cada pack de Branding ---------- */
  var packModal = $('#packModal');
  if (packModal) {
    var CALL = 'Con llamada de presentación';
    var IDENTIDAD = {
      h: 'Propuesta de Identidad de Marca',
      items: ['Tipografías', 'Paleta de colores', 'Iconografía', 'Stickers/Ilustraciones de marca', 'Patrón de marca/Texturas', 'Slogan', 'Representaciones de Marca']
    };
    var ESTRATEGIA = {
      h: 'Estrategia de Marketing + Dirección Creativa',
      items: ['Brief', 'Estrategia de Marca', 'Análisis de competencia, definir la propuesta de valor, la visión, el propósito, los objetivos, la personalidad, el tono de voz como marca; público objetivo.', '2 Propuestas de Moodboard']
    };
    var EXTRAS_BASE = ['Regalo: 6 destacadas para Instagram', 'Manual de Marca', 'Archivos exportados en png, jpg, pdf y svg (aclarar si querés los editables en Illustrator)'];
    var SEMANA1 = { h: 'Semana 1 — Conocernos', items: ['Preparación de Drive', 'Entrega de términos y condiciones / calendario / proporción de fotografía', 'Entrega del Brief', 'Investigación de mercado y análisis de marca', 'Entrega de los 2 Moodboard'], call: true };

    var PACKS = {
      core: {
        eyebrow: 'IDENTIDAD DE MARCA', title: 'THE CORE', duration: 'Duración: 4 semanas',
        sections: [ESTRATEGIA, IDENTIDAD], extras: EXTRAS_BASE,
        weeks: [
          SEMANA1,
          { h: 'Semana 2 — Primeras pruebas', items: ['Diseño de la Identidad de Marca completa'], call: true },
          { h: 'Semana 3 — Correcciones', items: ['1 ronda de cambios'], call: true },
          { h: 'Semana 4 — Entrega final', items: ['Preparación de los archivos a entregar | Manual de Marca'] }
        ],
        price: 'Inversión: 350 USD', wpp: 'THE CORE'
      },
      object: {
        eyebrow: 'IDENTIDAD DE MARCA · PACKAGING', title: 'THE OBJECT', duration: 'Duración: 4 semanas',
        sections: [ESTRATEGIA, IDENTIDAD, { h: 'Packaging (hasta 6 a elección)', items: ['Ejemplos: cajas, vasos, servilletas, bolsas, ploteo para vidrio, cuadros, merchandising, etc.', 'Incluye el plano guía exportado listo para imprimir (las medidas y la maqueta)'] }],
        extras: EXTRAS_BASE,
        weeks: [
          SEMANA1,
          { h: 'Semana 2 — Primeras pruebas', items: ['Diseño de la Identidad de Marca completa'], call: true },
          { h: 'Semana 3 — Correcciones', items: ['Preparación de los archivos a entregar | Manual de Marca', 'Incluye 1 ronda de cambios'] },
          { h: 'Semana 4 — Entrega final', items: ['Preparación del packaging con las medidas respectivas y los planos guía', 'Incluye 1 ronda de cambios'], call: true }
        ],
        price: 'Inversión: 550 USD', wpp: 'THE OBJECT'
      },
      voice: {
        eyebrow: 'IDENTIDAD DE MARCA · REDES SOCIALES', title: 'THE VOICE', duration: 'Duración: 4 semanas',
        sections: [ESTRATEGIA, IDENTIDAD, { h: 'Plantillas para Redes Sociales', items: ['Entregadas en Illustrator o Canva', '9 posts para Instagram', '4 historias para Instagram', '2 portadas para Reels', '(puede incluir banners)'] }],
        extras: EXTRAS_BASE,
        weeks: [
          SEMANA1,
          { h: 'Semana 2 — Primeras pruebas', items: ['Diseño de la Identidad de Marca completa'], call: true },
          { h: 'Semana 3 — Correcciones', items: ['1 ronda de cambios'], call: true },
          { h: 'Semana 4 — Entrega final', items: ['Preparación de los archivos a entregar | Manual de Marca'] }
        ],
        price: 'Inversión: 430 USD', wpp: 'THE VOICE'
      },
      space: {
        eyebrow: 'IDENTIDAD DE MARCA · WEB', title: 'THE SPACE', duration: 'Plan esencial + página web',
        tiers: [
          { name: 'Landing Page', audience: 'Ideal para: emprendedores, lanzamientos, servicios únicos, campañas en redes.', items: ['1 landing page estratégica', 'Diseño alineado al branding', 'Estructura pensada para conversión', 'Responsive (mobile)', 'Formulario de contacto o WhatsApp', 'Llamado a la acción claros', 'SEO básico', '1 ronda de cambios'], price: '600 USD' },
          { name: 'Web profesional', audience: 'Ideal para: marcas que quieren presencia sólida y confianza.', items: ['Home + hasta 5 páginas (servicios, sobre, portfolio, blog básico, contacto)', 'Diseño alineado al branding', 'Copywriting', 'Responsive (mobile)', 'Formulario de contacto o WhatsApp', 'Llamado a la acción claros', 'SEO básico', '1 ronda de cambios'], price: '850 USD' },
          { name: 'Tienda Online', audience: 'Ideal para: marcas que quieren vender y escalar.', items: ['Home + categorías + fichas de producto', 'Carga inicial de hasta 20 productos', 'Copy básico de productos', 'Carrito, checkout y pasarela de pago', 'Responsive, SEO básico'], price: '1050 USD' }
        ],
        weeks: [
          SEMANA1,
          { h: 'Semana 2 — Primeras pruebas', items: ['Diseño de la Identidad de Marca completa + diseño web'], call: true },
          { h: 'Semana 3 — Correcciones', items: ['Correcciones, construcción de la página'], call: true },
          { h: 'Semana 4 — Entrega final', items: ['Preparación de los archivos finales, Manual de Marca y página web'] }
        ],
        wpp: 'THE SPACE'
      },
      universe: {
        eyebrow: 'IDENTIDAD DE MARCA · PACKAGING · REDES SOCIALES', title: 'THE UNIVERSE', duration: 'Duración: 5 semanas',
        sections: [ESTRATEGIA, IDENTIDAD,
          { h: 'Plantillas para Redes Sociales', items: ['Entregadas en Illustrator o Canva', '9 posts para Instagram', '4 historias para Instagram', '2 portadas para Reels', '(puede incluir banners)'] },
          { h: 'Packaging', items: ['Ejemplos: cajas, vasos, servilletas, bolsas, ploteo para vidrio, cuadros, merchandising, etc.', 'En el caso de restaurantes puede incluir menú', 'Incluye el plano guía exportado listo para imprimir (las medidas y la maqueta)'] }
        ],
        extras: EXTRAS_BASE,
        weeks: [
          SEMANA1,
          { h: 'Semana 2 — Primeras pruebas', items: ['Diseño de la Identidad de Marca completa'], call: true },
          { h: 'Semana 3 — Correcciones', items: ['Preparación de los archivos finales'] },
          { h: 'Semanas 4 y 5 — Entrega final', items: ['Preparación del packaging con las medidas respectivas y los planos guía', 'Preparación de las plantillas para redes sociales'] }
        ],
        price: 'Inversión: 690 USD', wpp: 'THE UNIVERSE'
      }
    };

    var listHtml = function (items) {
      return '<ul>' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
    };
    var leftHtml = function (p) {
      var h = '<p class="eyebrow">' + p.eyebrow + '</p><h3 id="packModalTitle">' + p.title + '</h3><p class="pack-modal__duration">' + p.duration + '</p>';
      if (p.tiers) {
        h += p.tiers.map(function (t) {
          return '<div class="pack-modal__tier"><h4>' + t.name + '</h4><p class="pack-modal__audience">' + t.audience + '</p>' + listHtml(t.items) + '<p class="pack-modal__tier-price">Inversión: ' + t.price + '</p></div>';
        }).join('');
      } else {
        h += p.sections.map(function (s) { return '<h4>' + s.h + '</h4>' + listHtml(s.items); }).join('');
        h += p.extras.map(function (e) { return '<p class="pack-modal__extra">' + e + '</p>'; }).join('');
      }
      return h;
    };
    var rightHtml = function (p, wppHref) {
      var h = '<h4 class="pack-modal__proceso">Proceso</h4>';
      h += p.weeks.map(function (w) {
        return '<div class="pack-modal__week"><h5>' + w.h + '</h5>' + listHtml(w.items) + (w.call ? '<p class="pack-modal__call">' + CALL + '</p>' : '') + '</div>';
      }).join('');
      if (p.price) h += '<p class="pack-modal__total">' + p.price + '</p>';
      h += '<a href="' + wppHref + '" target="_blank" rel="noopener" class="btn btn--fuchsia pack-modal__cta">TRABAJEMOS JUNTOS</a>';
      return h;
    };

    var packLeft = $('#packModalLeft');
    var packRight = $('#packModalRight');
    var openPack = function (key, href) {
      var p = PACKS[key];
      if (!p) return;
      packLeft.innerHTML = leftHtml(p);
      packRight.innerHTML = rightHtml(p, href);
      packModal.hidden = false;
      requestAnimationFrame(function () { packModal.classList.add('is-open'); });
    };
    var closePack = function () {
      packModal.classList.remove('is-open');
      setTimeout(function () { packModal.hidden = true; }, 300);
    };

    $$('.pack-trigger').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openPack(a.dataset.pack, a.href);
      });
    });
    $('#packModalClose').addEventListener('click', closePack);
    packModal.addEventListener('click', function (e) { if (e.target === packModal) closePack(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !packModal.hidden) closePack();
    });
  }

  /* ---------- Transición entre páginas ----------
     Al tocar un link a otra página del sitio, el velo crema (body::after) aparece
     y recién ahí se navega; la página nueva lo desvanece sola al cargar.
     En preview.html (una sola página con ruteo propio) no hace falta. */
  if (!window.__bylulyInit) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(function () { location.href = a.href; }, 280);
    });
    // al volver con el botón "atrás" el navegador restaura la página tal cual: saco el velo
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) document.body.classList.remove('is-leaving');
    });
  }

  /* ---------- Parallax de los stickers ----------
     Cada sticker con data-speed se corre en Y proporcional a cuánto se aleja
     del centro de la pantalla. Solo en escritorio y si no piden menos movimiento. */
  var pxEls = $$('[data-speed]');
  var pxOk = window.matchMedia && matchMedia('(min-width: 981px) and (prefers-reduced-motion: no-preference)');
  if (pxEls.length && pxOk) {
    var pxTops = [];
    var pageTop = function (el) {
      var t = 0;
      for (; el; el = el.offsetParent) t += el.offsetTop;
      return t;
    };
    var measure = function () {
      pxTops = pxEls.map(function (el) { return pageTop(el) + el.offsetHeight / 2; });
    };
    var pxTick = false;
    var pxUpdate = function () {
      pxTick = false;
      var on = pxOk.matches;
      var mid = window.scrollY + window.innerHeight / 2;
      pxEls.forEach(function (el, n) {
        var d = pxTops[n] - mid;
        if (!on || Math.abs(d) > window.innerHeight * 1.5) { if (!on) el.style.removeProperty('--py'); return; }
        el.style.setProperty('--py', (-d * parseFloat(el.dataset.speed)).toFixed(1) + 'px');
      });
    };
    var pxQueue = function () {
      if (!pxTick) { pxTick = true; requestAnimationFrame(pxUpdate); }
    };
    measure();
    pxUpdate();
    window.addEventListener('scroll', pxQueue, { passive: true });
    window.addEventListener('resize', function () { measure(); pxQueue(); });
    window.addEventListener('load', function () { measure(); pxQueue(); });
  }

  /* ---------- Visor de fotos del portafolio ---------- */
  var galItems = $$('.gallery__item');
  if (galItems.length) {
    // cada proyecto: sus fotos (data-fotos, separadas por "|"), título, rubro y descripción
    var fotos = galItems.map(function (f) {
      var img = $('img', f);
      var cap = $('figcaption', f);
      var sub = cap ? $('span', cap) : null;
      var desc = cap ? $('.gallery__desc', cap) : null;
      return {
        list: (f.dataset.fotos || img.getAttribute('src')).split('|'),
        alt: img.alt,
        title: cap ? cap.firstChild.textContent.trim() : '',
        sub: sub ? sub.textContent : '',
        desc: desc ? desc.textContent : ''
      };
    });

    var oldVisor = $('#visor');
    if (oldVisor) oldVisor.remove();
    var visor = document.createElement('div');
    visor.className = 'visor';
    visor.id = 'visor';
    visor.hidden = true;
    visor.setAttribute('role', 'dialog');
    visor.setAttribute('aria-modal', 'true');
    visor.setAttribute('aria-label', 'Trabajo del portafolio');
    visor.innerHTML =
      '<button class="visor__close" aria-label="Cerrar">&times;</button>' +
      '<button class="visor__btn visor__btn--prev" aria-label="Anterior">&#8249;</button>' +
      '<figure class="visor__fig"><img class="visor__img" alt="">' +
      '<figcaption class="visor__cap"></figcaption><p class="visor__desc"></p>' +
      '<div class="visor__thumbs"></div></figure>' +
      '<button class="visor__btn visor__btn--next" aria-label="Siguiente">&#8250;</button>' +
      '<p class="visor__count"></p>';
    document.body.appendChild(visor);

    var vImg = $('.visor__img', visor);
    var vCap = $('.visor__cap', visor);
    var vDesc = $('.visor__desc', visor);
    var vThumbs = $('.visor__thumbs', visor);
    var vCount = $('.visor__count', visor);
    var vClose = $('.visor__close', visor);
    var vCur = 0;   // proyecto
    var vPic = 0;   // foto dentro del proyecto
    var vBack = null;
    var vBuilt = -1;

    var vSet = function () {
      var f = fotos[vCur];
      vImg.onload = function () { vImg.classList.remove('is-swapping'); };
      vImg.src = f.list[vPic];
      vImg.alt = f.alt;
      if (vBuilt !== vCur) {
        vBuilt = vCur;
        vCap.textContent = f.title;
        if (f.sub) {
          var s = document.createElement('span');
          s.textContent = f.sub;
          vCap.appendChild(s);
        }
        vDesc.textContent = f.desc;
        vThumbs.innerHTML = '';
        if (f.list.length > 1) {
          f.list.forEach(function (src, k) {
            var t = document.createElement('button');
            t.type = 'button';
            t.className = 'visor__thumb';
            t.setAttribute('aria-label', 'Foto ' + (k + 1));
            t.style.backgroundImage = 'url("' + src + '")';
            t.addEventListener('click', function () { vShow(vCur, k, true); });
            vThumbs.appendChild(t);
          });
        }
      }
      Array.prototype.forEach.call(vThumbs.children, function (t, k) { t.classList.toggle('is-active', k === vPic); });
      vCount.textContent = f.list.length > 1 ? 'Foto ' + (vPic + 1) + ' de ' + f.list.length : '';
      if (vImg.complete) vImg.classList.remove('is-swapping');
    };
    // con un filtro activo, al terminar las fotos de un proyecto se pasa al siguiente que se ve
    var vList = function () {
      return galItems.map(function (f, i) { return i; })
        .filter(function (i) { return !galItems[i].classList.contains('is-filtered'); });
    };
    var vStep = function (d) {
      var n = fotos[vCur].list.length;
      if (vPic + d >= 0 && vPic + d < n) { vShow(vCur, vPic + d, true); return; }
      var l = vList();
      var next = l[(l.indexOf(vCur) + d + l.length) % l.length];
      vShow(next, d > 0 ? 0 : fotos[next].list.length - 1, true);
    };
    var vShow = function (i, k, animate) {
      vCur = i;
      vPic = k || 0;
      if (!animate) { vSet(); return; }
      vImg.classList.add('is-swapping');
      setTimeout(vSet, 200);
    };
    var vOpen = function (i) {
      vBack = document.activeElement;
      vShow(i, 0, false);
      visor.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(function () { visor.classList.add('is-open'); });
      vClose.focus();
    };
    var vHide = function () {
      visor.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      setTimeout(function () { visor.hidden = true; }, 300);
      if (vBack) vBack.focus();
    };

    galItems.forEach(function (f, i) {
      f.tabIndex = 0;
      f.setAttribute('role', 'button');
      f.setAttribute('aria-label', 'Ver en grande: ' + fotos[i].title);
      f.addEventListener('click', function () { vOpen(i); });
      f.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vOpen(i); }
      });
    });
    $('.visor__btn--prev', visor).addEventListener('click', function () { vStep(-1); });
    $('.visor__btn--next', visor).addEventListener('click', function () { vStep(1); });
    vClose.addEventListener('click', vHide);
    visor.addEventListener('click', function (e) {
      if (e.target === visor || e.target.classList.contains('visor__fig')) vHide();
    });
    document.addEventListener('keydown', function (e) {
      if (visor.hidden) return;
      if (e.key === 'Escape') vHide();
      else if (e.key === 'ArrowLeft') vStep(-1);
      else if (e.key === 'ArrowRight') vStep(1);
    });
    var vx0 = null;
    visor.addEventListener('touchstart', function (e) { vx0 = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener('touchend', function (e) {
      if (vx0 === null) return;
      var dx = e.changedTouches[0].clientX - vx0;
      if (Math.abs(dx) > 45) vStep(dx < 0 ? 1 : -1);
      vx0 = null;
    });
  }

  /* ---------- Pantalla de carga ----------
     Se ve solo la primera vez de la sesión: queda al menos 0.8 s (para que el
     logo llegue a aparecer) y se va cuando la página terminó de cargar. */
  /* ---------- Lluvia de estrellas de bienvenida ----------
     La primera vez que alguien entra (justo cuando se va la pantalla de carga)
     caen las estrellas rosas bordadas de la home, repartidas parejo por todo el ancho. */
  var lluvia = function () {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var total = window.innerWidth < 700 ? 24 : 44;
    for (var k = 0; k < total; k++) {
      var p = document.createElement('img');
      p.className = 'lluvia';
      p.src = 'img/star-pink.png';
      p.alt = '';
      p.setAttribute('aria-hidden', 'true');
      // cada estrella en su franja del ancho, así cubren toda la pantalla sin amontonarse
      p.style.left = (((k + Math.random()) / total) * 100).toFixed(2) + 'vw';
      p.style.width = (22 + Math.random() * 26).toFixed(0) + 'px';
      p.style.setProperty('--dur', (2.8 + Math.random() * 2.2).toFixed(2) + 's');
      p.style.setProperty('--delay', (Math.random() * 1.6).toFixed(2) + 's');
      p.style.setProperty('--sx', (Math.random() * 80 - 40).toFixed(0) + 'px');
      p.style.setProperty('--rt', (Math.random() * 540 - 270).toFixed(0) + 'deg');
      p.addEventListener('animationend', function () { this.remove(); });
      document.body.appendChild(p);
    }
  };

  var loader = $('#loader');
  if (loader && !document.documentElement.classList.contains('no-loader')) {
    var loaderStart = Date.now();
    var loaderGone = false;
    var hideLoader = function () {
      if (loaderGone) return;
      loaderGone = true;
      setTimeout(function () {
        loader.classList.add('is-done');
        try { sessionStorage.setItem('byluly_loader', '1'); } catch (err) {}
        lluvia();
      }, Math.max(0, 800 - (Date.now() - loaderStart)));
    };
    if (document.readyState === 'complete') hideLoader();
    else window.addEventListener('load', hideLoader);
    // con conexión lenta no espero a que bajen todas las fotos: a los 2 s se va igual
    setTimeout(hideLoader, 2000);
  }

  /* ---------- Números que suben solos ---------- */
  var counts = $$('.count');
  if (counts.length && 'IntersectionObserver' in window &&
      !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var runCount = function (el) {
      var to = parseInt(el.dataset.to, 10);
      var t0 = null;
      var dur = 1600;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var countIo = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); obs.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counts.forEach(function (el) { el.textContent = '0'; countIo.observe(el); });
  }

  /* ---------- Botón "volver arriba" ---------- */
  var toTop = $('#toTop');
  if (toTop) {
    var toTopCheck = function () {
      toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 1.2);
    };
    window.addEventListener('scroll', toTopCheck, { passive: true });
    toTopCheck();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var calma = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conMouse = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Títulos que aparecen palabra por palabra ----------
     Envuelvo cada palabra en <span class="w"> (respetando <em>, <br> y <sup>).
     Si el título es una sola palabra ("Hablemos!", "PRODUCCIONES") va letra por letra. */
  var splitTitle = function (el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    var letters = el.textContent.trim().split(/\s+/).length === 1;
    if (letters) el.setAttribute('aria-label', el.textContent.trim());
    var n = 0;
    var span = function (txt) {
      var s = document.createElement('span');
      s.className = 'w';
      s.style.setProperty('--i', n++);
      s.textContent = txt;
      if (letters) s.setAttribute('aria-hidden', 'true');
      return s;
    };
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            if (letters) Array.from(part).forEach(function (c) { frag.appendChild(span(c)); });
            else frag.appendChild(span(part));
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName === 'SUP') {
          ch.classList.add('w');
          ch.style.setProperty('--i', n++);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && ch.tagName !== 'IMG') {
          walk(ch);
        }
      });
    };
    walk(el);
    el.classList.add('split');
  };
  var titles = $$('.svc-hero__title, .why__title, .pack-feature__title, .pack-universe__title, .social-hero__title, ' +
    '.contrata__title, .prod-band__title, .payment__title, .hablemos__title, .page-hero__title, ' +
    '.bloque .display, .redes .display, .testimonios__title, .proyectos .display, .cta-band .display');
  if (titles.length && 'IntersectionObserver' in window) {
    titles.forEach(splitTitle);
    var splitIo = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-split-in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    titles.forEach(function (el) { splitIo.observe(el); });
  }

  /* ---------- Barra de progreso de lectura ---------- */
  if (header) {
    var bar = document.createElement('div');
    bar.className = 'progress';
    header.appendChild(bar);
    var barTick = false;
    var barUpdate = function () {
      barTick = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    };
    window.addEventListener('scroll', function () {
      if (!barTick) { barTick = true; requestAnimationFrame(barUpdate); }
    }, { passive: true });
    barUpdate();
  }

  /* ---------- Fotos que se inclinan en 3D con el mouse ---------- */
  if (conMouse && !calma) {
    var tiltables = [];
    $$('.pack-feature__media > img:first-child').forEach(function (img) { tiltables.push([img, img.parentNode, true]); });
    $$('.gallery__item img').forEach(function (img) { tiltables.push([img, img.parentNode, true]); });
    $$('.contrata__grid').forEach(function (img) { tiltables.push([img, img, false]); });
    tiltables.forEach(function (t) {
      var img = t[0], box = t[1];
      img.classList.add('tilt');
      if (t[2]) {
        var glare = document.createElement('span');
        glare.className = 'glare';
        box.appendChild(glare);
      }
      box.addEventListener('mousemove', function (e) {
        var r = box.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        img.classList.add('is-tilting');
        img.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
        img.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
        img.style.setProperty('--ts', '1.02');
        box.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        box.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        box.classList.add('is-glaring');
      });
      box.addEventListener('mouseleave', function () {
        img.classList.remove('is-tilting');
        ['--rx', '--ry', '--ts'].forEach(function (v) { img.style.removeProperty(v); });
        box.classList.remove('is-glaring');
      });
    });
  }

  /* ---------- Botones magnéticos ---------- */
  if (conMouse && !calma) {
    $$('.btn').forEach(function (btn) {
      var txt = null;
      if (!btn.children.length) {
        txt = document.createElement('span');
        txt.className = 'btn__txt';
        while (btn.firstChild) txt.appendChild(btn.firstChild);
        btn.appendChild(txt);
      }
      btn.classList.add('is-magnetic');
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        btn.classList.add('is-pulling');
        btn.style.translate = (x * 0.25).toFixed(1) + 'px ' + (y * 0.4).toFixed(1) + 'px';
        if (txt) txt.style.translate = (x * 0.1).toFixed(1) + 'px ' + (y * 0.15).toFixed(1) + 'px';
      });
      btn.addEventListener('mouseleave', function () {
        btn.classList.remove('is-pulling');
        btn.style.translate = '';
        if (txt) txt.style.translate = '';
      });
    });
  }

  /* ---------- Brillitos al hacer clic ---------- */
  if (!calma && !window.__bylulyChispas) {
    window.__bylulyChispas = true;
    var CHISPAS = ['✦', '♥\uFE0E', '✦', '♥\uFE0E', '✧', '✦'];
    var COLORES = ['#E0AAB8', '#EF0066', '#D0D996', '#E0AAB8', '#770523', '#EF0066'];
    document.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      CHISPAS.forEach(function (c, k) {
        var ang = (k / CHISPAS.length) * Math.PI * 2 + Math.random() * 0.6;
        var dist = 26 + Math.random() * 22;
        var s = document.createElement('span');
        s.className = 'chispa';
        s.textContent = c;
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        s.style.color = COLORES[k];
        s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
        s.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(1) + 'px');
        s.style.setProperty('--rt', (Math.random() * 180 - 90).toFixed(0) + 'deg');
        s.addEventListener('animationend', function () { s.remove(); });
        document.body.appendChild(s);
      });
    });
  }

  /* ---------- Filtros del portafolio (con reacomodo animado) ---------- */
  var filtros = $$('.filtros__btn');
  if (filtros.length && galItems.length) {
    var filtrar = function (cat) {
      var entra = function (f) { return cat === 'todo' || (' ' + f.dataset.cat + ' ').indexOf(' ' + cat + ' ') !== -1; };
      var salen = galItems.filter(function (f) { return !f.classList.contains('is-filtered') && !entra(f); });
      salen.forEach(function (f) { f.classList.add('is-out'); });
      setTimeout(function () {
        var antes = new Map();
        galItems.forEach(function (f) { if (!f.classList.contains('is-filtered')) antes.set(f, f.getBoundingClientRect()); });
        galItems.forEach(function (f) {
          f.classList.remove('is-out');
          f.classList.toggle('is-filtered', !entra(f));
        });
        galItems.forEach(function (f) {
          if (f.classList.contains('is-filtered') || !f.animate) return;
          var r = f.getBoundingClientRect();
          var a = antes.get(f);
          f.classList.add('is-in');
          if (a) {
            f.animate([{ transform: 'translate(' + (a.left - r.left) + 'px,' + (a.top - r.top) + 'px)' }, { transform: 'none' }],
              { duration: calma ? 0 : 500, easing: 'cubic-bezier(.2,.7,.2,1)' });
          } else {
            f.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }],
              { duration: calma ? 0 : 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
          }
        });
      }, salen.length ? 200 : 0);
    };
    filtros.forEach(function (b) {
      b.addEventListener('click', function () {
        filtros.forEach(function (o) {
          o.classList.toggle('is-active', o === b);
          o.setAttribute('aria-pressed', String(o === b));
        });
        filtrar(b.dataset.filtro);
      });
    });
  }

  /* ---------- Lista de marcas de la home: la foto sigue al mouse ---------- */
  var marcas = $('.marcas__list');
  var preview = $('#marcasPreview');
  if (marcas && preview && conMouse && window.matchMedia('(min-width: 861px)').matches) {
    var mx = 0, my = 0, px2 = 0, py2 = 0, mOn = false, mRaf = null;
    $$('.marcas__row', marcas).forEach(function (row) {
      new Image().src = row.dataset.img;
      row.addEventListener('mouseenter', function () {
        preview.src = row.dataset.img;
        preview.classList.add('is-on');
      });
    });
    var mLoop = function () {
      px2 += (mx - px2) * 0.16;
      py2 += (my - py2) * 0.16;
      preview.style.transform = 'translate(' + (px2 - preview.offsetWidth / 2).toFixed(1) + 'px,' + (py2 - preview.offsetHeight / 2).toFixed(1) + 'px)';
      mRaf = mOn || Math.abs(mx - px2) > 0.5 ? requestAnimationFrame(mLoop) : null;
    };
    marcas.addEventListener('mousemove', function (e) {
      mx = e.clientX + 40;
      my = e.clientY;
      if (!mOn) { px2 = mx; py2 = my; }
      mOn = true;
      if (!mRaf) mRaf = requestAnimationFrame(mLoop);
    });
    marcas.addEventListener('mouseleave', function () {
      mOn = false;
      preview.classList.remove('is-on');
    });
  }

  /* ---------- Gancho de limpieza (lo usa preview.html) ---------- */
  window.__bylulyCleanup = function () { clearInterval(timer); clearTimeout(popupTimer); };

  /* ---------- Año del footer ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
