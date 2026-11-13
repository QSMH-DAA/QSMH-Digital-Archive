/* QSMH Digital Archive — Landing interactions */
(function () {
  "use strict";
  const CFG = window.QSMH_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const themeBtn = $("#themeBtn");
  function readTheme() { try { return localStorage.getItem("qsmh-theme"); } catch (e) { return null; } }
  function applyTheme(t) {
    if (t) root.dataset.theme = t; else delete root.dataset.theme;
    const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    themeBtn.innerHTML = dark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
  }
  applyTheme(readTheme());
  themeBtn.addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    try { localStorage.setItem("qsmh-theme", next); } catch (e) {}
    applyTheme(next);
  });

  /* ---------- org text ---------- */
  $("#orgNameTop").textContent = CFG.orgName || "";
  $("#orgNameFoot").textContent = [CFG.orgName, CFG.orgNameEn].filter(Boolean).join(" • ");
  $("#year").textContent = new Date().getFullYear() + 543;
  if (CFG.ownerDept) $("#ownerDept").textContent = CFG.ownerDept;

  /* ---------- login links ---------- */
  $$(".js-login").forEach(a => {
    if (CFG.appUrl && CFG.openMode === "newtab") { a.href = CFG.appUrl; a.target = "_blank"; a.rel = "noopener"; }
    else a.href = "app.html";
  });

  /* ---------- stats (count-up) ---------- */
  const statsEl = $("#stats");
  (CFG.stats || []).forEach(s => {
    const d = document.createElement("div");
    d.innerHTML = `<dt data-to="${Number(s.value) || 0}" data-suffix="${s.suffix || ""}">0${s.suffix || ""}</dt><dd></dd>`;
    d.querySelector("dd").textContent = s.label;
    statsEl.appendChild(d);
  });
  function countUp(el) {
    const to = +el.dataset.to, suf = el.dataset.suffix, t0 = performance.now(), dur = 1400;
    if (reduceMotion) { el.textContent = to + suf; return; }
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- carousels ---------- */
  function makeCarousel({ wrap, items, render, onChange, interval = 6000, dots, progress, prev, next, panel }) {
    if (!items.length) return;
    wrap.innerHTML = "";
    const slides = items.map((it, i) => { const s = render(it, i); s.classList.add("slide"); wrap.appendChild(s); return s; });
    let idx = 0, timer = null, start = 0, paused = false, raf = 0;
    const dotBtns = dots ? items.map((it, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-label", "ภาพที่ " + (i + 1));
      b.addEventListener("click", () => go(i, true)); dots.appendChild(b); return b;
    }) : [];
    function go(i, user) {
      slides[idx].classList.remove("is-active");
      idx = (i + slides.length) % slides.length;
      const s = slides[idx];
      // restart Ken Burns
      const img = s.querySelector("img"); if (img) { img.style.animation = "none"; void img.offsetWidth; img.style.animation = ""; }
      s.classList.add("is-active");
      dotBtns.forEach((b, j) => b.setAttribute("aria-selected", j === idx ? "true" : "false"));
      onChange && onChange(items[idx], idx);
      // preload next image for crisp transitions
      const nx = items[(idx + 1) % items.length]; if (nx && nx.src) { const p = new Image(); p.src = nx.src; }
      if (user) restart();
    }
    function restart() { start = performance.now(); }
    function loop(t) {
      if (!paused && slides.length > 1 && !reduceMotion) {
        const p = (t - start) / interval;
        if (progress) progress.style.width = Math.min(100, p * 100) + "%";
        if (p >= 1) { go(idx + 1); restart(); }
      } else if (paused) { start += t - (loop.last || t); }
      loop.last = t; raf = requestAnimationFrame(loop);
    }
    prev && prev.addEventListener("click", () => go(idx - 1, true));
    next && next.addEventListener("click", () => go(idx + 1, true));
    if (panel) {
      panel.addEventListener("mouseenter", () => paused = true);
      panel.addEventListener("mouseleave", () => paused = false);
      // swipe on touch
      let x0 = null;
      panel.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
      panel.addEventListener("touchend", e => {
        if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1), true);
      });
    }
    document.addEventListener("visibilitychange", () => { paused = document.hidden; });
    go(0); restart(); raf = requestAnimationFrame(loop);
  }

  function imgSlide(it, eager) {
    const d = document.createElement("div");
    const img = document.createElement("img");
    img.src = it.src; img.alt = it.title || ""; img.decoding = "async";
    img.loading = eager ? "eager" : "lazy";
    if (eager) img.fetchPriority = "high";
    d.appendChild(img); return d;
  }

  // RIGHT: activities
  const acts = (CFG.activities && CFG.activities.length) ? CFG.activities : (CFG.sampleActivities || []);
  const isSample = !(CFG.activities && CFG.activities.length);
  makeCarousel({
    wrap: $("#actSlides"), items: acts, interval: 6000,
    dots: $("#actDots"), progress: $("#actProgress"), prev: $("#actPrev"), next: $("#actNext"),
    panel: $(".panel-right"),
    render: (it, i) => {
      if (it.src) return imgSlide(it, i === 0);
      const d = document.createElement("div");
      d.className = "sample";
      const h = it.hue || 160;
      d.style.background = `radial-gradient(120% 80% at 20% 10%, hsl(${h + 30} 80% 60% / .9), transparent 60%),
                            linear-gradient(160deg, hsl(${h} 70% 32%), hsl(${h + 20} 75% 18%))`;
      d.innerHTML = `<i class="bi ${it.icon || "bi-image"}"></i>${isSample ? '<span class="sample-tag">ตัวอย่าง • ใส่รูปจริงใน config.js</span>' : ""}`;
      return d;
    },
    onChange: it => { $("#actTitle").textContent = it.title || ""; $("#actDate").innerHTML = it.date ? '<i class="bi bi-calendar-event"></i> ' + escapeHtml(it.date) : ""; $("#actDate").hidden = !it.date; }
  });

  // LEFT: innovations (only when real photos supplied)
  if (CFG.innovations && CFG.innovations.length) {
    const items = [{ src: "assets/img/env-innovation.svg", title: "นวัตกรรมการจัดการสิ่งแวดล้อม", tag: "Green & Clean Hospital" }].concat(CFG.innovations);
    makeCarousel({
      wrap: $("#innovSlides"), items, interval: 7000, panel: $(".panel-left"),
      render: (it, i) => imgSlide(it, i === 0),
      onChange: it => { $("#innovTitle").textContent = it.title || ""; $("#innovTag").textContent = it.tag || ""; }
    });
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  /* ---------- reveal on scroll ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$("dt[data-to]", e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: .12 }) : null;
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + "ms";
    io ? io.observe(el) : el.classList.add("in");
  });
  if (!io) $$("dt[data-to]").forEach(countUp);
  // hero: show immediately on load (don't wait for scroll)
  requestAnimationFrame(() => $$(".hero .reveal").forEach(el => {
    el.classList.add("in"); $$("dt[data-to]", el).forEach(countUp); io && io.unobserve(el);
  }));

  /* ---------- PWA install ---------- */
  let deferred = null;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const installBtns = [$("#installBtn"), $("#installBtn2")];
  if (isStandalone) installBtns.forEach(b => b.hidden = true);

  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; });
  window.addEventListener("appinstalled", () => { deferred = null; toast("ติดตั้งแอปเรียบร้อย 🎉 เปิดได้จากหน้าจอหลัก"); installBtns.forEach(b => b.hidden = true); });

  installBtns.forEach(b => b.addEventListener("click", async () => {
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") toast("กำลังติดตั้ง…");
      deferred = null; return;
    }
    showInstallHelp();
  }));

  function showInstallHelp() {
    const steps = isIOS
      ? ["เปิดหน้านี้ด้วย <b>Safari</b>", 'แตะปุ่ม <b>แชร์</b> <i class="bi bi-box-arrow-up"></i> ด้านล่าง', "เลือก <b>เพิ่มไปยังหน้าจอโฮม</b>", "แตะ <b>เพิ่ม</b> — ไอคอน QSMH จะอยู่บนหน้าจอ"]
      : /android/i.test(ua)
        ? ["เปิดหน้านี้ด้วย <b>Chrome</b>", 'แตะเมนู <b>⋮</b> มุมขวาบน', "เลือก <b>ติดตั้งแอป</b> หรือ <b>เพิ่มลงในหน้าจอหลัก</b>"]
        : ["เปิดหน้านี้ด้วย <b>Chrome</b> หรือ <b>Microsoft Edge</b>", 'คลิกไอคอน <i class="bi bi-window-plus"></i> ทางขวาของแถบที่อยู่', "กด <b>ติดตั้ง</b> — แอปจะอยู่ใน Start menu / Dock"];
    $("#installSteps").innerHTML = "<ol>" + steps.map(s => "<li>" + s + "</li>").join("") + "</ol>";
    const dlg = $("#installDialog");
    if (dlg.showModal) dlg.showModal(); else alert(steps.join("\n").replace(/<[^>]+>/g, ""));
  }

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 3500);
  }

  /* ---------- QR code ---------- */
  window.addEventListener("load", () => {
    if (!window.QRCode) return;
    const url = location.href.split("#")[0].replace(/index\.html$/, "");
    new QRCode($("#qr"), { text: url, width: 400, height: 400, colorDark: "#064e3b", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
  });

  /* ---------- service worker ---------- */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
