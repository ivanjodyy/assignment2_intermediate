import { openDB, withStore } from '../idb';

const DB_NAME = 'ceritapeta-db';
const DB_VER = 1;
const STORE_SAVED = 'saved';
const STORE_OUTBOX = 'outbox';

export async function getDB() {
  return openDB(DB_NAME, DB_VER, (db) => {
    if (!db.objectStoreNames.contains(STORE_SAVED))
      db.createObjectStore(STORE_SAVED, { keyPath: 'id' });
    if (!db.objectStoreNames.contains(STORE_OUTBOX))
      db.createObjectStore(STORE_OUTBOX, { keyPath: 'id', autoIncrement: true });
  });
}

// CRUD simpan lokal (opsional)
export async function saveStory(story) {
  const db = await getDB();
  await withStore(db, STORE_SAVED, 'readwrite', (s) => s.put(story));
  db.close();
}

export async function queueStory(payload) {
  const db = await getDB();
  const id = await withStore(db, STORE_OUTBOX, 'readwrite', (s) => s.add(payload));
  db.close();
  return id;
}
