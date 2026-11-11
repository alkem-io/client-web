import 'fake-indexeddb/auto';
import { ClientEvent, HttpApiEvent, SyncState } from 'matrix-js-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getActiveClient } from './activeClient';
import { stopActiveSession } from './activeSession';
import { establishSession } from './sessionController';
import { clearNamespace, storeCredentials } from './storage';

// The real chat SDK runs here, against a scripted chat server; only the
// credential acquisition legs are replaced.
vi.mock('./ssoLogin', () => ({ attemptSilentSso: vi.fn(async () => 'timeout') }));
vi.mock('./mintSession', () => ({ mintAndStore: vi.fn(async () => null) }));

const HOMESERVER = 'https://matrix.test-alkem.io';
const ACTOR = 'renewal-actor';
const USER_ID = `@${ACTOR}:matrix.test-alkem.io`;
const OLD_TOKEN = 'syt_old_access';
const NEW_TOKEN = 'syt_new_access';
const LIFETIME_MS = 15 * 60 * 1000;
const SYNC_HOLD_MS = 30_000;

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const pendingUntilAborted = (signal: AbortSignal | null | undefined): Promise<Response> =>
  new Promise((_, reject) => {
    const abort = () => reject(new DOMException('Aborted', 'AbortError'));
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener('abort', abort);
  });

/** Runs each name's callbacks one after another, in request order. */
const stubLocks = () => {
  const tails = new Map<string, Promise<unknown>>();
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: {
      request: (name: string, callback: () => Promise<unknown>) => {
        const run = (tails.get(name) ?? Promise.resolve()).then(callback);
        tails.set(
          name,
          run.catch(() => undefined)
        );
        return run;
      },
    },
  });
};

type SentRequest = { path: string; token: string | undefined };

/**
 * A chat server double that expires access tokens like Synapse: a request
 * carrying a token past its lifetime is refused with M_UNKNOWN_TOKEN. Each
 * /refresh is answered from `refreshStatuses` in turn (a 200 issues NEW_TOKEN).
 */
const scriptChatServer = (oldTokenExpiresAt: number, refreshStatuses: number[]) => {
  const sent: SentRequest[] = [];
  const expiry = new Map([[OLD_TOKEN, oldTokenExpiresAt]]);

  const fetchStub = vi.fn(async (resource: URL | string, init?: RequestInit): Promise<Response> => {
    const url = new URL(resource.toString());
    const token = new Headers(init?.headers).get('Authorization')?.replace(/^Bearer /, '');
    const path = url.pathname;
    sent.push({ path, token });

    if (path.endsWith('/refresh')) {
      const status = refreshStatuses.shift() ?? 200;
      if (status !== 200) {
        return json(status, { errcode: 'M_UNKNOWN', error: 'Unavailable' });
      }
      expiry.set(NEW_TOKEN, Date.now() + LIFETIME_MS);
      return json(200, { access_token: NEW_TOKEN, refresh_token: 'syr_new', expires_in_ms: LIFETIME_MS });
    }
    if (token !== undefined && Date.now() >= (expiry.get(token) ?? 0)) {
      return json(401, { errcode: 'M_UNKNOWN_TOKEN', error: 'Access token has expired', soft_logout: true });
    }
    if (path.endsWith('/versions')) {
      return json(200, { versions: ['v1.11'], unstable_features: {} });
    }
    if (path.endsWith('/capabilities')) {
      return json(200, { capabilities: {} });
    }
    if (path.endsWith('/sync')) {
      if (!url.searchParams.has('since')) {
        return json(200, { next_batch: 's0' });
      }
      return Promise.race([
        new Promise<Response>(resolve => {
          setTimeout(() => resolve(json(200, { next_batch: `s${sent.length}` })), SYNC_HOLD_MS);
        }),
        pendingUntilAborted(init?.signal),
      ]);
    }
    if (path.endsWith('/pushrules/')) {
      return json(200, { global: {} });
    }
    if (/\/user\/[^/]+\/filter(\/[^/]+)?$/.test(path)) {
      return json(200, { filter_id: 'filter-1' });
    }
    return json(404, { errcode: 'M_UNRECOGNIZED', error: 'Unrecognized request' });
  });

  return { sent, fetchStub };
};

// Real time a step may take; a cold start on a slow runner needs more than a fast laptop.
const SETTLE_BUDGET_MS = 10_000;

/**
 * Lets pending promise chains and short timers run under fake timers. Each
 * round also yields one real macrotask, so work on the real clock (the
 * IndexedDB double's setImmediate) can finish.
 */
