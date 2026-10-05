/* ==========================================================================
   Favour Sobechi Opara / Security Operations Console
   Zero-dependency behaviour layer.
   Replaces: AOS, Typed.js, PureCounter, Waypoints, Isotope, imagesLoaded,
             GLightbox, Swiper and Bootstrap JS.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- Theme */

  var THEME_KEY = "fo-theme";

  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f4f5f8" : "#08090c");
    var btn = $(".theme-btn");
    if (btn) btn.setAttribute("aria-label", "Switch to " + (t === "light" ? "dark" : "light") + " theme");
  }

  var stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(stored || "dark");

  var themeBtn = $(".theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ----------------------------------------------------------- Boot screen */

  (function boot() {
    var el = $(".boot");
    if (!el) return;

    if (reduced) {
      el.hidden = true;
      return;
    }

    var lines = $$(".boot__log li", el);
    var bar = $(".boot__bar i", el);
    var i = 0;

    function step() {
      if (i < lines.length) {
        lines[i].classList.add("is-in");
        i++;
        if (bar) bar.style.width = (i / lines.length) * 100 + "%";
        setTimeout(step, 170);
      } else {
        setTimeout(function () {
          el.classList.add("is-done");
          setTimeout(function () { el.hidden = true; }, 700);
        }, 260);
      }
    }

    setTimeout(step, 120);

    // Never let the overlay trap the page.
    setTimeout(function () {
      el.classList.add("is-done");
      setTimeout(function () { el.hidden = true; }, 700);
    }, 3200);
  })();

  /* ------------------------------------------------- Scroll reveal (AOS) */

  var revealables = $$("[data-reveal]");

  if ("IntersectionObserver" in window && !reduced) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        revealIO.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    revealables.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ------------------------------------------------------- Role typewriter */

  (function roles() {
    var host = $("#role");
    if (!host) return;

    var items = (host.getAttribute("data-roles") || "").split("|").filter(Boolean);
    if (!items.length) return;

    if (reduced) {
      host.textContent = items[0];
      return;
    }

    var ri = 0, ci = 0, erasing = false;

    function tick() {
      var word = items[ri];

      if (!erasing) {
        ci++;
        host.textContent = word.slice(0, ci);
        if (ci === word.length) {
          erasing = true;
          return setTimeout(tick, 1750);
        }
        return setTimeout(tick, 52);
      }

      ci--;
      host.textContent = word.slice(0, ci);
      if (ci === 0) {
        erasing = false;
        ri = (ri + 1) % items.length;
        return setTimeout(tick, 320);
      }
      return setTimeout(tick, 26);
    }

    setTimeout(tick, 900);
  })();

  /* ------------------------------------------- Count-up metrics (counter) */

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    if (reduced) { el.textContent = String(target); return; }

    var dur = 1250;
    var t0 = null;

    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      // easeOutExpo
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(target * e));
      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countUp(en.target);
        countIO.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countIO.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  /* --------------------------------------------------- Segmented meters */

  var TICKS = 20;

  $$("[data-meter]").forEach(function (host) {
    var v = parseFloat(host.getAttribute("data-meter")) || 0;
    var lit = Math.round((v / 100) * TICKS);
    var frag = document.createDocumentFragment();

    for (var t = 0; t < TICKS; t++) {
      var seg = document.createElement("i");
      seg.style.setProperty("--t", String(t));
      if (t < lit) seg.className = "on";
      frag.appendChild(seg);
    }

    host.appendChild(frag);
  });

  /* Light up meters and timeline nodes as they arrive. Both react to .is-in,
     so they can share one observer. */
  var lightUp = $$(".cap-group").concat($$(".tl__item"));

  if ("IntersectionObserver" in window) {
    var meterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        meterIO.unobserve(en.target);
      });
    }, { threshold: 0.25 });
    lightUp.forEach(function (el) { meterIO.observe(el); });
  } else {
    lightUp.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ----------------------------------------------------- Hero node field */

  (function field() {
    var cv = $("#field");
    if (!cv || reduced) return;

    var ctx = cv.getContext("2d");
    if (!ctx) return;

    var nodes = [];
    var w = 0, h = 0, dpr = 1;
    var pointer = { x: -9999, y: -9999 };
    var running = true;
    var raf = null;

    function palette() {
      return root.getAttribute("data-theme") === "light"
        ? { node: "91, 61, 245", link: "91, 61, 245", packet: "14, 139, 168", threat: "220, 38, 38", ok: "5, 150, 105" }
        : { node: "150, 170, 255", link: "124, 92, 255", packet: "34, 211, 238", threat: "239, 68, 68", ok: "16, 185, 129" };
    }

    // Packets ride the links; every few seconds one node lights up as a
    // detection, gets triaged, and is contained.
    var packets = [];
    var threat = null;
    var nextThreat = performance.now() + 3200;

    var colors = palette();

    function size() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.min(Math.round((w * h) / 15000), 110);
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.5 + 0.7
        });
      }
    }

    function draw(ts) {
      ts = ts || performance.now();
      ctx.clearRect(0, 0, w, h);

      var LINK = 132;

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];

        n.x += n.vx;
        n.y += n.vy;

        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;

        // Gentle drift toward the cursor, reads as traffic converging.
        var pdx = pointer.x - n.x;
        var pdy = pointer.y - n.y;
        var pd2 = pdx * pdx + pdy * pdy;
        if (pd2 < 26000 && pd2 > 1) {
          var pull = 0.00028;
          n.vx += pdx * pull;
          n.vy += pdy * pull;
        }

        // Cap velocity so the field never runs away.
        var sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (sp > 0.55) {
          n.vx = (n.vx / sp) * 0.55;
          n.vy = (n.vy / sp) * 0.55;
        }

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x;
          var dy = n.y - m.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;

          ctx.strokeStyle = "rgba(" + colors.link + "," + (1 - d / LINK) * 0.3 + ")";
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();

          if (d < LINK * 0.75 && packets.length < 26 && Math.random() < 0.0012) {
            packets.push({ a: n, b: m, t: 0, s: 0.006 + Math.random() * 0.012 });
          }
        }

        ctx.fillStyle = "rgba(" + colors.node + ", 0.65)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Packets in flight. Drop any whose link has stretched apart.
      for (var k = packets.length - 1; k >= 0; k--) {
        var pk = packets[k];
        pk.t += pk.s;
        var ax = pk.b.x - pk.a.x, ay = pk.b.y - pk.a.y;
        if (pk.t >= 1 || ax * ax + ay * ay > LINK * LINK) {
          packets.splice(k, 1);
          continue;
        }
        var px = pk.a.x + ax * pk.t, py = pk.a.y + ay * pk.t;
        var g = ctx.createRadialGradient(px, py, 0, px, py, 6);
        g.addColorStop(0, "rgba(" + colors.packet + ", 0.9)");
        g.addColorStop(1, "rgba(" + colors.packet + ", 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Detection, then containment.
      if (!threat && ts > nextThreat && nodes.length) {
        // On wide screens keep the event clear of the headline copy.
        var pool = w > 900 ? nodes.filter(function (q) {
          return q.x > w * 0.56 && q.x < w * 0.86 && q.y > h * 0.16 && q.y < h * 0.62;
        }) : nodes;
        if (!pool.length) pool = nodes;
        threat = { n: pool[Math.floor(Math.random() * pool.length)], t0: ts };
      }
      if (threat) {
        var age = (ts - threat.t0) / 1000;
        var tn = threat.n;
        if (age < 1.8) {
          var halo = ctx.createRadialGradient(tn.x, tn.y, 0, tn.x, tn.y, 46);
          halo.addColorStop(0, "rgba(" + colors.threat + ", 0.35)");
          halo.addColorStop(1, "rgba(" + colors.threat + ", 0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(tn.x, tn.y, 46, 0, Math.PI * 2);
          ctx.fill();
          for (var ring = 0; ring < 3; ring++) {
            var ph = ((age + ring * 0.3) % 0.9) / 0.9;
            ctx.strokeStyle = "rgba(" + colors.threat + "," + (1 - ph) + ")";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(tn.x, tn.y, 5 + ph * 52, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = "rgba(" + colors.threat + ", 1)";
          ctx.beginPath();
          ctx.arc(tn.x, tn.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = "500 12px 'IBM Plex Mono', monospace";
          // Labels would sit on top of the copy on narrow screens.
          if (w > 900) ctx.fillText((age * 4 | 0) % 2 ? "ALERT" : "ALERT_", tn.x + 14, tn.y - 12);
        } else if (age < 3) {
          var q = (age - 1.8) / 1.2;
          var e2 = 1 - Math.pow(1 - q, 3);
          ctx.strokeStyle = "rgba(" + colors.ok + "," + (1 - q * 0.5) + ")";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tn.x, tn.y, 44 - e2 * 32, 0, Math.PI * 2);
          ctx.stroke();
          // Lock brackets close in around the node.
          var br = 22 - e2 * 10;
          ctx.beginPath();
          [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) {
            ctx.moveTo(tn.x + c[0] * br, tn.y + c[1] * (br - 6));
            ctx.lineTo(tn.x + c[0] * br, tn.y + c[1] * br);
            ctx.lineTo(tn.x + c[0] * (br - 6), tn.y + c[1] * br);
          });
          ctx.stroke();
          ctx.fillStyle = "rgba(" + colors.ok + "," + (1 - q * 0.4) + ")";
          ctx.beginPath();
          ctx.arc(tn.x, tn.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = "500 12px 'IBM Plex Mono', monospace";
          // Labels would sit on top of the copy on narrow screens.
          if (w > 900) ctx.fillText("CONTAINED", tn.x + 16, tn.y - 14);
        } else {
          threat = null;
          nextThreat = ts + 3500 + Math.random() * 4000;
        }
      }

      if (running) raf = requestAnimationFrame(draw);
    }

    size();
    draw();

    var rt = null;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { size(); colors = palette(); }, 180);
    });

    window.addEventListener("pointermove", function (e) {
      var r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    }, { passive: true });

    window.addEventListener("pointerleave", function () {
      pointer.x = pointer.y = -9999;
    });

    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        setTimeout(function () { colors = palette(); }, 0);
      });
    }

    // Stop painting when the hero is off-screen or the tab is hidden.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !running) {
            running = true;
            raf = requestAnimationFrame(draw);
          } else if (!en.isIntersecting && running) {
            running = false;
            if (raf) cancelAnimationFrame(raf);
          }
        });
      }).observe(cv);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    });
  })();

  /* ------------------------------------------ Split-flap sources board */

  (function board() {
    var rows = $$(".brow");
    if (!rows.length) return;

    var frame = $(".board__frame");
    var TILES = 16;
    var FD = 70; // ms per half-flap
    var CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+.&";

    function tileEl() {
      var t = document.createElement("span");
      t.className = "tile";
      t.style.setProperty("--fd", FD + "ms");
      t.innerHTML =
        '<span class="half half--top"><b></b></span>' +
        '<span class="half half--bot"><b></b></span>' +
        '<span class="half half--top leaf"><b></b></span>' +
        '<span class="half half--bot leaf"><b></b></span>';
      t._b = $$("b", t);
      t._ch = " ";
      return t;
    }

    function setStatic(t, ch) {
      t._b[0].textContent = ch;
      t._b[1].textContent = ch;
      t._ch = ch;
    }

    // One mechanical flip from the current character to the next.
    function flipOnce(t, ch, done) {
      var cur = t._ch;
      t._b[0].textContent = ch;   // new top, revealed as the leaf falls
      t._b[1].textContent = cur;  // old bottom, covered as the leaf lands
      t._b[2].textContent = cur;  // falling leaf: old top
      t._b[3].textContent = ch;   // landing leaf: new bottom
      t.classList.remove("is-flip");
      void t.offsetWidth;
      t.classList.add("is-flip");
      setTimeout(function () {
        t._b[1].textContent = ch;
        t.classList.remove("is-flip");
        t._ch = ch;
        done();
      }, FD * 2 + 10);
    }

    // Real boards step through a few cards before landing on the target.
    function spinTo(t, ch, delay) {
      if (t._ch === ch) return;
      var steps = [];
      var n = 1 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) steps.push(CHARS.charAt(1 + Math.floor(Math.random() * (CHARS.length - 1))));
      steps.push(ch);

      setTimeout(function next() {
        if (!steps.length) return;
        flipOnce(t, steps.shift(), next);
      }, delay);
    }

    function pad(word) {
      word = word.toUpperCase().slice(0, TILES);
      while (word.length < TILES) word += " ";
      return word;
    }

    rows.forEach(function (row) {
      var host = $(".brow__val", row);
      var tools = (row.getAttribute("data-tools") || "").split("|").filter(Boolean);
      if (!host || !tools.length) return;

      var flaps = document.createElement("span");
      flaps.className = "flaps";
      var tiles = [];
      for (var i = 0; i < TILES; i++) {
        var t = tileEl();
        tiles.push(t);
        flaps.appendChild(t);
      }
      host.replaceWith(flaps);

      row._tiles = tiles;
      row._tools = tools;
      row._at = -1;
    });

    function show(row, word, animate) {
      var text = pad(word);
      row._tiles.forEach(function (t, i) {
        var ch = text.charAt(i);
        if (animate) spinTo(t, ch, i * 28);
        else setStatic(t, ch);
      });
      if (animate) {
        var st = $(".brow__st span", row);
        row.classList.add("is-sync");
        if (st) st.textContent = "Sync";
        setTimeout(function () {
          row.classList.remove("is-sync");
          if (st) st.textContent = "Online";
        }, TILES * 28 + FD * 8);
      }
    }

    function advance(row, animate) {
      row._at = (row._at + 1) % row._tools.length;
      show(row, row._tools[row._at], animate);
    }

    // Start blank so the first pass flips every name into place.
    rows.forEach(function (row) {
      if (!row._tiles) return;
      show(row, "", false);
    });

    var started = false;
    var timer = null;
    var turn = 0;

    function cycle() {
      // Rows take turns, so there is always one board line in motion.
      var row = rows[turn % rows.length];
      turn++;
      if (row._tiles && row._tools.length > 1) advance(row, !reduced);
    }

    function start() {
      if (!started) {
        started = true;
        rows.forEach(function (row, i) {
          if (!row._tiles) return;
          if (reduced) advance(row, false);
          else setTimeout(function () { advance(row, true); }, 250 + i * 220);
        });
      }
      if (!timer) timer = setInterval(cycle, reduced ? 4000 : 1700);
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    var inView = !("IntersectionObserver" in window && frame);

    if (!inView) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          inView = en.isIntersecting;
          if (inView && !document.hidden) start();
          else stop();
        });
      }, { threshold: 0.25 }).observe(frame);
    } else {
      start();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (inView) start();
    });

    var clock = $("#boardClock");
    if (clock) {
      var tickClock = function () {
        var d = new Date();
        clock.textContent = d.toISOString().slice(11, 19) + " UTC";
      };
      tickClock();
      setInterval(tickClock, 1000);
    }
  })();

  /* ------------------------------------------- Venture showcase gallery */

  (function showcase() {
    var root_ = $(".showcase");
    if (!root_) return;

    var tabs = $$(".showcase__tabs button", root_);
    var deskImgs = $$(".browser__view img", root_);
    var phoneImgs = $$(".phone__view img", root_);
    var urlEl = $(".browser__url span", root_);
    var capEl = $(".showcase__cap", root_);
    if (!tabs.length || deskImgs.length < 2 || phoneImgs.length < 2) return;

    var DUR = 6500;
    var at = 0;
    var front = 0;
    var timer = null;
    var paused = false;
    var inView = false;

    root_.style.setProperty("--dur", DUR + "ms");

    function swap(imgs, src, tall) {
      var next = imgs[1 - front];
      var cur = imgs[front];
      next.classList.toggle("is-tall", !!tall);
      var show = function () {
        next.classList.add("is-on");
        cur.classList.remove("is-on");
      };
      if (next.getAttribute("src") === src && next.complete) { show(); return; }
      next.onload = show;
      next.src = src;
    }

    function go(i, user) {
      var nextAt = (i + tabs.length) % tabs.length;
      if (nextAt !== at) {
        var nt = tabs[nextAt];
        swap(deskImgs, nt.getAttribute("data-desktop"), nt.hasAttribute("data-tall"));
        swap(phoneImgs, nt.getAttribute("data-mobile"), false);
        front = 1 - front;
      }
      at = nextAt;
      var t = tabs[at];
      tabs.forEach(function (b, k) {
        b.setAttribute("aria-selected", String(k === at));
        b.tabIndex = k === at ? 0 : -1;
        b.classList.remove("is-run");
      });
      deskImgs.forEach(function (im) { im.alt = t.getAttribute("data-alt") + ", desktop view"; });
      phoneImgs.forEach(function (im) { im.alt = t.getAttribute("data-alt") + ", mobile view"; });
      if (urlEl) urlEl.textContent = t.getAttribute("data-path") || "";
      if (capEl) capEl.textContent = t.getAttribute("data-cap") || "";
      if (!reduced) {
        void t.offsetWidth;
        t.classList.add("is-run");
      }
      if (user) restart();
    }

    function tick() {
      if (paused || !inView || document.hidden) return;
      go(at + 1, false);
    }

    function restart() {
      clearInterval(timer);
      timer = reduced ? null : setInterval(tick, DUR);
    }

    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () { go(i, true); });
      b.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
          : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        go(at + d, true);
        tabs[at].focus();
      });
    });

    // Hovering the stage pauses the reel so a visitor can read a page.
    var stage = $(".showcase__stage", root_);
    if (stage) {
      stage.addEventListener("mouseenter", function () { paused = true; root_.classList.add("is-paused"); });
      stage.addEventListener("mouseleave", function () { paused = false; root_.classList.remove("is-paused"); });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        root_.classList.toggle("is-live", inView);
      }, { threshold: 0.3 }).observe(root_);
    } else {
      inView = true;
    }

    // Layer 0 already holds the first slide in the markup.
    deskImgs[0].classList.add("is-on");
    phoneImgs[0].classList.add("is-on");
    deskImgs[0].classList.toggle("is-tall", tabs[0].hasAttribute("data-tall"));
    go(0, false);
    restart();
  })();

  /* ------------------------------------------------------- Nav + progress */

  var nav = $(".nav");
  var bar = $(".progress i");
  var toTop = $(".to-top");
  var spines = $$(".tl");

  var sections = $$("[data-section]");
  var navLinks = $$(".nav__links a");
  var railBtns = $$(".rail button");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (nav) nav.classList.toggle("is-stuck", y > 12);
    if (bar) bar.parentNode.style.setProperty("--p", (max > 0 ? (y / max) * 100 : 0) + "%");
    if (toTop) toTop.classList.toggle("is-on", y > window.innerHeight * 0.8);

    // Timeline spine fill tracks the viewport centre. There is one spine per
    // column, so every one has to be driven independently.
    var mid = window.innerHeight * 0.55;
    spines.forEach(function (spine) {
      var r = spine.getBoundingClientRect();
      if (!r.height) return;
      var p = (mid - r.top) / r.height;
      spine.style.setProperty("--fill", Math.max(0, Math.min(1, p)) * 100 + "%");
    });

    // Active section: the last one whose top has passed the trigger line.
    var line = y + window.innerHeight * 0.32;
    var current = sections.length ? sections[0].id : null;

    sections.forEach(function (s) {
      if (s.offsetTop <= line) current = s.id;
    });

    navLinks.forEach(function (a) {
      a.setAttribute("aria-current", a.getAttribute("href") === "#" + current ? "true" : "false");
    });

    railBtns.forEach(function (b) {
      b.setAttribute("aria-current", b.getAttribute("data-to") === current ? "true" : "false");
    });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener("resize", onScroll);
  onScroll();

  railBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var t = document.getElementById(b.getAttribute("data-to"));
      if (t) t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* --------------------------------------------------------- Mobile sheet */

  (function sheet() {
    var burger = $(".burger");
    var panel = $(".sheet");
    if (!burger || !panel) return;

    function set(open) {
      panel.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (nav) nav.classList.toggle("is-sheet", open);
      document.body.style.overflow = open ? "hidden" : "";
    }

    burger.addEventListener("click", function () {
      set(!panel.classList.contains("is-open"));
    });

    /* Anchor jumps are swallowed while the body is scroll-locked, so drive the
       scroll manually once the lock has lifted. */
    $$("a", panel).forEach(function (a, i) {
      a.style.setProperty("--i", String(i));

      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href") || "";
        var target = href.charAt(0) === "#" ? document.getElementById(href.slice(1)) : null;

        set(false);
        if (!target) return;

        e.preventDefault();
        requestAnimationFrame(function () {
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
          if (history.replaceState) history.replaceState(null, "", href);
        });
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        set(false);
        burger.focus();
      }
    });
  })();

  /* ------------------------------------------------- Risk matrix (custom) */

  (function matrix() {
    var grid = $("#matrix");
    var src = $("#riskData");
    if (!grid || !src) return;

    var L_LABELS = ["Rare", "Unlikely", "Possible", "Likely", "Almost certain"];
    var I_LABELS = ["Insignificant", "Minor", "Moderate", "Major", "Severe"];

    var items = $$("li", src).map(function (li, idx) {
      return {
        n: idx + 1,
        l: Math.max(1, Math.min(5, parseInt(li.getAttribute("data-l"), 10) || 1)),
        i: Math.max(1, Math.min(5, parseInt(li.getAttribute("data-i"), 10) || 1)),
        title: li.getAttribute("data-title") || "",
        desc: li.getAttribute("data-desc") || "",
        domain: li.getAttribute("data-domain") || "",
        href: li.getAttribute("data-href") || ""
      };
    });

    function band(score) {
      if (score <= 4) return 1;
      if (score <= 8) return 2;
      if (score <= 12) return 3;
      if (score <= 17) return 4;
      return 5;
    }

    var cells = {};
    var frag = document.createDocumentFragment();

    // Rows run severe (impact 5) at the top down to insignificant (1).
    for (var imp = 5; imp >= 1; imp--) {
      var ylab = document.createElement("div");
      ylab.className = "matrix__ylab";
      ylab.textContent = I_LABELS[imp - 1];
      frag.appendChild(ylab);

      for (var lik = 1; lik <= 5; lik++) {
        var score = imp * lik;
        var cell = document.createElement("div");
        cell.className = "cell";
        cell.setAttribute("data-band", String(band(score)));
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-label",
          I_LABELS[imp - 1] + " impact, " + L_LABELS[lik - 1] + " likelihood, score " + score);

        var sc = document.createElement("span");
        sc.className = "cell__score";
        sc.textContent = score;
        cell.appendChild(sc);

        cells[lik + ":" + imp] = cell;
        frag.appendChild(cell);
      }
    }

    // Bottom axis: spacer + five likelihood labels.
    frag.appendChild(document.createElement("div"));
    for (var k = 0; k < 5; k++) {
      var xlab = document.createElement("div");
      xlab.className = "matrix__xlab";
      xlab.textContent = L_LABELS[k];
      frag.appendChild(xlab);
    }

    grid.appendChild(frag);

    /* Read-out panel */
    var out = {
      badge: $("#roBadge"),
      title: $("#roTitle"),
      desc: $("#roDesc"),
      lik: $("#roLik"),
      imp: $("#roImp"),
      score: $("#roScore"),
      domain: $("#roDomain"),
      link: $("#roLink")
    };

    var pins = [];

    function select(item, pin) {
      pins.forEach(function (p) {
        p.classList.toggle("is-on", p === pin);
        p.setAttribute("aria-pressed", String(p === pin));
      });

      var score = item.l * item.i;
      var b = band(score);
      var heat = "var(--heat-" + b + ")";
      var word = ["Low", "Moderate", "Elevated", "High", "Critical"][b - 1];

      var panel = $(".readout");
      if (panel) panel.style.setProperty("--cell", heat);

      if (out.badge) out.badge.textContent = word;
      if (out.title) out.title.textContent = item.title;
      if (out.desc) out.desc.textContent = item.desc;
      if (out.lik) out.lik.textContent = L_LABELS[item.l - 1];
      if (out.imp) out.imp.textContent = I_LABELS[item.i - 1];
      if (out.score) out.score.textContent = score + " / 25";
      if (out.domain) out.domain.textContent = item.domain;

      if (out.link) {
        if (item.href) {
          out.link.href = item.href;
          out.link.hidden = false;
        } else {
          out.link.hidden = true;
        }
      }
    }

    items.forEach(function (item, idx) {
      var cell = cells[item.l + ":" + item.i];
      if (!cell) return;

      var pin = document.createElement("button");
      pin.type = "button";
      pin.className = "pin";
      pin.textContent = item.n;
      pin.style.setProperty("--d", String(idx));
      pin.setAttribute("aria-pressed", "false");
      pin.setAttribute("title", item.title);
      pin.setAttribute("aria-label",
        item.title + ": " + L_LABELS[item.l - 1] + " likelihood, " + I_LABELS[item.i - 1] + " impact");

      pin.addEventListener("click", function () { select(item, pin); });
      pin.addEventListener("mouseenter", function () { select(item, pin); });
      pin.addEventListener("focus", function () { select(item, pin); });

      cell.appendChild(pin);
      pins.push(pin);
    });

    if (items.length) select(items[0], pins[0]);
  })();

  /* ------------------------------------------------ Case filters (Isotope) */

  (function filters() {
    var bar = $(".filters");
    var wrap = $(".cases");
    if (!bar || !wrap) return;

    var cards = $$(".case", wrap);

    // Label each chip with a live count.
    $$("button", bar).forEach(function (b) {
      var f = b.getAttribute("data-filter");
      var n = f === "*"
        ? cards.length
        : cards.filter(function (c) { return c.getAttribute("data-cat") === f; }).length;

      var sup = document.createElement("sup");
      sup.textContent = n;
      b.appendChild(sup);

      b.addEventListener("click", function () {
        $$("button", bar).forEach(function (o) {
          o.setAttribute("aria-pressed", String(o === b));
        });

        cards.forEach(function (c) {
          var show = f === "*" || c.getAttribute("data-cat") === f;

          if (reduced) {
            c.hidden = !show;
            return;
          }

          if (show) {
            c.hidden = false;
            requestAnimationFrame(function () { c.classList.remove("is-out"); });
          } else {
            c.classList.add("is-out");
            setTimeout(function () {
              if (c.classList.contains("is-out")) c.hidden = true;
            }, 300);
          }
        });
      });
    });
  })();

  /* ------------------------------------------------------- Triage lab */

  (function lab() {
    var queueEl = $("#labQueue");
    var alertEl = $("#labAlert");
    var scoreEl = $("#labScore");
    if (!queueEl || !alertEl) return;

    var BEST_KEY = "fo-lab-best";
    var ATTACK = "https://attack.mitre.org/techniques/";

    var VERDICTS = [
      { id: "fp", label: "False positive", hint: "The rule misfired. Tune it." },
      { id: "benign", label: "Benign", hint: "Real activity, and authorised." },
      { id: "escalate", label: "Escalate", hint: "Suspicious. Hand it to IR." }
    ];

    /* Synthetic alerts. Addresses use the RFC 5737 documentation ranges and
       domains use example.com, so nothing here points at a real system. */
    var ALERTS = [
      {
        id: "SEN-4471", sev: "medium", src: "Microsoft Sentinel",
        title: "Impossible travel: sign-ins from two countries 38 minutes apart",
        ev: [
          ["User", "a.okafor@corp.example.com"],
          ["Sign-in 1", "Lagos, NG / 198.51.100.24 / 08:02 UTC"],
          ["Sign-in 2", "London, GB / 203.0.113.10 / 08:40 UTC"],
          ["Sign-in 2 owner", "Corporate VPN egress, Azure UK South"],
          ["MFA", "Satisfied, number matching"],
          ["Device", "Intune compliant, same device ID on both"]
        ],
        answer: "benign",
        why: "The user didn't travel, the traffic did. The second sign-in leaves through the company's own VPN concentrator in UK South, from the same compliant device, with MFA satisfied. Close as benign, then add the VPN egress range as a trusted named location so the analytic stops treating it as a separate country.",
        tags: [["T1078", "Valid Accounts (ruled out)"]]
      },
      {
        id: "MDE-2093", sev: "high", src: "Defender for Endpoint",
        title: "Office application spawned hidden, encoded PowerShell",
        ev: [
          ["Host", "FIN-WS-0142"],
          ["Parent process", "WINWORD.EXE"],
          ["Child process", "powershell.exe -nop -w hidden -enc [1,184 chars, redacted]"],
          ["File", "Invoice_Q3_overdue.docm, external sender, first seen in tenant"],
          ["Network", "HTTPS to update-check.example.net, domain registered 3 days ago"]
        ],
        answer: "escalate",
        why: "Word has no business launching hidden, encoded PowerShell. A macro-enabled attachment from an external sender, never seen in the tenant before, followed by an outbound call to a days-old domain is a textbook initial access chain. Isolate the host, purge the email from every mailbox it reached, block the domain, decode the command and escalate to IR with all of it attached.",
        tags: [["T1566.001", "Spearphishing Attachment"], ["T1204.002", "Malicious File"], ["T1059.001", "PowerShell"]]
      },
      {
        id: "IDS-0871", sev: "medium", src: "Network IDS",
        title: "Internal host sweeping ports and attempting SMB authentication",
        ev: [
          ["Source", "10.20.4.15 (vuln-scan-01)"],
          ["Targets", "1,284 hosts across 10.20.0.0/16"],
          ["Activity", "TCP 22, 445, 3389 sweep; SMB auth as svc-insightvm"],
          ["Time", "Saturday 01:00 to 03:30 UTC"],
          ["Change record", "CHG-20931, approved weekly authenticated scan"]
        ],
        answer: "benign",
        why: "This is the Rapid7 InsightVM scan engine doing exactly what the change record says, inside the approved window, with its own service account. Close as benign. Then check that any suppression is scoped to that host, that account and that window only, so the same box sweeping the network at 14:00 on a Tuesday still fires.",
        tags: [["T1046", "Network Service Discovery (authorised)"]]
      },
      {
        id: "CS-7710", sev: "critical", src: "CrowdStrike Falcon",
        title: "Credential dumping: LSASS process memory accessed",
        ev: [
          ["Host", "HR-WS-0057"],
          ["Command", "procdump64.exe -ma lsass.exe C:\\Users\\Public\\l.dmp"],
          ["Account", "helpdesk.tmp, created 6 days ago"],
          ["Time", "02:14 local"],
          ["Change record", "None"],
          ["Preceded by", "RDP logon from 10.20.9.33 at 02:06"]
        ],
        answer: "escalate",
        why: "ProcDump is legitimate Sysinternals software, which is precisely why attackers use it. An LSASS dump written to a world-readable folder at 02:14, by a six-day-old account, with no change record, straight after a fresh RDP session, is credential theft until proven otherwise. Contain the host, disable the account, scope everything 10.20.9.33 has touched, and treat every credential cached on that machine as burned.",
        tags: [["T1003.001", "LSASS Memory"], ["T1021.001", "Remote Desktop Protocol"]]
      },
      {
        id: "DLP-3318", sev: "medium", src: "DLP, custom regex rule",
        title: "Outbound email matched payment card number pattern",
        ev: [
          ["Sender", "logistics@corp.example.com"],
          ["Recipient", "Contracted freight carrier"],
          ["Match", "4929 1830 2214 5568 (16 digits)"],
          ["Luhn checksum", "Fail"],
          ["Context", "\"Consignment ref\" column in a shipping manifest"],
          ["History", "14 alerts this week, same manifest template"]
        ],
        answer: "fp",
        why: "Sixteen digits is not a card number. The match fails the Luhn checksum, sits in a consignment reference column, and the same template has fired fourteen times this week. Close as a false positive and fix the detection: swap the bare regex for a checksum-validated card pattern with supporting keywords nearby, so the PCI DSS control keeps its teeth without burying the queue.",
        tags: [["", "PCI DSS"], ["", "Detection tuning"]]
      },
      {
        id: "SEN-4502", sev: "high", src: "Microsoft Sentinel",
        title: "Password spray against Entra ID with one successful sign-in",
        ev: [
          ["Source IP", "203.0.113.47, on threat intel watchlist"],
          ["Failures", "312 across 141 accounts in 20 minutes"],
          ["Successes", "1: svc-reporting@corp.example.com"],
          ["Protocol", "IMAP (legacy authentication)"],
          ["MFA", "Not applied: legacy protocol"]
        ],
        answer: "escalate",
        why: "The failures alone would be block and monitor. The single success changes everything: a service account authenticated over legacy IMAP, which never meets an MFA prompt. Treat it as compromised. Disable the account, revoke sessions, rotate the credential, review mailbox rules and data access since the sign-in, and close the legacy auth gap with conditional access.",
        tags: [["T1110.003", "Password Spraying"], ["T1078", "Valid Accounts"]]
      }
    ];

    var cur = 0;
    var shownAt = 0;
    var done = {};
    var labEl = alertEl.closest(".lab");

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }

    function verdictLabel(id) {
      for (var i = 0; i < VERDICTS.length; i++) if (VERDICTS[i].id === id) return VERDICTS[i].label;
      return id;
    }

    function stats() {
      var n = 0, ok = 0, ms = 0;
      ALERTS.forEach(function (a) {
        var d = done[a.id];
        if (!d) return;
        n++;
        if (d.ok) ok++;
        ms += d.ms;
      });
      return { n: n, ok: ok, avg: n ? ms / n : 0 };
    }

    function secs(ms) {
      return (ms / 1000).toFixed(1) + "s";
    }

    function renderScore() {
      var s = stats();
      if (scoreEl) scoreEl.textContent = s.ok + " / " + s.n + " correct";
    }

    function renderQueue() {
      queueEl.textContent = "";
      ALERTS.forEach(function (a, i) {
        var li = el("li");
        var b = el("button", "queue__item" + (done[a.id] ? "" : " is-new"));
        b.type = "button";
        b.setAttribute("data-sev", a.sev);
        b.setAttribute("aria-current", String(i === cur));

        var d = done[a.id];
        var st = el("span", "queue__st" + (d ? (d.ok ? " is-ok" : " is-miss") : ""),
          d ? (d.ok ? "match" : "differs") : "new");

        var mid = el("span");
        mid.appendChild(el("span", "queue__id", a.id + " / " + a.sev));
        mid.appendChild(el("span", "queue__t", a.title));

        b.appendChild(el("span", "queue__sev"));
        b.appendChild(mid);
        b.appendChild(st);
        b.setAttribute("aria-label", a.id + ", " + a.sev + " severity: " + a.title +
          (d ? ". Triaged, " + (d.ok ? "matches my call" : "differs from my call") : ". Not yet triaged"));

        b.addEventListener("click", function () { show(i, true); });
        li.appendChild(b);
        queueEl.appendChild(li);
      });
    }

    function tagList(tags) {
      var wrap = el("div", "attack");
      tags.forEach(function (t) {
        if (t[0]) {
          var a = el("a", null, t[0] + " " + t[1]);
          a.href = ATTACK + t[0].replace(".", "/") + "/";
          a.target = "_blank";
          a.rel = "noopener";
          wrap.appendChild(a);
        } else {
          wrap.appendChild(el("span", null, t[1]));
        }
      });
      return wrap;
    }

    function debrief(a, d, fresh) {
      var box = el("div", "debrief " + (d.ok ? "is-ok" : "is-miss") + (fresh ? " is-fresh" : ""));
      box.appendChild(el("span", "stamp", d.ok ? "Match" : "Differs")).setAttribute("aria-hidden", "true");
      var res = el("p", "debrief__res");
      res.appendChild(el("b", null, d.ok ? "Same call as mine" : "I'd call it " + verdictLabel(a.answer)));
      res.appendChild(el("span", null, "You: " + verdictLabel(d.pick)));
      res.appendChild(el("span", null, "Time to verdict " + secs(d.ms)));
      box.appendChild(res);
      box.appendChild(el("p", null, a.why));
      box.appendChild(tagList(a.tags));

      var next = el("button", "btn");
      next.type = "button";
      var remaining = ALERTS.filter(function (x) { return !done[x.id]; }).length;
      next.textContent = remaining ? "Next alert" : "End shift and see the summary";
      next.addEventListener("click", advance);
      box.appendChild(next);
      return box;
    }

    function show(i, focus, fresh) {
      cur = i;
      var a = ALERTS[i];
      var d = done[a.id];

      alertEl.textContent = "";
      alertEl.setAttribute("data-sev", a.sev);
      alertEl.classList.toggle("is-nav", !fresh);

      var head = el("div", "alert__head");
      head.appendChild(el("span", "sev-badge", a.sev));
      head.appendChild(el("span", null, a.id));
      head.appendChild(el("span", null, a.src));
      alertEl.appendChild(head);

      alertEl.appendChild(el("h3", null, a.title));

      var dl = el("dl", "evidence");
      a.ev.forEach(function (row) {
        var r = el("div");
        r.appendChild(el("dt", null, row[0]));
        r.appendChild(el("dd", null, row[1]));
        dl.appendChild(r);
      });
      alertEl.appendChild(dl);

      var vs = el("div", "verdicts");
      vs.setAttribute("role", "group");
      vs.setAttribute("aria-label", "Your verdict");
      VERDICTS.forEach(function (v, k) {
        var b = el("button", "verdict");
        b.type = "button";
        var top = el("b", null, v.label);
        top.appendChild(el("kbd", null, String(k + 1)));
        b.appendChild(top);
        b.appendChild(el("span", null, v.hint));
        if (d) {
          b.disabled = true;
          if (v.id === a.answer) b.classList.add("is-right");
          if (v.id === d.pick) b.classList.add("is-pick");
        } else {
          b.addEventListener("click", function () { decide(v.id); });
        }
        vs.appendChild(b);
      });
      alertEl.appendChild(vs);

      if (d) alertEl.appendChild(debrief(a, d, fresh));
      if (fresh && d && !d.ok) vs.classList.add("is-shake");

      shownAt = Date.now();
      renderQueue();

      if (focus) {
        alertEl.focus({ preventScroll: true });
        var r = alertEl.getBoundingClientRect();
        if (r.top < 0 || r.top > window.innerHeight * 0.6) {
          alertEl.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        }
      }
    }

    function decide(pick) {
      var a = ALERTS[cur];
      if (done[a.id]) return;
      done[a.id] = { pick: pick, ok: pick === a.answer, ms: Date.now() - shownAt };
      renderScore();
      show(cur, false, true);
      var next = $(".debrief .btn", alertEl);
      if (next) next.focus({ preventScroll: true });
    }

    function advance() {
      for (var k = 1; k <= ALERTS.length; k++) {
        var j = (cur + k) % ALERTS.length;
        if (!done[ALERTS[j].id]) return show(j, true);
      }
      summary();
    }

    function summary() {
      var s = stats();
      var best = 0;
      try { best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) {}
      if (s.ok > best) {
        best = s.ok;
        try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) {}
      }

      alertEl.textContent = "";
      alertEl.removeAttribute("data-sev");

      var box = el("div", "shift");
      box.appendChild(el("p", "eyebrow", "Shift complete"));

      var big = el("p", "shift__big");
      var n = el("span", null, "0");
      n.setAttribute("data-count", String(s.ok));
      big.appendChild(n);
      big.appendChild(el("i", null, " / " + ALERTS.length + " calls matched"));
      countUp(n);
      box.appendChild(big);

      var msg = s.ok === ALERTS.length
        ? "Clean shift. Every call matched mine. If you're hiring, we should compare notes for real."
        : s.ok >= ALERTS.length - 2
          ? "Solid shift. Reopen the alerts we called differently; the analyst notes are where the learning is."
          : "Rough night. Everyone has one. Each alert in the queue keeps its analyst notes, so step back through them.";
      box.appendChild(el("p", null, msg));

      var dl = el("dl", "evidence");
      [
        ["Average time to verdict", secs(s.avg)],
        ["Escalations caught", ALERTS.filter(function (a) {
          return a.answer === "escalate" && done[a.id] && done[a.id].ok;
        }).length + " of " + ALERTS.filter(function (a) { return a.answer === "escalate"; }).length],
        ["Best score on this device", best + " / " + ALERTS.length]
      ].forEach(function (row) {
        var r = el("div");
        r.appendChild(el("dt", null, row[0]));
        r.appendChild(el("dd", null, row[1]));
        dl.appendChild(r);
      });
      box.appendChild(dl);

      var row = el("div", "footer__btns");
      var again = el("button", "btn");
      again.type = "button";
      again.textContent = "Run the shift again";
      again.addEventListener("click", function () {
        done = {};
        renderScore();
        show(0, true);
      });
      var talk = el("a", "btn btn--ghost", "Talk to the analyst");
      talk.href = "#contact";
      row.appendChild(again);
      row.appendChild(talk);
      box.appendChild(row);

      alertEl.appendChild(box);
      renderQueue();
      $$(".queue__item", queueEl).forEach(function (b) { b.setAttribute("aria-current", "false"); });
      alertEl.focus({ preventScroll: true });
    }

    // Number keys pick a verdict while focus is anywhere inside the lab.
    if (labEl) {
      labEl.addEventListener("keydown", function (e) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        var k = parseInt(e.key, 10);
        if (k >= 1 && k <= VERDICTS.length && !done[ALERTS[cur].id] && $(".verdicts", alertEl)) {
          e.preventDefault();
          decide(VERDICTS[k - 1].id);
        }
      });
    }

    renderScore();
    show(0, false);

    // Start the clock when the alert is actually on screen, not at page load.
    if ("IntersectionObserver" in window) {
      var clockIO = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        if (!done[ALERTS[cur].id]) shownAt = Date.now();
        clockIO.disconnect();
      }, { threshold: 0.4 });
      clockIO.observe(alertEl);
    }
  })();

  /* ---------------------------------------------------- Analyst console */

  (function console_() {
    var dlg = $("#term");
    var out = $("#termOut");
    var form = $("#termForm");
    var input = $("#termCmd");
    var openBtns = $$("[data-console]");

    if (!dlg || !out || !form || !input || typeof dlg.showModal !== "function") {
      openBtns.forEach(function (b) { b.hidden = true; });
      $$(".kb-only").forEach(function (n) { n.hidden = true; });
      return;
    }

    var EMAIL = "favouropara48@gmail.com";
    var SECTIONS = {
      top: "top", home: "top",
      about: "about", profile: "about",
      soc: "soc", ops: "soc",
      lab: "lab", triage: "lab",
      risk: "risk", matrix: "risk",
      skills: "capabilities", capabilities: "capabilities",
      experience: "experience", career: "experience", exp: "experience",
      work: "work", cases: "work",
      contact: "contact"
    };
    var LINKS = {
      linkedin: "https://www.linkedin.com/in/favour-opara-a2513018a",
      github: "https://github.com/favourOpara",
      x: "https://twitter.com/candlesticksand",
      twitter: "https://twitter.com/candlesticksand"
    };

    var hist = [];
    var hi = 0;
    var greeted = false;

    function line(text, cls) {
      var p = document.createElement("p");
      if (cls) p.className = cls;
      p.textContent = text;
      out.appendChild(p);
      return p;
    }

    function lines(arr, cls) {
      arr.forEach(function (t) { line(t, cls); });
    }

    function linkLine(label, href) {
      var p = document.createElement("p");
      var a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
      p.appendChild(a);
      out.appendChild(p);
    }

    function go(id) {
      var t = document.getElementById(id);
      close();
      if (t) {
        requestAnimationFrame(function () {
          t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
          if (history.replaceState) history.replaceState(null, "", "#" + id);
        });
      }
    }

    function copy(text, ok) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { line(ok, "ok"); },
          function () { line("Clipboard blocked by the browser. It's " + text + ".", "warn"); });
      } else {
        line("Clipboard unavailable. It's " + text + ".", "warn");
      }
    }

    var CMDS = {
      help: {
        d: "list commands",
        run: function () {
          Object.keys(CMDS).forEach(function (k) {
            if (CMDS[k].d) line(("  " + k + "            ").slice(0, 14) + CMDS[k].d);
          });
          line("Tab completes, arrow keys walk history, Esc closes.", "dim");
        }
      },
      whoami: {
        d: "the short version",
        run: function () {
          line("Favour Sobechi Opara", "hi");
          lines([
            "SOC analyst, cybersecurity and IT risk.",
            "MSc Cybersecurity with Distinction, University of Sunderland.",
            "Based in Sunderland, UK. Open to SOC roles, 24/7 shifts and relocation."
          ]);
        }
      },
      experience: {
        d: "career timeline",
        run: function () {
          line("Sep 2025 to now   CCTV Security Officer, Tesco, Sunderland", "hi");
          line("                  Real-time monitoring, escalation, evidence packages.");
          line("Aug 2022 to 2024  Cybersecurity & IT Risk Analyst, Fidelity Bank Plc", "hi");
          lines([
            "                  43% lower mean time to respond",
            "                  35% more efficient incident response",
            "                  25% fewer repeat incidents",
            "                  Zero ISO 27001 / PCI DSS audit findings"
          ]);
        }
      },
      education: {
        d: "degrees",
        run: function () {
          lines([
            "2024 to 2025  MSc Cybersecurity (Distinction), University of Sunderland",
            "2014 to 2019  BEng Mechanical Engineering, Landmark University"
          ]);
        }
      },
      certs: {
        d: "certifications",
        run: function () {
          lines([
            "[ok] CompTIA Security+",
            "[ok] CompTIA Network+",
            "[ok] CompTIA A+",
            "[ok] TryHackMe SAL1",
            "[ok] ISC2 Certified in Cybersecurity",
            "[ok] ISO 27001 Lead Implementer"
          ], "ok");
        }
      },
      skills: {
        d: "tooling by area",
        run: function () {
          line("detection & response", "hi");
          line("  Sentinel, Defender for Endpoint / XDR, CrowdStrike Falcon, QRadar, Rapid7, KQL");
          line("risk & compliance", "hi");
          line("  Risk management, technical reporting, ISO 27001, PCI DSS, NIST CSF, GDPR");
          line("controls & platforms", "hi");
          line("  IBM Guardium (DAM), Thycotic / BeyondTrust (PAM), Tripwire (FIM), vSphere, GPO, SCCM");
        }
      },
      contact: {
        d: "how to reach me",
        run: function () {
          linkLine("email     " + EMAIL, "mailto:" + EMAIL);
          linkLine("phone     +44 7392 982752", "tel:+447392982752");
          linkLine("linkedin  favour-opara", LINKS.linkedin);
          linkLine("github    favourOpara", LINKS.github);
        }
      },
      email: {
        d: "copy my email address",
        run: function () { copy(EMAIL, "Copied " + EMAIL + " to the clipboard."); }
      },
      cv: {
        d: "save this CV as a PDF",
        run: function () {
          close();
          setTimeout(function () { window.print(); }, 120);
        }
      },
      ls: {
        d: "list sections",
        run: function () {
          line("about  soc  lab  risk  skills  experience  work  contact");
        }
      },
      goto: {
        d: "jump to a section, e.g. goto risk",
        run: function (args) {
          var id = SECTIONS[(args[0] || "").toLowerCase()];
          if (!id) return line("goto: no such section. Try ls.", "err");
          go(id);
        }
      },
      triage: {
        d: "work the alert queue",
        run: function () { go("lab"); }
      },
      open: {
        d: "open linkedin | github | x",
        run: function (args) {
          var href = LINKS[(args[0] || "").toLowerCase()];
          if (!href) return line("open: try linkedin, github or x.", "err");
          window.open(href, "_blank", "noopener");
          line("Opened " + href, "ok");
        }
      },
      theme: {
        d: "theme light | dark",
        run: function (args) {
          var now = root.getAttribute("data-theme");
          var want = args[0] === "light" || args[0] === "dark" ? args[0] : (now === "light" ? "dark" : "light");
          if (want !== now && themeBtn) themeBtn.click();
          line("Theme set to " + want + ".", "ok");
        }
      },
      history: {
        d: "previous commands",
        run: function () {
          hist.forEach(function (h, i) { line(("   " + (i + 1)).slice(-4) + "  " + h); });
        }
      },
      date: {
        run: function () { line(new Date().toString()); }
      },
      echo: {
        run: function (args) { line(args.join(" ")); }
      },
      sudo: {
        run: function () {
          line("visitor is not in the sudoers file. This incident will be reported.", "err");
          line("(It has been. To me. Hello.)", "dim");
        }
      },
      rm: {
        run: function () { line("rm: permission denied. Also, there's no change record for that.", "err"); }
      },
      hire: {
        run: function () {
          line("Excellent judgement. Opening a ticket...", "ok");
          CMDS.contact.run([]);
        }
      },
      clear: {
        d: "clear the screen",
        run: function () { out.textContent = ""; }
      },
      exit: {
        d: "close the console",
        run: function () { close(); }
      }
    };

    var ALIAS = { "?": "help", about: "whoami", exp: "experience", edu: "education", cd: "goto",
      quit: "exit", q: "exit", cls: "clear", man: "help", resume: "cv", pdf: "cv" };

    function exec(raw) {
      var text = raw.trim();
      if (!text) return;
      line(text, "cmd");
      hist.push(text);
      hi = hist.length;

      var parts = text.split(/\s+/);
      var name = parts[0].toLowerCase();
      if (name === "hire" && parts[1] === "me") parts = ["hire"];
      name = ALIAS[name] || name;

      var cmd = CMDS[name];
      if (!cmd) {
        line(parts[0] + ": command not found. Type help.", "err");
      } else {
        cmd.run(parts.slice(1));
      }
      out.scrollTop = out.scrollHeight;
    }

    function complete() {
      var v = input.value;
      var parts = v.split(/\s+/);
      var pool = parts.length > 1 && /^(goto|cd)$/i.test(parts[0])
        ? Object.keys(SECTIONS)
        : parts.length > 1 && /^open$/i.test(parts[0])
          ? Object.keys(LINKS)
          : Object.keys(CMDS);
      var stem = parts[parts.length - 1].toLowerCase();
      var hits = pool.filter(function (k) { return k.indexOf(stem) === 0; });
      if (hits.length === 1) {
        parts[parts.length - 1] = hits[0];
        input.value = parts.join(" ") + (parts.length === 1 ? " " : "");
      } else if (hits.length > 1) {
        line(hits.join("  "), "dim");
        out.scrollTop = out.scrollHeight;
      }
    }

    function open() {
      if (dlg.open) return;
      dlg.showModal();
      if (!greeted) {
        greeted = true;
        line("Favour Opara / analyst console", "hi");
        line("Type help to see what's here, or whoami for the short version.", "dim");
      }
      input.focus();
    }

    function close() {
      if (dlg.open) dlg.close();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value;
      input.value = "";
      exec(v);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        complete();
      } else if (e.key === "ArrowUp") {
        if (!hist.length) return;
        e.preventDefault();
        hi = Math.max(0, hi - 1);
        input.value = hist[hi];
      } else if (e.key === "ArrowDown") {
        if (!hist.length) return;
        e.preventDefault();
        hi = Math.min(hist.length, hi + 1);
        input.value = hist[hi] || "";
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        out.textContent = "";
      }
    });

    // A click on the backdrop lands on the dialog element itself.
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) close();
    });

    var x = $(".term__x", dlg);
    if (x) x.addEventListener("click", close);

    openBtns.forEach(function (b) { b.addEventListener("click", open); });

    document.addEventListener("keydown", function (e) {
      if (dlg.open) return;
      var t = e.target;
      var typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (typing) return;
      if ((e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        open();
      }
    });
  })();

  /* ----------------------------------------------------- Save CV as PDF */

  $$("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () { window.print(); });
  });

  /* ---------------------------------------------------------- Copy buttons */

  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");

      function done() {
        btn.classList.add("is-done");
        setTimeout(function () { btn.classList.remove("is-done"); }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
        return;
      }

      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      document.body.removeChild(ta);
    });
  });

  /* -------------------------------------------------------- Current year */

  var yr = $("#year");
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
