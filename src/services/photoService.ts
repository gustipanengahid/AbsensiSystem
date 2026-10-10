const DB_NAME = "AbsensiKaryawanDB";
const DB_VERSION = 1;
const STORE_PHOTOS = "photos";

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject("Failed to open IndexedDB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: "id" });
      }
    };
  });
};

export const photoService = {
  async savePhoto(id: string, dataUrl: string): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PHOTOS, "readwrite");
        const store = tx.objectStore(STORE_PHOTOS);
        const req = store.put({
          id,
          dataUrl,
          createdAt: new Date().toISOString(),
        });
        req.onsuccess = () => resolve();
        req.onerror = () => reject("Error saving photo");
      });
    } catch (e) {
      console.error(e);
      localStorage.setItem(`photo_${id}`, dataUrl);
    }
  },

  async getPhoto(id: string): Promise<string | null> {
    try {
      const db = await initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PHOTOS, "readonly");
        const store = tx.objectStore(STORE_PHOTOS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
        req.onerror = () => {
          const fallback = localStorage.getItem(`photo_${id}`);
          resolve(fallback);
        };
      });
    } catch (e) {
      return localStorage.getItem(`photo_${id}`);
    }
  },
};
