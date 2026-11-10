import 'fake-indexeddb/auto';
import { createClient } from 'matrix-js-sdk';
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { isSessionEstablishing } from './activeClient';
import { rotateActiveSessionIfDue, stopActiveSession } from './activeSession';
import { runMatrixLogoutCleanup } from './logoutCleanup';
import { mintAndStore } from './mintSession';
import { establishSession, type MatrixClientLike } from './sessionController';
import { attemptSilentSso } from './ssoLogin';
import { type CredentialRecord, clearNamespace, loadCredentials, storeCredentials } from './storage';

vi.mock('matrix-js-sdk', () => ({ createClient: vi.fn() }));
vi.mock('./ssoLogin', () => ({ attemptSilentSso: vi.fn() }));
vi.mock('./mintSession', () => ({ mintAndStore: vi.fn() }));

const HOMESERVER = 'https://matrix.dev-alkem.io';
const HOUR = 3_600_000;

type CreateClientFn = (opts: {
  baseUrl: string;
  userId: string;
  deviceId: string;
  accessToken: string;
}) => MatrixClientLike;
const mockedCreateClient = createClient as unknown as MockedFunction<CreateClientFn>;
const mockedSilentSso = vi.mocked(attemptSilentSso);
const mockedMint = vi.mocked(mintAndStore);

const enterAppMode = (): void => {
  window.Capacitor = { isNativePlatform: () => true };
};

type FakeClient = MatrixClientLike & { emit: (event: string, state?: string) => void };

const makeClient = (): FakeClient => {
  const handlers = new Map<string, (state?: string) => void>();
  return {
    stopClient: vi.fn(),
    startClient: vi.fn(async () => {}),
    on: vi.fn((event: string, listener: (state?: string) => void) => handlers.set(event, listener)),
    emit: (event: string, state?: string) => handlers.get(event)?.(state),
  };
};

const TOKEN_REJECTED = 'Session.logged_out';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
};

