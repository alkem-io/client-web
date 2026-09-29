import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type CredentialRecord, clearNamespace, listStoredUserIds, loadCredentials, storeCredentials } from './storage';

const USER_ID = '@alice:matrix.example.com';
const OTHER_USER_ID = '@bob:matrix.example.com';

const makeRecord = (overrides: Partial<CredentialRecord> = {}): CredentialRecord => ({
  userId: USER_ID,
  deviceId: 'DEVICE_ABC',
  accessToken: 'access-token-1',
  homeserverUrl: 'https://matrix.example.com',
  ...overrides,
});

describe('storage (IndexedDB)', () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    await clearNamespace(USER_ID);
    await clearNamespace(OTHER_USER_ID);
  });

  describe('CRUD round-trip', () => {
    it('stores and loads a credential record', async () => {
      const record = makeRecord();
      const stored = await storeCredentials(record);
      expect(stored).toBe(true);

      const result = await loadCredentials(USER_ID);
      expect(result).toEqual(record);
    });

    it('returns null when nothing is stored', async () => {
      const result = await loadCredentials(USER_ID);
      expect(result).toBe(null);
    });

    it('overwrites an existing record', async () => {
      await storeCredentials(makeRecord());
      const updated = makeRecord({ accessToken: 'access-token-2' });
      await storeCredentials(updated);

      const result = await loadCredentials(USER_ID);
      expect(result?.accessToken).toBe('access-token-2');
    });

    it('isolates per-user namespaces', async () => {
      await storeCredentials(makeRecord({ userId: USER_ID }));
      await storeCredentials(makeRecord({ userId: OTHER_USER_ID, deviceId: 'DEVICE_BOB' }));

      const aliceResult = await loadCredentials(USER_ID);
      const bobResult = await loadCredentials(OTHER_USER_ID);
      expect(aliceResult?.deviceId).toBe('DEVICE_ABC');
      expect(bobResult?.deviceId).toBe('DEVICE_BOB');
    });
  });

  describe('whole-namespace wipe', () => {
    it('resolves while another connection still holds the database open', async () => {
      await storeCredentials(makeRecord());
      const held = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(`alkemio-matrix/${USER_ID}`);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      try {
        await expect(clearNamespace(USER_ID)).resolves.toBeUndefined();
      } finally {
        held.close();
      }
    });

    it('leaves other users untouched', async () => {
      await storeCredentials(makeRecord({ userId: USER_ID }));
      await storeCredentials(makeRecord({ userId: OTHER_USER_ID, deviceId: 'DEVICE_BOB' }));

      await clearNamespace(USER_ID);

      const aliceResult = await loadCredentials(USER_ID);
      const bobResult = await loadCredentials(OTHER_USER_ID);
      expect(aliceResult).toBe(null);
      expect(bobResult?.deviceId).toBe('DEVICE_BOB');
    });
  });

  describe('listStoredUserIds', () => {
    it('lists every user with a matrix namespace', async () => {
      await storeCredentials(makeRecord({ userId: USER_ID }));
      await storeCredentials(makeRecord({ userId: OTHER_USER_ID }));

      const ids = await listStoredUserIds();

      expect(ids).toContain(USER_ID);
      expect(ids).toContain(OTHER_USER_ID);
    });

    it('returns an empty list when enumeration is unsupported', async () => {
      const original = indexedDB.databases;
      // @ts-expect-error — simulate a browser without indexedDB.databases()
      indexedDB.databases = undefined;
      try {
        expect(await listStoredUserIds()).toEqual([]);
      } finally {
        indexedDB.databases = original;
      }
    });
  });

  describe('storage-unavailable fallback', () => {
    it('returns null when IndexedDB throws', async () => {
      vi.spyOn(indexedDB, 'open').mockImplementation(() => {
        throw new Error('SecurityError: IndexedDB not available');
      });

      const result = await loadCredentials(USER_ID);
      expect(result).toBe(null);
    });

    it('returns false from storeCredentials when IndexedDB throws', async () => {
      vi.spyOn(indexedDB, 'open').mockImplementation(() => {
        throw new Error('SecurityError: IndexedDB not available');
      });

      const stored = await storeCredentials(makeRecord());
      expect(stored).toBe(false);
    });
  });
});
