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
      // Only after the write committed: an index entry for a namespace that
      // does not exist would send `loadActorCredentials` down a dead match.
      writeNamespaceIndex([...readNamespaceIndex(), record.userId]);
      return true;
    } finally {
      db.close();
    }
  } catch {
    return false;
  }
};

// Every namespace lookup — resume, sign-out cleanup — runs through this
// listing, and `indexedDB.databases()` alone cannot carry it: Firefox has
// never implemented it. There the listing came back empty forever, so a
// stored credential could never be resumed (a fresh one was issued on every
// page load) and sign-out could never find one to delete. Both issuers hit
// it, because both write through this module.
//
// So the namespaces are also mirrored into localStorage, and the listing is
// the union of the two. The mirror is a second *record* of the same fact,
// not a second owner of it: the databases are still the only store, and a
// browser with `databases()` keeps working from it alone if the mirror is
// unavailable (private mode, blocked site data) or has not backfilled yet.
const NS_INDEX_KEY = `${DB_PREFIX}namespaces`;

const readNamespaceIndex = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(NS_INDEX_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const writeNamespaceIndex = (userIds: readonly string[]): void => {
  try {
    localStorage.setItem(NS_INDEX_KEY, JSON.stringify([...new Set(userIds)]));
  } catch {
    // Blocked or full storage. Never fatal: where `databases()` works the
    // listing is already complete without the mirror, and where it does not
    // the caller fails closed exactly as it did before this mirror existed.
  }
};

const listStoredUserIds = async (): Promise<string[]> => {
  let enumerated: string[] = [];
  try {
    enumerated = (await indexedDB.databases())
      .map(db => db.name ?? '')
      .filter(name => name.startsWith(DB_PREFIX))
      .map(name => name.slice(DB_PREFIX.length));
  } catch {
    // Unimplemented or refused — the mirror below is the whole listing.
  }
  return [...new Set([...enumerated, ...readNamespaceIndex()])];
};

/**
 * The stored record under the actor's own namespace prefix, or null.
 *
 * Every match is tried, not just the first: the mirror can outlive its
 * database (deleted by the browser, or by a `clearNamespace` that resolved
 * early because another tab still held the connection open), and one stale
 * entry must not mask a live record for the same actor on another homeserver.
 */
const loadActorCredentials = async (actorLocalpart: string): Promise<CredentialRecord | null> => {
  const prefix = `@${actorLocalpart.toLowerCase()}:`;
  for (const userId of (await listStoredUserIds()).filter(id => id.startsWith(prefix))) {
    const record = await loadCredentials(userId);
    if (record) {
      return record;
    }
  }
  return null;
};

const clearNamespace = async (userId: string): Promise<void> => {
  // Dropped first, and unconditionally: sign-out must not leave a namespace
  // listed when the delete is blocked by another tab or the index is the only
  // record of it. A dropped entry for a database that survives is recoverable
  // — `databases()` still lists it where that works, and the next store
  // re-adds it — whereas a kept entry for a deleted one is not.
  writeNamespaceIndex(readNamespaceIndex().filter(id => id !== userId));
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName(userId));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    // Another connection still has the database open. The deletion completes
    // once it closes; sign-out must not wait on another tab for that.
    request.onblocked = () => resolve();
  });
};

export { loadCredentials, loadActorCredentials, storeCredentials, clearNamespace, listStoredUserIds };
export type { CredentialRecord };
