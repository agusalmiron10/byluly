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

  /* =========================================================
     CARRITO
     Se guarda en el navegador de cada visitante (localStorage).
     No hay cobro conectado todavía.
     ========================================================= */
  var CART_KEY = 'byluly_cart';

  var readCart = function () {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (err) { return []; }
  };
  var writeCart = function (items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (err) {}
    paintCount();
  };
  var money = function (n) {
    return '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  function paintCount() {
    var el = $('#cartCount');
    if (el) el.textContent = readCart().length;
  }
  paintCount();

  $$('.product__add').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var items = readCart();
      items.push({ name: btn.dataset.name, price: Number(btn.dataset.price) || 0 });
      writeCart(items);
      var original = btn.textContent;
      btn.textContent = 'Agregado ✓';
      btn.disabled = true;
      setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 1600);
    });
  });

  var cartList = $('#cartList');
  if (cartList) {
    var paintCart = function () {
      var items = readCart();
      cartList.innerHTML = '';
      items.forEach(function (it, i) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="cart-item__name"></span>' +
                       '<span class="cart-item__price"></span>' +
                       '<button type="button" aria-label="Quitar">&times;</button>';
        $('.cart-item__name', li).textContent = it.name;
        $('.cart-item__price', li).textContent = money(it.price);
        $('button', li).addEventListener('click', function () {
          var next = readCart(); next.splice(i, 1); writeCart(next); paintCart();
        });
        cartList.appendChild(li);
      });

      var total = items.reduce(function (a, b) { return a + b.price; }, 0);
      $('#cartEmpty').hidden = items.length > 0;
      $('#cartTotal').hidden = items.length === 0;
      $('#checkout').hidden = items.length === 0;
      $('#cartTotalValue').textContent = money(total);
    };
    paintCart();

    $('#checkout').addEventListener('click', function () {
      // TODO: conectar con la pasarela de pago (Mercado Pago, Lemon Squeezy, Gumroad...)
      alert('El checkout todavía no está conectado a una pasarela de pago.');
    });
  }

  /* ---------- Formulario de contacto ---------- */
  var form = $('#form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var msg = $('#formMsg');
      if (!data.get('nombre') || !data.get('email')) {
        msg.textContent = 'Completá al menos tu nombre y tu email.';
        return;
      }
      // TODO: conectar con el servicio de envío (Formspree, Netlify Forms, backend propio...)
      msg.textContent = '¡Gracias! Te voy a estar escribiendo en menos de un día.';
      form.reset();
    });
  }

  /* ---------- Formulario del recurso gratis ---------- */
  var freebie = $('#freebieForm');
  if (freebie) {
    freebie.addEventListener('submit', function (e) {
      e.preventDefault();
      // TODO: conectar con el servicio de email marketing
      $('#freebieMsg').textContent = '¡Listo! Revisá tu casilla en los próximos días.';
      freebie.reset();
    });
  }

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
