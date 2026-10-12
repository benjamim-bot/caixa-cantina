// Guarda o app no aparelho para funcionar sem internet.
// Ao mudar qualquer arquivo do app, aumente a VERSAO para os aparelhos baixarem de novo.
const VERSAO = 'cantina-v2';
const ARQUIVOS = ['./', './index.html', './como-usar.html', './qr.png', './manifest.json', './icone-192.png', './icone-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

// Responde na hora com o que está guardado e, se tiver internet, atualiza a cópia em segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSAO).then(async cache => {
    const guardado = await cache.match(e.request, {ignoreSearch: true})
      || (e.request.mode === 'navigate' ? await cache.match('./index.html') : undefined);
    const daRede = fetch(e.request).then(resp => {
      if (resp.ok) cache.put(e.request, resp.clone());
      return resp;
    }).catch(() => guardado);
    return guardado || daRede;
  }));
});
