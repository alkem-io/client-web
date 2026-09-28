import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerActiveSession, stopActiveSession } from './activeSession';
import { cleanupMatrixUser, runMatrixLogoutCleanup } from './logoutCleanup';
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

    expect((await loadCredentials(USER_ID)).record).toBe(null);
  });

  it('stops the registered session before touching storage', async () => {
    await seedRecord();
    const order: string[] = [];
    registerActiveSession(() => order.push('stop'));
    const databasesSpy = vi.spyOn(indexedDB, 'databases');

    await runMatrixLogoutCleanup();

    expect(order[0]).toBe('stop');
    expect(databasesSpy).toHaveBeenCalled();
  });

  it('when no session was ever established: no storage enumeration', async () => {
    const databasesSpy = vi.spyOn(indexedDB, 'databases');

    await runMatrixLogoutCleanup();

    expect(databasesSpy).not.toHaveBeenCalled();
  });

  it('never rejects, even when storage enumeration throws', async () => {
    registerActiveSession(() => {});
    vi.spyOn(indexedDB, 'databases').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    await expect(runMatrixLogoutCleanup()).resolves.toBeUndefined();
  });

  it('cleanupMatrixUser clears even when no credential record exists', async () => {
    await expect(cleanupMatrixUser(USER_ID)).resolves.toBeUndefined();
    expect((await loadCredentials(USER_ID)).record).toBe(null);
  });
});
