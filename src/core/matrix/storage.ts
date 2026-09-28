const DB_PREFIX = 'alkemio-matrix/';
const STORE_NAME = 'credentials';
const RECORD_KEY = 'session';

type CredentialRecord = {
  readonly userId: string;
  readonly deviceId: string;
  readonly accessToken: string;
  readonly homeserverUrl: string;
};

type StorageResult = {
  readonly available: boolean;
  readonly record: CredentialRecord | null;
};

const dbName = (userId: string): string => `${DB_PREFIX}${userId}`;

const openDb = (userId: string): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName(userId), 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const loadCredentials = async (userId: string): Promise<StorageResult> => {
  try {
    const db = await openDb(userId);
    try {
      return await new Promise<StorageResult>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(RECORD_KEY);
        request.onsuccess = () => resolve({ available: true, record: (request.result as CredentialRecord) ?? null });
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  } catch {
    return { available: false, record: null };
  }
};

const storeCredentials = async (record: CredentialRecord): Promise<boolean> => {
  try {
    const db = await openDb(record.userId);
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(record, RECORD_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
      });
      return true;
    } finally {
      db.close();
    }
  } catch {
    return false;
  }
};

// Every namespace lookup — resume, sign-out cleanup — runs through the
// database listing. A browser without it can store credentials but never find
// them again, so it must not be allowed to store any.
const canEnumerateNamespaces = (): boolean =>
  typeof indexedDB !== 'undefined' && typeof indexedDB.databases === 'function';

const findStoredUserId = async (actorLocalpart: string): Promise<string | null> => {
  try {
    if (!canEnumerateNamespaces()) {
      return null;
    }
    const databases = await indexedDB.databases();
    const prefix = `${DB_PREFIX}@${actorLocalpart.toLowerCase()}:`;
    const match = databases.find(db => db.name?.startsWith(prefix));
    return match?.name ? match.name.slice(DB_PREFIX.length) : null;
  } catch {
    return null;
  }
};

const listStoredUserIds = async (): Promise<string[]> => {
  try {
    if (!canEnumerateNamespaces()) {
      return [];
    }
    const databases = await indexedDB.databases();
    return databases
      .map(db => db.name ?? '')
      .filter(name => name.startsWith(DB_PREFIX))
      .map(name => name.slice(DB_PREFIX.length));
  } catch {
    return [];
  }
};

const clearNamespace = async (userId: string): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName(userId));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    // Another connection still has the database open. The deletion completes
    // once it closes; the caller does not need to wait for that itself.
    request.onblocked = () => resolve();
  });
};

export { loadCredentials, storeCredentials, clearNamespace, findStoredUserId, listStoredUserIds };
export type { CredentialRecord, StorageResult };
