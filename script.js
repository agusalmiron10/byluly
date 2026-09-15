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

  /* ---------- Gancho de limpieza (lo usa preview.html) ---------- */
  window.__bylulyCleanup = function () { clearInterval(timer); clearTimeout(popupTimer); };

  /* ---------- Año del footer ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
