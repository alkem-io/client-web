import 'fake-indexeddb/auto';
import { createClient } from 'matrix-js-sdk';
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { stopActiveSession } from './activeSession';
import { establishSession, type MatrixClientLike } from './sessionController';
import { attemptSilentSso } from './ssoLogin';
import { clearNamespace, storeCredentials } from './storage';

vi.mock('matrix-js-sdk', () => ({ createClient: vi.fn() }));
vi.mock('./ssoLogin', () => ({ attemptSilentSso: vi.fn() }));

const HOMESERVER = 'https://matrix.dev-alkem.io';

// Cast to the same narrow shape sessionController.ts itself casts the dynamic
// `import('matrix-js-sdk')` to — the real ICreateClientOpts/MatrixClient types
// don't line up with the minimal MatrixClientLike test double.
type CreateClientFn = (opts: {
  baseUrl: string;
  userId: string;
  deviceId: string;
  accessToken: string;
}) => MatrixClientLike;
const mockedCreateClient = createClient as unknown as MockedFunction<CreateClientFn>;
const mockedSilentSso = vi.mocked(attemptSilentSso);

const makeClient = (): MatrixClientLike => ({ stopClient: vi.fn() });

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

  beforeEach(() => {
    mockedCreateClient.mockReset();
    mockedSilentSso.mockReset();
    mockedSilentSso.mockResolvedValue('timeout');
  });

  afterEach(async () => {
    stopActiveSession();
    await clearNamespace(USER_ID);
  });

  it('resumes from a valid stored record without any SSO round-trip', async () => {
    await seedRecord();
    const client = makeClient();
    mockedCreateClient.mockReturnValue(client);

    await establishSession(ACTOR);

    expect(mockedSilentSso).not.toHaveBeenCalled();
    expect(mockedCreateClient).toHaveBeenCalledOnce();
    const opts = mockedCreateClient.mock.calls[0][0];
    expect(opts.baseUrl).toBe(HOMESERVER);
    expect(opts.userId).toBe(USER_ID);
    expect(opts.deviceId).toBe('DEV1');
    expect(opts.accessToken).toBe('syt_stored_access');
  });

  it('attempts one silent SSO when no stored record exists, and creates the client from the fresh credentials', async () => {
    mockedSilentSso.mockImplementation(async () => {
      await seedRecord();
      return 'authenticated';
    });
    const client = makeClient();
    mockedCreateClient.mockReturnValue(client);

    await establishSession(ACTOR);

    expect(mockedSilentSso).toHaveBeenCalledOnce();
    expect(mockedCreateClient).toHaveBeenCalledOnce();
    expect(mockedCreateClient.mock.calls[0][0].accessToken).toBe('syt_stored_access');
  });

  it('does not create a client when silent SSO fails, and stop() is still safe to call', async () => {
    const handle = await establishSession('actor-without-record');

    expect(mockedSilentSso).toHaveBeenCalledOnce();
    expect(mockedCreateClient).not.toHaveBeenCalled();
    expect(() => handle.stop()).not.toThrow();
  });

  it('resolves without throwing when silent SSO rejects', async () => {
    mockedSilentSso.mockRejectedValue(new Error('network down'));

    await expect(establishSession('actor-without-record')).resolves.toBeDefined();
  });

  it('stop() stops the active client', async () => {
    await seedRecord();
    const client = makeClient();
    mockedCreateClient.mockReturnValue(client);

    const handle = await establishSession(ACTOR);
    handle.stop();

    expect(client.stopClient).toHaveBeenCalled();
  });

  it('an already-aborted signal stops the session at once', async () => {
    await seedRecord();
    const controller = new AbortController();
    controller.abort();

    await establishSession(ACTOR, { signal: controller.signal });

    expect(mockedCreateClient).not.toHaveBeenCalled();
    expect(stopActiveSession()).toBe(false);
  });

  it('an aborted signal stops establishment before a client is created', async () => {
    let capturedSignal: AbortSignal | undefined;
    mockedSilentSso.mockImplementation(
      (_localpart, options) =>
        new Promise(resolve => {
          capturedSignal = options?.signal;
          options?.signal?.addEventListener('abort', () => resolve('timeout'));
        })
    );
    const session = new AbortController();

    const pending = establishSession(ACTOR, { signal: session.signal });
    await vi.waitFor(() => {
      expect(capturedSignal).toBeDefined();
    });
    session.abort();

    await pending;
    expect(capturedSignal?.aborted).toBe(true);
    expect(mockedCreateClient).not.toHaveBeenCalled();
  });

  it('stopping via the Alkemio sign-out hook aborts an in-flight silent SSO', async () => {
    let capturedSignal: AbortSignal | undefined;
    mockedSilentSso.mockImplementation(
      (_localpart, options) =>
        new Promise(resolve => {
          capturedSignal = options?.signal;
          options?.signal?.addEventListener('abort', () => resolve('timeout'));
        })
    );

    const pending = establishSession(ACTOR);
    await vi.waitFor(() => {
      expect(capturedSignal).toBeDefined();
    });

    stopActiveSession();
    expect(capturedSignal?.aborted).toBe(true);

    await pending;
    expect(mockedCreateClient).not.toHaveBeenCalled();
  });

  it("never resumes with another actor's stored record", async () => {
    const otherUserId = '@2b3c4d5e-6f70-4a1b-8c9d-1234567890ab:matrix.dev-alkem.io';
    await storeCredentials({
      userId: otherUserId,
      deviceId: 'DEV_OTHER',
      accessToken: 'syt_other_access',
      homeserverUrl: HOMESERVER,
    });

    try {
      await establishSession('9f8e7d6c-5b4a-3210-9876-fedcba098765');

      expect(mockedSilentSso).toHaveBeenCalledOnce();
      expect(mockedCreateClient).not.toHaveBeenCalled();
    } finally {
      await clearNamespace(otherUserId);
    }
  });
});
