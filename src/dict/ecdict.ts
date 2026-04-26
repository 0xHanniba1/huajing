import { DictEntry } from './types';

const DB_NAME = 'huajing-dict';
const STORE = 'entries';
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'word' });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror   = () => reject(r.error);
  });
  return dbPromise;
}

export async function _resetDB() {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
  await new Promise<void>((res, rej) => {
    const r = indexedDB.deleteDatabase(DB_NAME);
    r.onsuccess = () => res(); r.onerror = () => rej(r.error);
  });
}

export async function putEntry(e: DictEntry): Promise<void> {
  const db = await openDB();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ ...e, word: e.word.toLowerCase() });
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
}

export async function lookup(word: string): Promise<DictEntry | null> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(word.toLowerCase());
    req.onsuccess = () => res((req.result as DictEntry) || null);
    req.onerror   = () => rej(req.error);
  });
}

let bulkLoaded = false;

export async function ensureLoaded(getURL: (path: string) => string): Promise<void> {
  if (bulkLoaded) return;
  const resp = await fetch(getURL('ecdict.lemma.json.gz'));
  const buf = await resp.arrayBuffer();
  const ds = new DecompressionStream('gzip');
  const stream = new Response(buf).body!.pipeThrough(ds);
  const text = await new Response(stream).text();
  const map = JSON.parse(text) as Record<string, { w: string; ipa: string; trans: string; pos?: string; tag?: string }>;
  const db = await openDB();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    for (const w of Object.keys(map)) {
      const r = map[w]!;
      const defs = r.trans.split('\n').filter(Boolean).map((t) => ({ text: t }));
      store.put({ word: w, ipa: r.ipa, pos: r.pos, defs, tags: r.tag ? r.tag.split(' ') : [] });
    }
    tx.oncomplete = () => { bulkLoaded = true; res(); };
    tx.onerror    = () => rej(tx.error);
  });
}
