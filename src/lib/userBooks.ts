/**
 * Local User Bookshelf Store (IndexedDB)
 * Stores user-uploaded PDFs locally on the client's device using native IndexedDB.
 * Eliminates cloud storage limits, bandwidth costs, and server dependencies.
 */

export interface UserBookItem {
  id: string;
  name: string;
  fullPath: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  mimeType: string;
  blob?: Blob;
}

const DB_NAME = "novaslate_user_books_db";
const STORE_NAME = "books";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported in this environment"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalUserBook(file: File, customTitle?: string): Promise<UserBookItem> {
  const db = await openDB();
  const cleanTitle = (customTitle?.trim() || file.name.replace(/\.pdf$/i, "")).replace(/[^a-zA-Z0-9 _-]/g, "");
  const now = new Date().toISOString();
  const id = `user_book_${Date.now()}`;

  const item: UserBookItem = {
    id,
    name: `${cleanTitle}.pdf`,
    fullPath: `local/${id}/${cleanTitle}.pdf`,
    size: file.size,
    mimeType: file.type || "application/pdf",
    createdAt: now,
    updatedAt: now,
    blob: file,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

export async function getLocalUserBooks(): Promise<UserBookItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Could not read local user books from IndexedDB:", err);
    return [];
  }
}

export async function getLocalUserBookBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result?.blob || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function deleteLocalUserBook(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return false;
  }
}
