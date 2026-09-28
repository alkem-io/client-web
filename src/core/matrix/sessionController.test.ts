import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { establishSession, type MatrixClientLike, type MatrixSdkModule } from './sessionController';
import { clearNamespace, storeCredentials } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';

const makeSdkMock = () => {
  const client: MatrixClientLike = { stopClient: vi.fn() };
  const createClient = vi.fn((_opts: Parameters<MatrixSdkModule['createClient']>[0]) => client);
  const sdk: MatrixSdkModule = { createClient };
  return { sdk, client, createClient };
};

describe('establishSession', () => {
  const ACTOR = 'abc-123';
  const USER_ID = `@${ACTOR}:matrix.dev-alkem.io`;

  const seedRecord = (overrides: Partial<Parameters<typeof storeCredentials>[0]> = {}) =>
    storeCredentials({
      userId: USER_ID,
      deviceId: 'DEV1',
      accessToken: 'syt_stored_access',
      homeserverUrl: HOMESERVER,
      ...overrides,
    });

  afterEach(async () => {
    vi.restoreAllMocks();
    await clearNamespace(USER_ID);
  });

  it('resumes from a valid stored record without any SSO round-trip', async () => {
    await seedRecord();
    const { sdk, createClient } = makeSdkMock();
    const silentSso = vi.fn(async () => 'timeout' as const);

    await establishSession(ACTOR, { loadSdk: async () => sdk, silentSso });

    expect(silentSso).not.toHaveBeenCalled();
    expect(createClient).toHaveBeenCalledOnce();
    const opts = createClient.mock.calls[0][0];
    expect(opts.baseUrl).toBe(HOMESERVER);
    expect(opts.userId).toBe(USER_ID);
    expect(opts.deviceId).toBe('DEV1');
    expect(opts.accessToken).toBe('syt_stored_access');
  });

  it('attempts one silent SSO when no stored record exists, and creates the client from the fresh credentials', async () => {
    const silentSso = vi.fn(async () => {
      await seedRecord();
      return 'authenticated' as const;
    });
    const { sdk, createClient } = makeSdkMock();

    await establishSession(ACTOR, { loadSdk: async () => sdk, silentSso });

    expect(silentSso).toHaveBeenCalledOnce();
    expect(createClient).toHaveBeenCalledOnce();
    expect(createClient.mock.calls[0][0].accessToken).toBe('syt_stored_access');
  });

  it('does not create a client when silent SSO fails, and stop() is still safe to call', async () => {
    const silentSso = vi.fn(async () => 'timeout' as const);
    const loadSdk = vi.fn();

    const handle = await establishSession('actor-without-record', { silentSso, loadSdk });

    expect(silentSso).toHaveBeenCalledOnce();
    expect(loadSdk).not.toHaveBeenCalled();
    expect(() => handle.stop()).not.toThrow();
  });

  it('resolves without throwing when silent SSO rejects', async () => {
    const silentSso = vi.fn(async () => {
      throw new Error('network down');
    });

    await expect(establishSession('actor-without-record', { silentSso })).resolves.toBeDefined();
  });

  it('stop() stops the active client', async () => {
    await seedRecord();
    const { sdk, client } = makeSdkMock();

    const handle = await establishSession(ACTOR, {
      loadSdk: async () => sdk,
      silentSso: vi.fn(async () => 'timeout' as const),
    });
    handle.stop();

    expect(client.stopClient).toHaveBeenCalled();
  });

  it('an aborted signal stops establishment before a client is created', async () => {
    let ssoSignal: AbortSignal | undefined;
    const silentSso = vi.fn(async (_localpart: string, signal: AbortSignal) => {
      ssoSignal = signal;
      await new Promise<void>(resolve => signal.addEventListener('abort', () => resolve()));
      await seedRecord();
      return 'authenticated' as const;
    });
    const { sdk, createClient } = makeSdkMock();
    const session = new AbortController();

    const pending = establishSession(ACTOR, { loadSdk: async () => sdk, silentSso, signal: session.signal });
    await vi.waitFor(() => {
      expect(ssoSignal).toBeDefined();
    });
    session.abort();

    await pending;
    expect(ssoSignal?.aborted).toBe(true);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('stopping via the Alkemio sign-out hook aborts an in-flight silent SSO', async () => {
    let signal: AbortSignal | undefined;
    let finishSso: (() => void) | undefined;
    const silentSso = vi.fn(async (_localpart: string, s: AbortSignal) => {
      signal = s;
      await new Promise<void>(resolve => (finishSso = resolve));
      return 'timeout' as const;
    });

    const pending = establishSession(ACTOR, { loadSdk: vi.fn(), silentSso });
    await vi.waitFor(() => {
      expect(signal).toBeDefined();
    });

    const { stopActiveSession } = await import('./activeSession');
    stopActiveSession();
    expect(signal?.aborted).toBe(true);

    finishSso?.();
    await pending;
  });

  it('fails closed without creating a client when the browser cannot list IndexedDB databases', async () => {
    const original = indexedDB.databases;
    Object.defineProperty(indexedDB, 'databases', { value: undefined, configurable: true });
    try {
      const silentSso = vi.fn(async () => 'timeout' as const);
      const loadSdk = vi.fn();

      await establishSession(ACTOR, { silentSso, loadSdk });

      expect(silentSso).toHaveBeenCalledOnce();
      expect(loadSdk).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(indexedDB, 'databases', { value: original, configurable: true });
    }
  });
});
