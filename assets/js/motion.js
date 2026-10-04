/* ==========================================================================
   Favour Sobechi Opara / Motion layer
   Decorative motion on top of site.js. Everything here is progressive:
   with reduced motion requested, or without JS, the page is fully usable.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  root.classList.add("motion");

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var hasIO = "IntersectionObserver" in window;

  function onceVisible(els, fn, opts) {
    if (!hasIO) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        fn(en.target);
      });
    }, opts || { threshold: 0.3 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------ Text scramble */

  var GLYPHS = "ABCDEF0123456789#%&*+/<>=?";

  function scramble(el, dur) {
    var final = el.getAttribute("data-text") || el.textContent;
    el.setAttribute("data-text", final);
    if (el._scr) cancelAnimationFrame(el._scr);

    var t0 = null;
    dur = dur || 700;

    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var settled = Math.floor(final.length * p);
      var out = final.slice(0, settled);
      for (var i = settled; i < final.length; i++) {
        var ch = final.charAt(i);
        out += ch === " " || ch === "/" ? ch : GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
      }
      el.textContent = out;
      if (p < 1) el._scr = requestAnimationFrame(frame);
      else el.textContent = final;
    }

    el._scr = requestAnimationFrame(frame);
  }

  // Section labels decode as they arrive. The live text is wrapped so the
  // status dot (a pseudo element) is never overwritten.
  var eyebrows = $$(".eyebrow");
  eyebrows.forEach(function (e) {
    var t = e.textContent.trim();
    e.setAttribute("aria-label", t);
    e.textContent = "";
    var span = document.createElement("span");
    span.className = "eyebrow__t";
    span.setAttribute("aria-hidden", "true");
    span.textContent = t;
    e.appendChild(span);
  });
  onceVisible(eyebrows, function (e) { scramble($(".eyebrow__t", e), 650); }, { threshold: 1 });

  if (fine) {
    $$(".nav__links a, .footer__nav a").forEach(function (a) {
      a.setAttribute("data-text", a.textContent);
      a.addEventListener("mouseenter", function () { scramble(a, 380); });
    });
  }

  /* -------------------------------------------- Headline word cascade */

  $$(".sec-head h2, .footer__cta h2").forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.textContent = "";
    words.forEach(function (w, i) {
      var outer = document.createElement("span");
      outer.className = "w";
      outer.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.textContent = w;
      inner.style.setProperty("--i", String(i));
      outer.appendChild(inner);
      h.appendChild(outer);
      if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
    });
    h.classList.add("split");
  });
  onceVisible($$(".split"), function (h) { h.classList.add("is-in"); }, { threshold: 0.4 });

  /* ------------------------------------------------- Hero: glitch + scroll */

  var grad = $(".hero__title .grad");
  if (grad) grad.setAttribute("data-text", grad.textContent);

  var heroIn = $(".hero__in");
  var heroGrid = $(".hero__grid");
  var hero = $(".hero");

  /* ---------------------------------------------- Hero scroll parallax */

  var scrollTicking = false;

  function onScroll() {
    var y = window.scrollY;

    if (hero && heroIn) {
      var hh = hero.offsetHeight || 1;
      var p = Math.min(Math.max(y / hh, 0), 1);
      heroIn.style.translate = "0 " + (p * 90).toFixed(1) + "px";
      heroIn.style.opacity = String(1 - p * 0.85);
      if (heroGrid) heroGrid.style.translate = "0 " + (p * 40).toFixed(1) + "px";
    }
    scrollTicking = false;
  }

  window.addEventListener("scroll", function () {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });

  /* ------------------------------------------------------ Risk matrix wave */

  // Cells light up from rare/insignificant (bottom left) to almost
  // certain/severe (top right): heat rising the way risk does.
  var cells = $$("#matrix .cell");
  cells.forEach(function (c, idx) {
    var row = Math.floor(idx / 5);
    var col = idx % 5;
    c.style.setProperty("--w", String((4 - row) + col));
  });

  /* ---------------------------------------------------- KQL types itself */

  var code = $(".soc .code code");
  if (code) {
    var html = code.innerHTML.split("\n");
    code.innerHTML = html.map(function (line, i) {
      return '<span class="cl" style="--i:' + i + '">' + (line || " ") + "</span>";
    }).join("\n");
    onceVisible([code.closest(".code")], function (c) { c.classList.add("is-typing"); }, { threshold: 0.35 });
  }

  /* ------------------------------------------- Triage flow: live pipeline */

  var steps = $$(".flow__step");
  if (steps.length && hasIO) {
    var flowTimer = null;
    var at = -1;

    function advance() {
      steps.forEach(function (s) { s.classList.remove("is-live"); });
      at = (at + 1) % steps.length;
      steps[at].classList.add("is-live");
    }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !flowTimer) {
          advance();
          flowTimer = setInterval(advance, 1500);
        } else if (!en.isIntersecting && flowTimer) {
          clearInterval(flowTimer);
          flowTimer = null;
        }
      });
    }, { threshold: 0.2 }).observe($(".flow"));
  }

  /* ------------------------------------------------------ Lab queue stagger */

  var lab = $(".lab");
  if (lab) onceVisible([lab], function (l) { l.classList.add("is-live"); }, { threshold: 0.2 });

  /* ======================================================= Pointer effects */

  if (!fine) return;

  /* Spotlight + glowing border that track the pointer across each card. */
  var SPOT = ".case, .cap-group, .project, .channel, .metric, .lab, .readout, .matrix-panel, .code, .impact li, .cert, .flow__step";
  $$(SPOT).forEach(function (el) {
    el.classList.add("has-spot");
    var s = document.createElement("span");
    s.className = "spot";
    s.setAttribute("aria-hidden", "true");
    el.appendChild(s);
  });

  /* 3D tilt */
  var TILT = ".case, .portrait__img, .cap-group";
  $$(TILT).forEach(function (el) {
    el.classList.add("tilt");
    if (el.classList.contains("portrait__img")) {
      var glare = document.createElement("span");
      glare.className = "glare";
      glare.setAttribute("aria-hidden", "true");
      el.appendChild(glare);
    }
  });

  var tiltEl = null;

  function clearTilt(el) {
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
  }

  /* Magnetic buttons, via the independent translate property so they
     compose with the existing hover lift. */
  var magEl = null;

  /* Cursor ring */
  var ring = document.createElement("div");
  ring.className = "cursor";
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);

  var mx = -100, my = -100, rx = -100, ry = -100;

  (function follow() {
    rx += (mx - rx) * 0.2;
    ry += (my - ry) * 0.2;
    ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    requestAnimationFrame(follow);
  })();

  document.addEventListener("pointermove", function (e) {
    mx = e.clientX;
    my = e.clientY;
    ring.classList.add("is-on");

    var t = e.target instanceof Element ? e.target : null;

    var spot = t && t.closest(".has-spot");
    if (spot) {
      var r = spot.getBoundingClientRect();
      spot.style.setProperty("--mx", (e.clientX - r.left) + "px");
      spot.style.setProperty("--my", (e.clientY - r.top) + "px");
    }

    var tilt = t && t.closest(".tilt");
    if (tiltEl && tiltEl !== tilt) clearTilt(tiltEl);
    tiltEl = tilt;
    if (tilt) {
      var tr = tilt.getBoundingClientRect();
      var px = (e.clientX - tr.left) / tr.width - 0.5;
      var py = (e.clientY - tr.top) / tr.height - 0.5;
      var amt = tilt.classList.contains("portrait__img") ? 10 : 5;
      tilt.style.setProperty("--rx", (-py * amt).toFixed(2) + "deg");
      tilt.style.setProperty("--ry", (px * amt).toFixed(2) + "deg");
      tilt.style.setProperty("--gx", ((px + 0.5) * 100).toFixed(1) + "%");
      tilt.style.setProperty("--gy", ((py + 0.5) * 100).toFixed(1) + "%");
    }

    var mag = t && t.closest(".btn, .icon-btn");
    if (magEl && magEl !== mag) magEl.style.translate = "";
    magEl = mag;
    if (mag) {
      var mr = mag.getBoundingClientRect();
      var dx = e.clientX - (mr.left + mr.width / 2);
      var dy = e.clientY - (mr.top + mr.height / 2);
      mag.style.translate = (dx * 0.18).toFixed(1) + "px " + (dy * 0.28).toFixed(1) + "px";
    }

    var hot = t && t.closest("a, button, input, .pin, [role='button']");
    ring.classList.toggle("is-hot", !!hot);
    ring.classList.toggle("is-card", !hot && !!spot);
  }, { passive: true });

  document.addEventListener("pointerdown", function () { ring.classList.add("is-down"); });
  document.addEventListener("pointerup", function () { ring.classList.remove("is-down"); });
  document.documentElement.addEventListener("pointerleave", function () {
    ring.classList.remove("is-on");
    if (tiltEl) clearTilt(tiltEl);
    if (magEl) magEl.style.translate = "";
  });

  /* Subtle pointer parallax on the hero grid. */
  if (hero && heroGrid) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      heroGrid.style.setProperty("--hx", (px * -18).toFixed(1) + "px");
      heroGrid.style.setProperty("--hy", (py * -18).toFixed(1) + "px");
    });
  }
})();
