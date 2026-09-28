const DB_PREFIX = 'alkemio-matrix/';
const STORE_NAME = 'credentials';
const RECORD_KEY = 'session';

type CredentialRecord = {
  readonly userId: string;
  readonly deviceId: string;
  readonly accessToken: string;
  readonly homeserverUrl: string;
};

const dbName = (userId: string): string => `${DB_PREFIX}${userId}`;

const openDb = (userId: string): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName(userId), 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const loadCredentials = async (userId: string): Promise<CredentialRecord | null> => {
  try {
    const db = await openDb(userId);
    try {
      return await new Promise<CredentialRecord | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(RECORD_KEY);
        request.onsuccess = () => resolve((request.result as CredentialRecord) ?? null);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  } catch {
    return null;
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
        tx.onabort = () => reject(tx.error);
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
// database listing. A browser without it can still store credentials, but
// never finds or clears them again.
const listStoredUserIds = async (): Promise<string[]> => {
  try {
    const databases = await indexedDB.databases();
    return databases
      .map(db => db.name ?? '')
      .filter(name => name.startsWith(DB_PREFIX))
      .map(name => name.slice(DB_PREFIX.length));
  } catch {
    return [];
  }
};

const findStoredUserId = async (actorLocalpart: string): Promise<string | null> =>
  (await listStoredUserIds()).find(id => id.startsWith(`@${actorLocalpart.toLowerCase()}:`)) ?? null;

const clearNamespace = async (userId: string): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName(userId));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export { loadCredentials, storeCredentials, clearNamespace, findStoredUserId, listStoredUserIds };
export type { CredentialRecord };
