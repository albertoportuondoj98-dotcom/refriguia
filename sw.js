// Guarda toda la app en el teléfono para que funcione sin internet.
// Al cambiar cualquier archivo, sube el número de versión: la app avisa "Hay una versión nueva".
const CACHE = 'refriguia-v3';
const ARCHIVOS = [
  './', './index.html', './styles.css', './app.js', './herramientas.js', './aprender.js', './bitacora.js', './gases.js', './iconos.js',
  './data.js', './pt.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];

self.addEventListener('install', e => {
  // cache: 'reload' evita guardar copias viejas del caché del navegador
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('refriguia-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// La app pide activar la versión nueva cuando el usuario toca "Actualizar"
self.addEventListener('message', e => { if (e.data === 'activar') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(r =>
      r || fetch(e.request).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())
    )
  );
});
