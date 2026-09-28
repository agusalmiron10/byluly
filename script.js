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
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.matches('.nav__link:not(.nav__toggle), .nav__sublink')) {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
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
        eyebrow: 'BRANDING', title: 'THE CORE', duration: 'Duración: 4 semanas',
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
        eyebrow: 'BRANDING · PACKAGING', title: 'THE OBJECT', duration: 'Duración: 4 semanas',
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
        eyebrow: 'BRANDING · SOCIAL MEDIA', title: 'THE VOICE', duration: 'Duración: 4 semanas',
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
        eyebrow: 'BRANDING · WEB', title: 'THE SPACE', duration: 'Plan esencial + página web',
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
        eyebrow: 'BRANDING · PACKAGING · SOCIAL MEDIA', title: 'THE UNIVERSE', duration: 'Duración: 5 semanas',
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
    var fotos = galItems.map(function (f) {
      var img = $('img', f);
      var cap = $('figcaption', f);
      var sub = cap ? $('span', cap) : null;
      return {
        src: img.getAttribute('src'),
        alt: img.alt,
        title: cap ? cap.firstChild.textContent.trim() : '',
        sub: sub ? sub.textContent : ''
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
      '<figure class="visor__fig"><img class="visor__img" alt=""><figcaption class="visor__cap"></figcaption></figure>' +
      '<button class="visor__btn visor__btn--next" aria-label="Siguiente">&#8250;</button>' +
      '<p class="visor__count"></p>';
    document.body.appendChild(visor);

    var vImg = $('.visor__img', visor);
    var vCap = $('.visor__cap', visor);
    var vCount = $('.visor__count', visor);
    var vClose = $('.visor__close', visor);
    var vCur = 0;
    var vBack = null;

    var vSet = function () {
      var f = fotos[vCur];
      vImg.onload = function () { vImg.classList.remove('is-swapping'); };
      vImg.src = f.src;
      vImg.alt = f.alt;
      vCap.textContent = f.title;
      if (f.sub) {
        var s = document.createElement('span');
        s.textContent = f.sub;
        vCap.appendChild(s);
      }
      vCount.textContent = (vCur + 1) + ' / ' + fotos.length;
      if (vImg.complete) vImg.classList.remove('is-swapping');
    };
    var vShow = function (i, animate) {
      vCur = (i + fotos.length) % fotos.length;
      if (!animate) { vSet(); return; }
      vImg.classList.add('is-swapping');
      setTimeout(vSet, 200);
    };
    var vOpen = function (i) {
      vBack = document.activeElement;
      vShow(i, false);
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
    $('.visor__btn--prev', visor).addEventListener('click', function () { vShow(vCur - 1, true); });
    $('.visor__btn--next', visor).addEventListener('click', function () { vShow(vCur + 1, true); });
    vClose.addEventListener('click', vHide);
    visor.addEventListener('click', function (e) {
      if (e.target === visor || e.target.classList.contains('visor__fig')) vHide();
    });
    document.addEventListener('keydown', function (e) {
      if (visor.hidden) return;
      if (e.key === 'Escape') vHide();
      else if (e.key === 'ArrowLeft') vShow(vCur - 1, true);
      else if (e.key === 'ArrowRight') vShow(vCur + 1, true);
    });
    var vx0 = null;
    visor.addEventListener('touchstart', function (e) { vx0 = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener('touchend', function (e) {
      if (vx0 === null) return;
      var dx = e.changedTouches[0].clientX - vx0;
      if (Math.abs(dx) > 45) vShow(vCur + (dx < 0 ? 1 : -1), true);
      vx0 = null;
    });
  }

  /* ---------- Pantalla de carga ----------
     Se ve solo la primera vez de la sesión: queda al menos 0.8 s (para que el
     logo llegue a aparecer) y se va cuando la página terminó de cargar. */
  var loader = $('#loader');
  if (loader && !document.documentElement.classList.contains('no-loader')) {
    var loaderStart = Date.now();
    var hideLoader = function () {
      setTimeout(function () {
        loader.classList.add('is-done');
        try { sessionStorage.setItem('byluly_loader', '1'); } catch (err) {}
      }, Math.max(0, 800 - (Date.now() - loaderStart)));
    };
    if (document.readyState === 'complete') hideLoader();
    else window.addEventListener('load', hideLoader);
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

  /* ---------- Gancho de limpieza (lo usa preview.html) ---------- */
  window.__bylulyCleanup = function () { clearInterval(timer); clearTimeout(popupTimer); };

  /* ---------- Año del footer ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
