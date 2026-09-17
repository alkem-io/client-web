const DB_PREFIX = 'alkemio-matrix/';
const STORE_NAME = 'credentials';
const RECORD_KEY = 'session';

// expiresAt for a token the server issued without expiry info (non-refreshable
// login): treated as never expiring locally — the server 401s if it dies.
// Kept within the maximum valid Date time value, since it is turned into one.
const NEVER_EXPIRES = 8_640_000_000_000_000;

// A lifetime the server omits means the token does not expire; a lifetime it
// states — zero included — is honored literally, so `0` is expired on receipt.
const expiresAtFrom = (expiresInMs: number | undefined, now: number = Date.now()): number =>
  typeof expiresInMs === 'number' && Number.isFinite(expiresInMs) ? now + expiresInMs : NEVER_EXPIRES;

interface CredentialRecord {
  readonly userId: string;
  readonly deviceId: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
  readonly homeserverUrl: string;
  readonly storedAt: number;
}

interface StorageResult {
  readonly available: boolean;
  readonly record: CredentialRecord | null;
}

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

const rotateTokens = async (
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<boolean> => {
  try {
    const db = await openDb(userId);
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getRequest = store.get(RECORD_KEY);

        getRequest.onsuccess = () => {
          const existing = getRequest.result as CredentialRecord | undefined;
          if (!existing) {
            tx.abort();
            return;
          }
          const updated: CredentialRecord = {
            ...existing,
            accessToken,
            refreshToken,
            expiresAt,
            storedAt: Date.now(),
          };
          store.put(updated, RECORD_KEY);
        };

        getRequest.onerror = () => reject(getRequest.error);
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

const findStoredUserId = async (actorLocalpart: string): Promise<string | null> => {
  try {
    if (typeof indexedDB.databases !== 'function') {
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
    if (typeof indexedDB.databases !== 'function') {
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

// How long a blocked delete waits for the other connection to close before the
// cleanup is reported as failed rather than left silently pending.
const BLOCKED_DELETE_TIMEOUT_MS = 2_000;

interface ClearOptions {
  readonly blockedTimeoutMs?: number;
}

const clearNamespace = async (userId: string, options: ClearOptions = {}): Promise<void> => {
  const blockedTimeoutMs = options.blockedTimeoutMs ?? BLOCKED_DELETE_TIMEOUT_MS;
  await new Promise<void>((resolve, reject) => {
    let blockedTimer: ReturnType<typeof setTimeout> | undefined;
    const request = indexedDB.deleteDatabase(dbName(userId));
    request.onsuccess = () => {
      clearTimeout(blockedTimer);
      resolve();
    };
    request.onerror = () => {
      clearTimeout(blockedTimer);
      reject(request.error);
    };
    // Blocked is not failure: another connection still holds the database open
    // and the deletion completes once it closes. Keep waiting for that — but
    // bounded, so a connection that never closes surfaces as a failure instead
    // of either a hang or a cleanup reported done while the tokens still exist.
    request.onblocked = () => {
      blockedTimer ??= setTimeout(
        () => reject(new Error('credential namespace deletion blocked by an open connection')),
        blockedTimeoutMs
      );
    };
  });
};

export {
  loadCredentials,
  storeCredentials,
  rotateTokens,
  clearNamespace,
  findStoredUserId,
  listStoredUserIds,
  NEVER_EXPIRES,
  expiresAtFrom,
};
export type { CredentialRecord, StorageResult };
