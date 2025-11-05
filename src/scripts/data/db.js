const DB_NAME = 'ceritapeta-db';
const DB_VER  = 2;              
const SAVED   = 'saved';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SAVED)) {
        db.createObjectStore(SAVED, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function tx(storeName, mode = 'readonly') {
  return openDB().then(db => ({ db, store: db.transaction(storeName, mode).objectStore(storeName) }));
}

// CRUD
export async function addSaved(story) {
  // pastikan ada id (gunakan id story dari API)
  if (!story || !story.id) throw new Error('Story tanpa id');
  const { db, store } = await tx(SAVED, 'readwrite');
  await new Promise((res, rej) => { const r = store.put(story); r.onsuccess = res; r.onerror = () => rej(r.error); });
  db.close();
}
export async function getSaved(id) {
  const { db, store } = await tx(SAVED);
  const data = await new Promise((res, rej) => { const r = store.get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); });
  db.close();
  return data;
}
export async function getAllSaved() {
  const { db, store } = await tx(SAVED);
  const rows = await new Promise((res, rej) => {
    const out = [];
    const cur = store.openCursor();
    cur.onsuccess = e => {
      const c = e.target.result;
      if (c) { out.push(c.value); c.continue(); } else res(out);
    };
    cur.onerror = () => rej(cur.error);
  });
  db.close();
  return rows;
}
export async function updateSaved(id, changes) {
  const row = await getSaved(id);
  if (!row) throw new Error('Data tidak ditemukan');
  await addSaved({ ...row, ...changes });
}
export async function deleteSaved(id) {
  const { db, store } = await tx(SAVED, 'readwrite');
  await new Promise((res, rej) => { const r = store.delete(id); r.onsuccess = res; r.onerror = () => rej(r.error); });
  db.close();
}
