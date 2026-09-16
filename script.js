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
  var reveals = $$('.reveal');
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

  /* ---------- Gancho de limpieza (lo usa preview.html) ---------- */
  window.__bylulyCleanup = function () { clearInterval(timer); clearTimeout(popupTimer); };

  /* ---------- Año del footer ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
