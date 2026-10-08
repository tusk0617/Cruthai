// Minimal service worker: makes the app installable and shows a friendly page when offline.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    '<meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;text-align:center;padding:4rem 1rem"><h2>Kamu sedang offline</h2><p>ClipPlan butuh koneksi internet untuk membuat dan menyimpan plan.</p>',
    { headers: { "Content-Type": "text/html; charset=utf-8" } })));
});
