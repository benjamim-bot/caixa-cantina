// Guarda o app no aparelho para funcionar sem internet.
// Ao mudar qualquer arquivo do app, aumente a VERSAO para os aparelhos baixarem de novo.
const VERSAO = 'cantina-v1';
const ARQUIVOS = ['./', './index.html', './manifest.json', './icone-192.png', './icone-512.png'];

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
  const ehPagina = e.request.mode === 'navigate';
  e.respondWith(caches.open(VERSAO).then(async cache => {
    const guardado = await cache.match(ehPagina ? './index.html' : e.request, {ignoreSearch: true});
    const daRede = fetch(e.request).then(resp => {
      if (resp.ok && new URL(e.request.url).origin === location.origin) cache.put(ehPagina ? './index.html' : e.request, resp.clone());
      return resp;
    }).catch(() => guardado);
    return guardado || daRede;
  }));
});
