/* global self, clients */
const VERSION = 'v1.0.0';
const APP_SHELL = ['/', '/index.html', '/app.bundle.js'];
const SHELL_CACHE = `shell-${VERSION}`;
const DATA_CACHE  = `data-${VERSION}`;
const IMG_CACHE   = `img-${VERSION}`;
const OUTBOX_STORE = 'outbox';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>![SHELL_CACHE,DATA_CACHE,IMG_CACHE].includes(k)).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

// fetch
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  // navigasi SPA
  if (req.mode === 'navigate') {
    event.respondWith((async()=>{
      try {
        const resp = await fetch(req);
        (await caches.open(SHELL_CACHE)).put('/', resp.clone());
        return resp;
      } catch {
        const cache = await caches.open(SHELL_CACHE);
        return (await cache.match('/')) || (await cache.match('/index.html'));
      }
    })());
    return;
  }

  // gambar: cache-first
  if (req.destination === 'image') {
    event.respondWith((async()=>{
      const cache = await caches.open(IMG_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const resp = await fetch(req);
        cache.put(req, resp.clone());
        return resp;
      } catch { return fetch(req); }
    })());
    return;
  }

  // API stories: stale-while-revalidate
  if (/\/stories(\/.*)?$/.test(url.pathname)) {
    event.respondWith((async()=>{
      const cache = await caches.open(DATA_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then(resp=>{ cache.put(req, resp.clone()); return resp; }).catch(()=>null);
      return cached || (await network) || new Response(JSON.stringify({ listStory: [] }), {headers:{'Content-Type':'application/json'}, status:200});
    })());
    return;
  }
});

// ===== IDB untuk background sync =====
const idbOpen = () => new Promise((resolve,reject)=>{
  const open = indexedDB.open('ceritapeta-db', 1);
  open.onupgradeneeded = ()=>{
    const db = open.result;
    if (!db.objectStoreNames.contains(OUTBOX_STORE)) db.createObjectStore(OUTBOX_STORE, {keyPath:'id', autoIncrement:true});
  };
  open.onsuccess = ()=>resolve(open.result);
  open.onerror = ()=>reject(open.error);
});
const idbTx = (db, store, mode) => db.transaction(store, mode).objectStore(store);

self.addEventListener('sync', (e)=>{
  if (e.tag === 'sync-stories') {
    e.waitUntil((async()=>{
      const db = await idbOpen();
      const store = idbTx(db, OUTBOX_STORE, 'readwrite');
      const rows = await (store.getAll ? store.getAll() : new Promise((res,rej)=>{
        const arr=[]; const cur=store.openCursor();
        cur.onsuccess = ev=>{ const c=ev.target.result; if(c){arr.push(c.value); c.continue();} else res(arr); };
        cur.onerror = ()=>rej(cur.error);
      }));
      for (const row of rows) {
        try {
          const form = new FormData();
          form.append('description', row.description);
          if (row.photoBlob) form.append('photo', row.photoBlob, row.photoName || 'photo.jpg');
          if (row.lat != null) form.append('lat', row.lat);
          if (row.lon != null) form.append('lon', row.lon);
          await fetch(row.endpoint, { method:'POST', headers: row.token?{Authorization:`Bearer ${row.token}`}:{}, body:form });
          store.delete(row.id);
        } catch {}
      }
      db.close();
    })());
  }
});

// ===== Push =====
self.addEventListener('push', (event)=>{
  let data = {};
  try { data = event.data?.json() || {}; } catch { data = {}; }
  const title = data.title || 'CeritaPeta';
  const body  = data.body  || 'Ada cerita baru!';
  const icon  = data.icon  || '/favicon.png';
  const actions = data.id ? [{ action: `open-${data.id}`, title: 'Lihat detail' }] : [];
  event.waitUntil(self.registration.showNotification(title, { body, icon, badge: icon, data, actions }));
});
self.addEventListener('notificationclick', (event)=>{
  event.notification.close();
  const id = event.notification.data?.id;
  event.waitUntil((async()=>{
    const all = await clients.matchAll({ type:'window', includeUncontrolled:true });
    const url = id ? `/#/detail/${id}` : '/#/';
    if (all.length) { const w = all[0]; w.focus(); w.navigate(url); }
    else { clients.openWindow(url); }
  })());
});
