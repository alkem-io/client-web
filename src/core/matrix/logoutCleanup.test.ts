import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerActiveSession, stopActiveSession } from './activeSession';
import { runMatrixLogoutCleanup } from './logoutCleanup';
import { clearNamespace, loadCredentials, storeCredentials } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';
const USER_ID = '@logout-user:matrix.dev-alkem.io';

const seedRecord = () =>
  storeCredentials({
    userId: USER_ID,
    deviceId: 'DEV1',
    accessToken: 'syt_logout_access',
    homeserverUrl: HOMESERVER,
  });

describe('logoutCleanup', () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    stopActiveSession();
    await clearNamespace(USER_ID);
  });

  it("clears the current session's stored credentials on sign-out", async () => {
    await seedRecord();
    registerActiveSession(() => {});

    await runMatrixLogoutCleanup();

    expect(await loadCredentials(USER_ID)).toBe(null);
  });

  it('stops the registered session before touching storage', async () => {
    await seedRecord();
    const order: string[] = [];
    registerActiveSession(() => order.push('stop'));
    const original = indexedDB.databases.bind(indexedDB);
    const databasesSpy = vi.spyOn(indexedDB, 'databases').mockImplementation(() => {
      order.push('storage');
      return original();
    });

    await runMatrixLogoutCleanup();

    expect(order).toEqual(['stop', 'storage']);
    expect(databasesSpy).toHaveBeenCalled();
  });

  it('clears stored credentials even when no session is registered in this tab', async () => {
    await seedRecord();

    await runMatrixLogoutCleanup();

    expect(await loadCredentials(USER_ID)).toBe(null);
  });

  it('never rejects, even when storage enumeration throws', async () => {
    registerActiveSession(() => {});
    vi.spyOn(indexedDB, 'databases').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    await expect(runMatrixLogoutCleanup()).resolves.toBeUndefined();
  });
});
