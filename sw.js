/* QSMH Digital Archive — Service Worker
 * - เปิดหน้าแรกได้แม้สัญญาณไม่ดี (offline shell)
 * - ไม่แคชระบบ Google Apps Script (ข้อมูลต้องสดใหม่เสมอ)
 * เมื่อแก้ไฟล์บนเว็บ ให้เปลี่ยนเลข VERSION เพื่อให้ผู้ใช้ได้ไฟล์ใหม่ */
const VERSION = "qsmh-v1";
const SHELL = [
  "./", "index.html", "app.html", "config.js", "manifest.webmanifest",
  "assets/css/landing.css", "assets/js/landing.js",
  "assets/img/env-innovation.svg",
  "assets/icons/icon.svg", "assets/icons/icon-192.png", "assets/icons/icon-512.png",
  "assets/icons/apple-touch-icon.png", "assets/icons/favicon-32.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // ไม่ยุ่งกับ Google Apps Script / Google login
  if (/(^|\.)google(usercontent)?\.com$/.test(url.hostname)) return;

  const sameOrigin = url.origin === self.location.origin;
  const isPage = req.mode === "navigate" || /\.(html|js|css|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/");

  if (sameOrigin && isPage) {
    // network-first: ได้เวอร์ชันล่าสุดเสมอ, offline ใช้แคช
    e.respondWith(
      fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
    );
    return;
  }

  // รูป / CSS / ฟอนต์: cache-first (เร็ว คมชัด ไม่โหลดซ้ำ)
  if (sameOrigin || /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/.test(url.hostname)) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
