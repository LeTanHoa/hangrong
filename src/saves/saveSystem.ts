import { SaveSchema } from '../types/game';

const DB_NAME = 'HangRongVietNamDB';
const DB_VERSION = 1;
const STORE_NAME = 'saveData';
const SAVE_KEY = 'latest_save';
const LOCAL_STORAGE_KEY = 'hang_rong_save_data_v1';

export class SaveSystem {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  public static async saveGame(data: SaveSchema): Promise<boolean> {
    const serialized = JSON.stringify(data);

    // Keep the synchronous backup current before IndexedDB yields to the event loop.
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
      } catch {
        // localStorage may be full or blocked; IndexedDB remains the primary fallback.
      }
    }

    // 1. Try saving to IndexedDB
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(data, SAVE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Save transaction aborted'));
      });
    } catch {
      // Fallback to localStorage if IndexedDB fails or in private mode
    }

    return true;
  }

  public static async loadGame(): Promise<SaveSchema | null> {
    const candidates: SaveSchema[] = [];

    // 1. Try loading from IndexedDB
    try {
      const db = await this.getDB();
      const idbData = await new Promise<SaveSchema | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(SAVE_KEY);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });

      if (idbData && idbData.version >= 1) {
        candidates.push(idbData);
      }
    } catch {
      // Ignore and fallback to localStorage
    }

    // 2. Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SaveSchema;
          if (parsed && parsed.version >= 1) {
            candidates.push(parsed);
          }
        }
      } catch {
        // parse error
      }
    }

    return candidates.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0] || null;
  }

  public static async clearSave(): Promise<void> {
    // 1. Wipe all localStorage items related to the game
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.includes('hang_rong') || key.includes('HangRong') || key.includes('saveData'))) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // ignore
      }
    }

    // 2. Clear IndexedDB object store
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch {
      // ignore
    }

    // 3. Close active connection
    try {
      if (this.dbPromise) {
        const db = await this.dbPromise;
        db.close();
        this.dbPromise = null;
      }
    } catch {
      this.dbPromise = null;
    }

    // 4. Delete the entire database
    try {
      await new Promise<void>((resolve) => {
        if (!window.indexedDB) {
          resolve();
          return;
        }
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    } catch {
      // ignore
    }
  }

  public static exportSaveJSON(data: SaveSchema): string {
    return JSON.stringify(data, null, 2);
  }

  public static parseSaveJSON(jsonStr: string): SaveSchema | null {
    try {
      const parsed = JSON.parse(jsonStr) as SaveSchema;
      if (parsed && parsed.version >= 1 && parsed.player && parsed.inventory) {
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }
}