describe('establishSession rotation', () => {
  const ACTOR = 'abc-123';
  const USER_ID = `@${ACTOR}:matrix.dev-alkem.io`;

  const seedRecord = (overrides: Partial<CredentialRecord> = {}) =>
    storeCredentials({
      userId: USER_ID,
      deviceId: 'DEV1',
      accessToken: 'syt_stored_access',
      homeserverUrl: HOMESERVER,
      ...overrides,
    });

  const seedDue = () => seedRecord({ issuedAt: Date.now() - 40 * HOUR });

  const freshRecord = (deviceId: string, accessToken: string): CredentialRecord => ({
    userId: USER_ID,
    deviceId,
    accessToken,
    homeserverUrl: HOMESERVER,
    issuedAt: Date.now(),
  });

  const storeFresh = async (deviceId = 'DEV2', accessToken = 'syt_new'): Promise<CredentialRecord> => {
    const record = freshRecord(deviceId, accessToken);
    await storeCredentials(record);
    return record;
  };

  // Each createClient call gets its own fake, so a test can tell the clients apart.
  const clients: FakeClient[] = [];
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clients.length = 0;
    mockedCreateClient.mockReset();
    mockedCreateClient.mockImplementation(() => {
      const client = makeClient();
      clients.push(client);
      return client;
    });
    mockedSilentSso.mockReset();
    mockedSilentSso.mockResolvedValue('timeout');
    mockedMint.mockReset();
    mockedMint.mockImplementation(() => storeFresh());
    fetchMock = vi.fn(() => Promise.resolve(new Response(null)));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(async () => {
    stopActiveSession();
    Reflect.deleteProperty(window, 'Capacitor');
    vi.unstubAllGlobals();
    await clearNamespace(USER_ID);
  });

  it('rotates a credential from 40 hours after issue, and not a minute before', async () => {
    await seedDue();
    await establishSession(ACTOR);

    await expect(rotateActiveSessionIfDue()).resolves.toBe(true);
    expect(mockedCreateClient).toHaveBeenCalledTimes(2);
    expect(mockedCreateClient.mock.calls[1][0].deviceId).toBe('DEV2');

    stopActiveSession();
    await clearNamespace(USER_ID);
    mockedCreateClient.mockClear();
    mockedMint.mockClear();
    mockedSilentSso.mockClear();

    await seedRecord({ issuedAt: Date.now() - 40 * HOUR + 60_000 });
    await establishSession(ACTOR);

    await expect(rotateActiveSessionIfDue()).resolves.toBe(false);
    expect(mockedMint).not.toHaveBeenCalled();
    expect(mockedSilentSso).not.toHaveBeenCalled();
    expect(mockedCreateClient).toHaveBeenCalledOnce();
  });

  it('rotates a credential stored without an issue time', async () => {
    await seedRecord();
    await establishSession(ACTOR);

    await expect(rotateActiveSessionIfDue()).resolves.toBe(true);
    expect(mockedCreateClient).toHaveBeenCalledTimes(2);
    expect(mockedCreateClient.mock.calls[1][0].deviceId).toBe('DEV2');
  });

  it('logs the old token out once, only after the new credential is stored', async () => {
    const seen: { url: string; init: RequestInit; storedDevice: Promise<string | undefined>; establishing: boolean }[] =
      [];
    fetchMock.mockImplementation((url: string, init: RequestInit) => {
      seen.push({
        url,
        init,
        storedDevice: loadCredentials(USER_ID).then(r => r?.deviceId),
        establishing: isSessionEstablishing(),
      });
      return new Promise(() => {});
    });
    await seedDue();
    await establishSession(ACTOR);

    await expect(rotateActiveSessionIfDue()).resolves.toBe(true);

    expect(mockedCreateClient.mock.calls[1][0].deviceId).toBe('DEV2');
    expect(seen).toHaveLength(1);
    expect(seen[0].url).toBe(`${HOMESERVER}/_matrix/client/v3/logout`);
    expect(seen[0].init.method).toBe('POST');
    expect((seen[0].init.headers as Record<string, string>).Authorization).toBe('Bearer syt_stored_access');
    await expect(seen[0].storedDevice).resolves.toBe('DEV2');
    expect(seen[0].establishing).toBe(true);
    expect(isSessionEstablishing()).toBe(false);
  });

  it('a failed acquisition keeps the old session running with its credential stored, and is not retried', async () => {
    mockedMint.mockResolvedValue(null);
    await seedDue();
    const seeded = await loadCredentials(USER_ID);
    await establishSession(ACTOR);

    await expect(rotateActiveSessionIfDue()).resolves.toBe(true);

    expect(mockedCreateClient).toHaveBeenCalledOnce();
    expect(clients[0].stopClient).not.toHaveBeenCalled();
    expect(await loadCredentials(USER_ID)).toEqual(seeded);
    expect(fetchMock).not.toHaveBeenCalled();

    mockedMint.mockClear();
    await expect(rotateActiveSessionIfDue()).resolves.toBe(false);
    expect(mockedMint).not.toHaveBeenCalled();
  });

  it('a second request during a rotation waits for the same rotation', async () => {
    const minted = deferred<CredentialRecord | null>();
    mockedMint.mockImplementation(() => minted.promise);
    await seedDue();
    await establishSession(ACTOR);

    const first = rotateActiveSessionIfDue();
    await vi.waitFor(() => expect(mockedMint).toHaveBeenCalled());
    const second = rotateActiveSessionIfDue();
    minted.resolve(await storeFresh());

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
    expect(mockedMint).toHaveBeenCalledOnce();
    expect(mockedSilentSso).toHaveBeenCalledOnce();
    expect(mockedCreateClient).toHaveBeenCalledTimes(2);
  });

  it('in the app, a rotation mints without silent SSO', async () => {
    enterAppMode();
    await seedDue();
    await establishSession(ACTOR);

    await expect(rotateActiveSessionIfDue()).resolves.toBe(true);
    expect(mockedSilentSso).not.toHaveBeenCalled();
    expect(mockedMint).toHaveBeenCalledOnce();
  });

  it('in a browser, a rotation starts on the device silent SSO returns, not the one it replaces', async () => {
    mockedSilentSso.mockImplementation(async (_localpart, opts) => {
      const r = await loadCredentials(USER_ID);
      if (r && r.deviceId !== opts?.replacing) {
        return 'authenticated';
      }
      await storeFresh();
      return 'authenticated';
    });
    await seedDue();
    await establishSession(ACTOR);

    await expect(rotateActiveSessionIfDue()).resolves.toBe(true);

    expect(mockedSilentSso).toHaveBeenCalledOnce();
    expect(mockedSilentSso.mock.calls[0][1]).toEqual(expect.objectContaining({ replacing: 'DEV1' }));
    expect(mockedMint).not.toHaveBeenCalled();
    expect(mockedCreateClient.mock.calls[1][0]).toEqual(
      expect.objectContaining({ deviceId: 'DEV2', accessToken: 'syt_new' })
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer syt_stored_access');
  });

  it('a credential another tab already replaced is taken over without acquiring one', async () => {
    const acquireDev3 = async () => {
      await storeFresh('DEV3', 'syt_third');
      return 'authenticated' as const;
    };
    mockedSilentSso.mockImplementation(acquireDev3);
    mockedMint.mockImplementation(() => storeFresh('DEV3', 'syt_third'));
    await seedDue();
    await establishSession(ACTOR);
    await storeFresh();

    await expect(rotateActiveSessionIfDue()).resolves.toBe(true);

    expect(mockedSilentSso).not.toHaveBeenCalled();
    expect(mockedMint).not.toHaveBeenCalled();
    expect(mockedCreateClient.mock.calls[1][0]).toEqual(
      expect.objectContaining({ deviceId: 'DEV2', accessToken: 'syt_new' })
    );
    expect((await loadCredentials(USER_ID))?.deviceId).toBe('DEV2');
  });

  it('a tab whose token another tab logged out resumes the stored credential without acquiring one', async () => {
    await seedRecord({ issuedAt: Date.now() });
    await establishSession(ACTOR);
    await storeFresh();

    clients[0].emit(TOKEN_REJECTED);

    await vi.waitFor(() => expect(mockedCreateClient).toHaveBeenCalledTimes(2));
    expect(mockedCreateClient.mock.calls[1][0]).toEqual(
      expect.objectContaining({ deviceId: 'DEV2', accessToken: 'syt_new' })
    );
    expect(mockedSilentSso).not.toHaveBeenCalled();
    expect(mockedMint).not.toHaveBeenCalled();
    expect((await loadCredentials(USER_ID))?.deviceId).toBe('DEV2');
  });

  it('a sign-out during rotation starts no new client', async () => {
    const minted = deferred<CredentialRecord | null>();
    mockedMint.mockImplementation(() => minted.promise);
    await seedDue();
    await establishSession(ACTOR);

    const rotated = rotateActiveSessionIfDue();
    await vi.waitFor(() => expect(mockedMint).toHaveBeenCalled());
    await runMatrixLogoutCleanup();
    minted.resolve(freshRecord('DEV2', 'syt_new'));

    await expect(rotated).resolves.toBe(true);
    expect(mockedCreateClient).toHaveBeenCalledOnce();
  });

  it('a rotation overtaken by recovery starts no client of its own', async () => {
    const mintA = deferred<CredentialRecord | null>();
    const mintB = deferred<CredentialRecord | null>();
    mockedMint.mockImplementationOnce(() => mintA.promise).mockImplementationOnce(() => mintB.promise);
    await seedRecord({ issuedAt: Date.now() - 49 * HOUR });
    await establishSession(ACTOR);

    const rotated = rotateActiveSessionIfDue();
    await vi.waitFor(() => expect(mockedMint).toHaveBeenCalledOnce());
    clients[0].emit(TOKEN_REJECTED);
    await vi.waitFor(() => expect(mockedMint).toHaveBeenCalledTimes(2));

    mintA.resolve(await storeFresh());
    await expect(rotated).resolves.toBe(true);
    mintB.resolve(await storeFresh('DEV3', 'syt_third'));

    await vi.waitFor(() => expect(mockedCreateClient).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(isSessionEstablishing()).toBe(false));
    expect(mockedCreateClient).toHaveBeenCalledTimes(2);
    expect(mockedCreateClient.mock.calls[1][0].deviceId).toBe('DEV3');
    expect(clients[0].stopClient).toHaveBeenCalled();
    expect(clients[1].stopClient).not.toHaveBeenCalled();
  });

  it('a rotation that fails after stopping the old client resolves without opening a call', async () => {
    await seedDue();
    await establishSession(ACTOR);
    mockedCreateClient.mockImplementationOnce(() => {
      throw new Error('client construction failed');
    });

    await expect(rotateActiveSessionIfDue()).resolves.toBe(true);
    expect(clients[0].stopClient).toHaveBeenCalled();
    expect(isSessionEstablishing()).toBe(false);
  });
});