const settle = async (until: () => boolean): Promise<void> => {
  const deadline = performance.now() + SETTLE_BUDGET_MS;
  while (!until() && performance.now() < deadline) {
    await vi.advanceTimersByTimeAsync(1);
    await new Promise<void>(resolve => setImmediate(resolve));
  }
  expect(until()).toBe(true);
};

describe('in-place renewal of the chat access token', () => {
  beforeEach(() => {
    // Timers only: the credential store's IndexedDB double schedules its work
    // with setImmediate, which must keep running for real.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
    stubLocks();
  });

  afterEach(async () => {
    stopActiveSession();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, 'locks');
    await clearNamespace(USER_ID);
  });

  const seed = (expiresAt: number) =>
    storeCredentials({
      userId: USER_ID,
      deviceId: 'DEV1',
      accessToken: OLD_TOKEN,
      homeserverUrl: HOMESERVER,
      refreshToken: 'syr_old',
      expiresAt,
    });

  /** Starts the session once `isUp`, and records what its client reports from then on. */
  const establish = async (isUp: () => boolean) => {
    void establishSession(ACTOR);
    await settle(() => getActiveClient() !== null && isUp());
    const client = getActiveClient();
    const seen = { loggedOut: false, prepared: false };
    client?.on(HttpApiEvent.SessionLoggedOut, () => {
      seen.loggedOut = true;
    });
    client?.on(ClientEvent.Sync, state => {
      if (state === SyncState.Prepared) {
        seen.prepared = true;
      }
    });
    return { client, seen };
  };

  it('renews the access token before it expires and keeps the same client', async () => {
    const expiresAt = Date.now() + 90_000;
    await seed(expiresAt);
    const server = scriptChatServer(expiresAt, []);
    vi.stubGlobal('fetch', server.fetchStub);
    const refreshes = () => server.sent.filter(r => r.path.endsWith('/refresh')).length;
    const syncsWith = (token: string) => server.sent.filter(r => r.path.endsWith('/sync') && r.token === token);

    const { client, seen } = await establish(() => syncsWith(OLD_TOKEN).length > 1);
    expect(refreshes()).toBe(0);

    await vi.advanceTimersByTimeAsync(expiresAt - 60_000 - Date.now());
    await settle(() => client?.getAccessToken() === NEW_TOKEN);
    const afterRenewal = server.sent.length;
    await vi.advanceTimersByTimeAsync(3 * SYNC_HOLD_MS);
    await settle(() => server.sent.length > afterRenewal);

    expect(refreshes()).toBe(1);
    const later = server.sent.slice(afterRenewal).filter(r => r.token !== undefined);
    expect(later.length).toBeGreaterThan(0);
    expect(later.every(r => r.token === NEW_TOKEN)).toBe(true);
    expect(syncsWith(NEW_TOKEN).length).toBeGreaterThan(0);
    expect(getActiveClient()).toBe(client);
    expect(seen.loggedOut).toBe(false);
  });

  it('holds requests back while renewal fails and sends them with the renewed token', async () => {
    const expiresAt = Date.now() - 1_000;
    await seed(expiresAt);
    const server = scriptChatServer(expiresAt, [503, 503, 200]);
    vi.stubGlobal('fetch', server.fetchStub);
    const { client, seen } = await establish(() => true);

    // Long enough for the SDK's connection backoff to come round past two failed renewals.
    for (let round = 0; round < 60 && !seen.prepared; round++) {
      await vi.advanceTimersByTimeAsync(5_000);
      await settle(() => true);
    }

    expect(seen.prepared).toBe(true);
    expect(server.sent.filter(r => r.path.endsWith('/refresh')).length).toBe(3);
    expect(server.sent.filter(r => !r.path.endsWith('/refresh') && r.token === OLD_TOKEN)).toEqual([]);
    expect(server.sent.some(r => r.token === NEW_TOKEN)).toBe(true);
    expect(client?.getAccessToken()).toBe(NEW_TOKEN);
    expect(getActiveClient()).toBe(client);
    expect(seen.loggedOut).toBe(false);
  });

  it('logs the device out on the homeserver when its renewal is refused', async () => {
    const expiresAt = Date.now() + 90_000;
    await seed(expiresAt);
    const server = scriptChatServer(expiresAt, [403]);
    vi.stubGlobal('fetch', server.fetchStub);
    const { client } = await establish(() => true);

    await vi.advanceTimersByTimeAsync(expiresAt - 60_000 - Date.now());
    await settle(() => server.sent.some(r => r.path.endsWith('/logout')));

    expect(server.sent.filter(r => r.path.endsWith('/logout'))).toEqual([
      { path: '/_matrix/client/v3/logout', token: OLD_TOKEN },
    ]);
    expect(getActiveClient()).not.toBe(client);
  });
});
