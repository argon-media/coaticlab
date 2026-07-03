/* ============================================================
   CoaticLab Automotive Studio — client controller
   Ports the interactions from the Claude Design prototype's
   reactive logic to vanilla JS over static markup.
   ============================================================ */
(function () {
  'use strict';
  var PAGES = ['home', 'ppf', 'ceramic', 'tint', 'correction', 'tesla', 'about', 'gallery', 'contact'];
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------------- hover styles (data-hover) ---------------- */
  function parseDecls(str) {
    var out = [];
    (str || '').split(';').forEach(function (d) {
      var i = d.indexOf(':');
      if (i > -1) { var p = d.slice(0, i).trim(); var v = d.slice(i + 1).trim(); if (p) out.push([p, v]); }
    });
    return out;
  }
  function initHover(root) {
    (root || document).querySelectorAll('[data-hover]').forEach(function (el) {
      if (el._dcHover) return;
      el._dcHover = true;
      var decls = parseDecls(el.getAttribute('data-hover'));
      el.addEventListener('mouseenter', function () {
        el._dcSaved = decls.map(function (d) { return [d[0], el.style.getPropertyValue(d[0]), el.style.getPropertyPriority(d[0])]; });
        decls.forEach(function (d) { el.style.setProperty(d[0], d[1]); });
      });
      el.addEventListener('mouseleave', function () {
        (el._dcSaved || []).forEach(function (s) {
          if (s[1]) el.style.setProperty(s[0], s[1], s[2]); else el.style.removeProperty(s[0]);
        });
      });
    });
  }

  /* ---------------- router ---------------- */
  var header = document.querySelector('header [data-cl-scroll]');
  function showPage(key) {
    if (PAGES.indexOf(key) === -1) key = 'home';
    document.querySelectorAll('.dc-page').forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-page') === key);
      if (p.getAttribute('data-page') === key) p.removeAttribute('hidden');
    });
    if (header) header.setAttribute('data-cl-scroll', key === 'home' ? 'home' : 'none');
    closeMenu();
    sizeCoverFrames();
    setTimeout(sizeCoverFrames, 250);
  }
  function goto(key) {
    try { if (history && history.replaceState) history.replaceState(null, '', '#' + key); } catch (e) {}
    showPage(key);
    try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) { window.scrollTo(0, 0); }
  }
  window.addEventListener('hashchange', function () {
    var h = (location.hash || '').replace('#', '');
    if (h) { showPage(h); try { window.scrollTo({ top: 0 }); } catch (e) {} }
  });

  /* nav clicks (page anchors) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var key = a.getAttribute('href').slice(1);
    if (PAGES.indexOf(key) > -1) { e.preventDefault(); goto(key); }
  });

  /* ---------------- mobile menu ---------------- */
  var menu = document.getElementById('dc-mobile-menu');
  function closeMenu() { if (menu) menu.setAttribute('hidden', ''); }
  function toggleMenu() { if (menu) { if (menu.hasAttribute('hidden')) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', ''); } }

  /* ---------------- action delegation ---------------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-action]');
    if (!t) return;
    var act = t.getAttribute('data-action');
    if (act === 'toggle-menu') { e.preventDefault(); toggleMenu(); }
    else if (act === 'play-ppf') { e.preventDefault(); playPpf(); }
    else if (act === 'play-video') { e.preventDefault(); playVideo(t); }
    else if (act === 'reviews-prev') { e.preventDefault(); moveReviews(-1); }
    else if (act === 'reviews-next') { e.preventDefault(); moveReviews(1); }
  });

  /* ---------------- PPF flagship video (idle -> sound) ---------------- */
  function playPpf() {
    document.querySelectorAll('.dc-ppf-idle').forEach(function (el) { el.setAttribute('hidden', ''); });
    document.querySelectorAll('.dc-ppf-audio').forEach(function (el) { el.removeAttribute('hidden'); });
  }

  /* ---------------- trifecta VideoPlayer ---------------- */
  function playVideo(btn) {
    var wrap = btn.closest('.dc-videoplayer');
    var src = btn.getAttribute('data-src');
    if (!wrap || !src) return;
    wrap.innerHTML = '<video src="' + src + '" controls autoplay playsinline style="width:100%;height:100%;display:block;object-fit:cover;background:#000;"></video>';
  }

  /* ---------------- cover-frame iframe sizing (port of prototype) ---------------- */
  function sizeCoverFrames() {
    try {
      document.querySelectorAll('iframe[data-cover-frame]').forEach(function (f) {
        // measure against the positioned container, not a display-collapsed wrapper
        var p = f.offsetParent || f.parentElement; if (!p) return;
        var pw = p.clientWidth, ph = p.clientHeight;
        if (!pw || !ph) return;
        var raw = f.getAttribute('data-cover-frame') || '';
        var ar = 9 / 16;
        if (raw.indexOf(':') > -1) { var p2 = raw.split(':').map(Number); if (p2[0] && p2[1]) ar = p2[0] / p2[1]; }
        var w, h;
        if (pw / ph > ar) { w = pw; h = pw / ar; } else { h = ph; w = ph * ar; }
        f.style.width = Math.ceil(w) + 'px';
        f.style.height = Math.ceil(h) + 'px';
      });
    } catch (e) {}
  }

  /* ---------------- data-film reveal (gloss wipe) ---------------- */
  function initFilm() {
    try {
      var blocks = document.querySelectorAll('[data-film]');
      var showAll = function () { blocks.forEach(function (el) { el.setAttribute('data-film', 'in'); }); };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (en) { if (en.isIntersecting) { en.target.setAttribute('data-film', 'in'); obs.unobserve(en.target); } });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
        blocks.forEach(function (el) { io.observe(el); });
        setTimeout(showAll, 2600);
      } else { showAll(); }
    } catch (e) {}
  }

  /* ---------------- background loop videos ---------------- */
  function initBgLoops() {
    try {
      document.querySelectorAll('video[data-bgloop]').forEach(function (v) {
        if (v.dataset.bgloopInit) return;
        v.dataset.bgloopInit = '1';
        v.muted = true; v.loop = true;
        v.setAttribute('src', v.getAttribute('data-bgloop'));
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      });
    } catch (e) {}
  }

  /* ---------------- gallery filter ---------------- */
  function filterStyle(active) {
    return "font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;font-size:11.5px;padding:10px 17px;border-radius:2px;cursor:pointer;border:1px solid " +
      (active ? '#21314d' : '#C7C5BC') + ';background:' + (active ? '#21314d' : 'transparent') + ';color:' + (active ? '#FFFFFF' : '#1B2436') + ';';
  }
  function initGallery() {
    var btns = document.querySelectorAll('.dc-filter-btn');
    if (!btns.length) return;
    var items = document.querySelectorAll('.dc-gallery-item');
    var empty = document.querySelector('.dc-gallery-empty');
    function apply(filter) {
      var shown = 0;
      items.forEach(function (it) {
        var cats = (it.getAttribute('data-cats') || '').split(',');
        var vis = (filter === 'All') || cats.indexOf(filter) > -1;
        it.style.display = vis ? '' : 'none';
        if (vis) shown++;
      });
      btns.forEach(function (b) { b.setAttribute('style', filterStyle(b.getAttribute('data-filter') === filter)); });
      if (empty) { if (shown === 0) empty.removeAttribute('hidden'); else empty.setAttribute('hidden', ''); }
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
    });
    apply('All');
  }

  /* ---------------- reviews carousel ---------------- */
  var reviewsStart = 0;
  function reviewsPer() { var w = window.innerWidth; return w < 700 ? 1 : (w < 1040 ? 2 : 3); }
  function renderReviews() {
    var track = document.querySelector('.dc-reviews-track');
    if (!track) return;
    var cards = track.children;
    var len = cards.length;
    if (!len) return;
    var per = Math.min(reviewsPer(), len);
    var start = ((reviewsStart % len) + len) % len;
    var win = [];
    for (var k = 0; k < per; k++) win.push((start + k) % len);
    for (var i = 0; i < len; i++) {
      var pos = win.indexOf(i);
      if (pos > -1) { cards[i].style.display = 'flex'; cards[i].style.order = pos; }
      else { cards[i].style.display = 'none'; cards[i].style.order = ''; }
    }
  }
  function moveReviews(dir) { reviewsStart += dir * reviewsPer(); renderReviews(); }

  /* ---------------- count-up stat ---------------- */
  function initCountUp() {
    var cu = document.querySelector('[data-count-up]');
    if (!cu) return;
    var target = parseInt(cu.getAttribute('data-count-up'), 10) || 0;
    var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
    if (reduceMotion) { cu.textContent = fmt(target); return; }
    var done = false;
    function run() {
      if (done) return; done = true;
      var dur = 1700, t0 = performance.now();
      function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        cu.textContent = fmt(target * e);
        if (p < 1) requestAnimationFrame(step); else cu.textContent = fmt(target);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) { if (en.isIntersecting) { run(); obs.disconnect(); } });
      }, { threshold: 0.4 });
      io.observe(cu);
    } else { run(); }
  }

  /* ---------------- Trifecta interactive showcase ---------------- */
  function initTrifecta() {
    var btns = [].slice.call(document.querySelectorAll('.trif-btn'));
    if (!btns.length) return;
    var visuals = [].slice.call(document.querySelectorAll('.trif-visual'));
    var capTitle = document.querySelector('.trif-cap-title');
    var capNum = document.querySelector('.trif-cap-num');
    var cur = 0, timer = null;
    function restartFill(b) {
      var f = b.querySelector('.trif-fill');
      if (f) { f.style.animation = 'none'; void f.offsetWidth; f.style.animation = ''; }
    }
    function show(i) {
      cur = i;
      btns.forEach(function (b, k) { b.classList.toggle('is-active', k === i); });
      visuals.forEach(function (v, k) { v.classList.toggle('is-active', k === i); });
      if (capTitle) capTitle.textContent = btns[i].getAttribute('data-title');
      if (capNum) capNum.textContent = btns[i].getAttribute('data-num') + ' / 03';
      restartFill(btns[i]);
    }
    function schedule() {
      if (reduceMotion) return;
      clearTimeout(timer);
      timer = setTimeout(function () { show((cur + 1) % btns.length); schedule(); }, 6000);
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function (e) { e.preventDefault(); show(i); schedule(); });
    });
    show(0);
    schedule();
  }

  /* ---------------- quote / contact forms ---------------- */
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('[data-action="submit-quote"]');
    if (!f) return;
    e.preventDefault();
    // if on the contact page, swap the form for the success panel
    var contact = document.querySelector('.dc-page[data-page="contact"]');
    if (contact && contact.contains(f)) {
      var form = contact.querySelector('.dc-contact-form');
      var ok = contact.querySelector('.dc-contact-success');
      if (form) form.setAttribute('hidden', '');
      if (ok) ok.removeAttribute('hidden');
    }
    try { window.scrollTo({ top: 0 }); } catch (err) { window.scrollTo(0, 0); }
  });

  /* ---------------- intro wipe ---------------- */
  function initIntro() {
    var intro = document.getElementById('dc-intro');
    if (!intro) return;
    if (reduceMotion) { intro.parentNode && intro.parentNode.removeChild(intro); return; }
    setTimeout(function () { intro.parentNode && intro.parentNode.removeChild(intro); }, 1000);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    initHover(document);
    var h = (location.hash || '').replace('#', '');
    showPage(h || 'home');
    initIntro();
    initGallery();
    initTrifecta();
    initCountUp();
    renderReviews();
    sizeCoverFrames();
    setTimeout(sizeCoverFrames, 300);
    initFilm();
    setTimeout(initBgLoops, 400);
    window.addEventListener('resize', function () { sizeCoverFrames(); renderReviews(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
