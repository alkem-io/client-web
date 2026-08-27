import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type CredentialRecord, clearNamespace, loadCredentials, rotateTokens, storeCredentials } from './storage';

const USER_ID = '@alice:matrix.example.com';
const OTHER_USER_ID = '@bob:matrix.example.com';

const makeRecord = (overrides: Partial<CredentialRecord> = {}): CredentialRecord => ({
  userId: USER_ID,
  deviceId: 'DEVICE_ABC',
  accessToken: 'access-token-1',
  refreshToken: 'refresh-token-1',
  expiresAt: Date.now() + 900_000,
  homeserverUrl: 'https://matrix.example.com',
  storedAt: Date.now(),
  ...overrides,
});

describe('storage (IndexedDB)', () => {
  afterEach(async () => {
    await clearNamespace(USER_ID);
    await clearNamespace(OTHER_USER_ID);
  });

  describe('CRUD round-trip', () => {
    it('stores and loads a credential record', async () => {
      const record = makeRecord();
      const stored = await storeCredentials(record);
      expect(stored).toBe(true);

      const result = await loadCredentials(USER_ID);
      expect(result.available).toBe(true);
      expect(result.record).toEqual(record);
    });

    it('returns null record when nothing is stored', async () => {
      const result = await loadCredentials(USER_ID);
      expect(result.available).toBe(true);
      expect(result.record).toBe(null);
    });

    it('overwrites an existing record', async () => {
      await storeCredentials(makeRecord());
      const updated = makeRecord({ accessToken: 'access-token-2', refreshToken: 'refresh-token-2' });
      await storeCredentials(updated);

      const result = await loadCredentials(USER_ID);
      expect(result.record?.accessToken).toBe('access-token-2');
      expect(result.record?.refreshToken).toBe('refresh-token-2');
    });

    it('isolates per-user namespaces', async () => {
      await storeCredentials(makeRecord({ userId: USER_ID }));
      await storeCredentials(makeRecord({ userId: OTHER_USER_ID, deviceId: 'DEVICE_BOB' }));

      const aliceResult = await loadCredentials(USER_ID);
      const bobResult = await loadCredentials(OTHER_USER_ID);
      expect(aliceResult.record?.deviceId).toBe('DEVICE_ABC');
      expect(bobResult.record?.deviceId).toBe('DEVICE_BOB');
    });
  });

  describe('atomic token rotation', () => {
    it('rotates access and refresh tokens atomically', async () => {
      await storeCredentials(makeRecord());

      const rotated = await rotateTokens(USER_ID, 'new-access', 'new-refresh', Date.now() + 600_000);
      expect(rotated).toBe(true);

      const result = await loadCredentials(USER_ID);
      expect(result.record?.accessToken).toBe('new-access');
      expect(result.record?.refreshToken).toBe('new-refresh');
      expect(result.record?.deviceId).toBe('DEVICE_ABC');
    });

    it('fails rotation when no existing record (aborted transaction)', async () => {
      const rotated = await rotateTokens(USER_ID, 'new-access', 'new-refresh', Date.now() + 600_000);
      expect(rotated).toBe(false);

      const result = await loadCredentials(USER_ID);
      expect(result.record).toBe(null);
    });
  });

  describe('whole-namespace wipe', () => {
    it('deletes the entire database for a user', async () => {
      await storeCredentials(makeRecord());
      await clearNamespace(USER_ID);

      const result = await loadCredentials(USER_ID);
      expect(result.record).toBe(null);
    });

    it('leaves other users untouched', async () => {
      await storeCredentials(makeRecord({ userId: USER_ID }));
      await storeCredentials(makeRecord({ userId: OTHER_USER_ID, deviceId: 'DEVICE_BOB' }));

      await clearNamespace(USER_ID);

      const aliceResult = await loadCredentials(USER_ID);
      const bobResult = await loadCredentials(OTHER_USER_ID);
      expect(aliceResult.record).toBe(null);
      expect(bobResult.record?.deviceId).toBe('DEVICE_BOB');
    });
  });

  describe('listStoredUserIds', () => {
    it('lists every user with a matrix namespace', async () => {
      await storeCredentials(makeRecord({ userId: USER_ID }));
      await storeCredentials(makeRecord({ userId: OTHER_USER_ID }));

      const { listStoredUserIds } = await import('./storage');
      const ids = await listStoredUserIds();

      expect(ids).toContain(USER_ID);
      expect(ids).toContain(OTHER_USER_ID);
    });

    it('returns an empty list when enumeration is unsupported', async () => {
      const original = indexedDB.databases;
      // @ts-expect-error — simulate a browser without indexedDB.databases()
      indexedDB.databases = undefined;
      try {
        const { listStoredUserIds } = await import('./storage');
        expect(await listStoredUserIds()).toEqual([]);
      } finally {
        indexedDB.databases = original;
      }
    });
  });

  describe('storage-unavailable fallback', () => {
    it('returns available:false when IndexedDB throws', async () => {
      const originalOpen = indexedDB.open.bind(indexedDB);
      vi.spyOn(indexedDB, 'open').mockImplementation(() => {
        throw new Error('SecurityError: IndexedDB not available');
      });

      const result = await loadCredentials(USER_ID);
      expect(result.available).toBe(false);
      expect(result.record).toBe(null);

      vi.mocked(indexedDB.open).mockImplementation(originalOpen);
    });

    it('returns false from storeCredentials when IndexedDB throws', async () => {
      const originalOpen = indexedDB.open.bind(indexedDB);
      vi.spyOn(indexedDB, 'open').mockImplementation(() => {
        throw new Error('SecurityError: IndexedDB not available');
      });

      const stored = await storeCredentials(makeRecord());
      expect(stored).toBe(false);

      vi.mocked(indexedDB.open).mockImplementation(originalOpen);
    });
  });
});
