const CACHE = 'medreconcile-v2';
const BASE = '/medreconcile';
const ASSETS = [BASE+'/', BASE+'/index.html', BASE+'/manifest.json', BASE+'/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.url.includes('audit-ai') || e.request.url.includes('firestore') || 
     e.request.url.includes('googleapis') || e.request.url.includes('firebase')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(()=>caches.match(BASE+'/index.html'))));
});
