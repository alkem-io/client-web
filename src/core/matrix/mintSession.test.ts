import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { privateGraphQLEndpoint } from '@/main/constants/endpoints';
import { clearNamespace, loadActorCredentials, loadCredentials } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';
const LOCALPART = 'minted-actor';
const MINTED = {
  userId: `@${LOCALPART}:matrix.dev-alkem.io`,
  deviceId: 'DEVICE_MINT',
  accessToken: 'syt_minted_access',
};

// `@/main/env` snapshots window._env_ at import, so each test re-imports
// mintSession after setting it — the pattern ssoLogin.test.ts next door uses.
const setMatrixHomeserver = (url: string): void => {
  Object.defineProperty(window, '_env_', {
    value: { VITE_APP_MATRIX_HOMESERVER_URL: url },
    writable: true,
    configurable: true,
  });
};

const freshMint = async (homeserverUrl: string) => {
  setMatrixHomeserver(homeserverUrl);
  return (await import('./mintSession')).mintAndStore;
};

const respondWith = (body: unknown, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('mintAndStore', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    delete (window as unknown as Record<string, unknown>)._env_;
    await clearNamespace(MINTED.userId);
  });

  it('posts the argument-less mutation to the private endpoint and stores the minted credentials', async () => {
    const fetchSpy = respondWith({ data: { mintMatrixSession: MINTED } });
    const mintAndStore = await freshMint(HOMESERVER);

    const record = await mintAndStore();

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(privateGraphQLEndpoint);
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    const body = JSON.parse(init?.body as string);
    expect(body.query).toContain('mintMatrixSession');
    expect(body.variables).toBeUndefined();
    expect(record).toEqual({ ...MINTED, homeserverUrl: HOMESERVER });
    expect(await loadActorCredentials(LOCALPART)).toEqual(record);
  });

  it('stores nothing when the minted credentials are missing a field', async () => {
    const { accessToken: _omitted, ...incomplete } = MINTED;
    respondWith({ data: { mintMatrixSession: incomplete } });
    const mintAndStore = await freshMint(HOMESERVER);

    expect(await mintAndStore()).toBeNull();
    expect(await loadCredentials(MINTED.userId)).toBeNull();
  });

  it('stores nothing when the mutation returns errors or a failing HTTP status', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ errors: [{ message: 'FORBIDDEN' }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { mintMatrixSession: MINTED } }), { status: 403 }));
    const mintAndStore = await freshMint(HOMESERVER);

    expect(await mintAndStore()).toBeNull();
    expect(await mintAndStore()).toBeNull();
    expect(await loadCredentials(MINTED.userId)).toBeNull();
  });

  it('does not call the API when Matrix is not configured for this environment', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const mintAndStore = await freshMint('');

    expect(await mintAndStore()).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not call the API for an attempt that was already aborted', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const mintAndStore = await freshMint(HOMESERVER);
    const session = new AbortController();
    session.abort();

    expect(await mintAndStore(session.signal)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('leaves no record behind when the session aborts while the mint is in flight', async () => {
    const session = new AbortController();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      session.abort();
      return new Response(JSON.stringify({ data: { mintMatrixSession: MINTED } }), { status: 200 });
    });
    const mintAndStore = await freshMint(HOMESERVER);

    expect(await mintAndStore(session.signal)).toBeNull();
    expect(await loadCredentials(MINTED.userId)).toBeNull();
  });

  it('returns null when the credential write fails, rather than reporting an unstored record as persisted', async () => {
    setMatrixHomeserver(HOMESERVER);
    const storage = await import('./storage');
    vi.spyOn(storage, 'storeCredentials').mockResolvedValue(false);
    respondWith({ data: { mintMatrixSession: MINTED } });

    const { mintAndStore } = await import('./mintSession');

    expect(await mintAndStore()).toBeNull();
  });
});
