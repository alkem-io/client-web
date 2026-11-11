import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getActiveClient } from './activeClient';
import { stopActiveSession } from './activeSession';
import { establishSession } from './sessionController';
import { attemptSilentSso } from './ssoLogin';
import { clearNamespace, storeCredentials } from './storage';

// The real chat SDK runs here, against a scripted chat server; only the
// credential acquisition legs are replaced.
vi.mock('./ssoLogin', () => ({ attemptSilentSso: vi.fn() }));
vi.mock('./mintSession', () => ({ mintAndStore: vi.fn(async () => null) }));

const HOMESERVER = 'https://matrix.test-alkem.io';
const ACTOR = 'stopped-client-actor';
const USER_ID = `@${ACTOR}:matrix.test-alkem.io`;
const EXPIRED_TOKEN = 'syt_expired_access';
const FRESH_TOKEN = 'syt_fresh_access';

// Past the SDK's capabilities retry window (30 s plus up to 5 s of jitter).
const BEYOND_RETRY_WINDOW_MS = 40_000;

type Deferred = { promise: Promise<Response>; resolve: (response: Response) => void };

const deferred = (): Deferred => {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>(r => {
    resolve = r;
  });
  return { promise, resolve };
};

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const tokenRejected = (): Response =>
  json(401, { errcode: 'M_UNKNOWN_TOKEN', error: 'Access token has expired', soft_logout: true });

/** A response that never arrives, until the request is aborted (as the SDK does when it stops). */
const pendingUntilAborted = (signal: AbortSignal | null | undefined): Promise<Response> =>
  new Promise((_, reject) => {
    const abort = () => reject(new DOMException('Aborted', 'AbortError'));
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener('abort', abort);
  });

// How long the server holds a fresh sync long-poll before answering it.
const SYNC_HOLD_MS = 30_000;

/** A sync long-poll that answers with an empty batch after a while, as a quiet server does. */
const answerSyncLater = (signal: AbortSignal | null | undefined, batch: number): Promise<Response> =>
  Promise.race([
    new Promise<Response>(resolve => {
      setTimeout(() => resolve(json(200, { next_batch: `s${batch}` })), SYNC_HOLD_MS);
    }),
    pendingUntilAborted(signal),
  ]);

type SentRequest = { path: string; token: string | undefined };

type ExpiredTokenScript = {
  /** Answers the expired client's capabilities requests; held until the test releases it. */
  capabilities: Deferred[];
  /** Answers the expired client's sync requests; held until the test releases it. */
  sync: Deferred[];
};

/**
 * A chat server double. Requests made with the expired token are held so the
 * test decides when — and in which order — they fail; requests made with the
 * fresh token succeed; the fresh sync long-poll answers after a while.
 */
const scriptChatServer = () => {
  const sent: SentRequest[] = [];
  const expired: ExpiredTokenScript = { capabilities: [], sync: [] };

  const fetchStub = vi.fn(async (resource: URL | string, init?: RequestInit): Promise<Response> => {
    const url = new URL(resource.toString());
    const headers = new Headers(init?.headers);
    const token =
      headers.get('Authorization')?.replace(/^Bearer /, '') ?? url.searchParams.get('access_token') ?? undefined;
    const path = url.pathname;
    sent.push({ path, token });

    if (path.endsWith('/versions')) {
      return json(200, { versions: ['v1.11'], unstable_features: {} });
    }
    if (path.endsWith('/capabilities')) {
      if (token === EXPIRED_TOKEN) {
        const held = deferred();
        expired.capabilities.push(held);
        return held.promise;
      }
      return json(200, { capabilities: {} });
    }
    if (path.endsWith('/sync')) {
      if (token === EXPIRED_TOKEN) {
        const held = deferred();
        expired.sync.push(held);
        return Promise.race([held.promise, pendingUntilAborted(init?.signal)]);
      }
      return answerSyncLater(init?.signal, sent.length);
    }
    if (path.endsWith('/pushrules/')) {
      return json(200, { global: {} });
    }
    if (/\/user\/[^/]+\/filter(\/[^/]+)?$/.test(path)) {
      return json(200, { filter_id: 'filter-1' });
    }
    return json(404, { errcode: 'M_UNRECOGNIZED', error: 'Unrecognized request' });
  });

  return { sent, expired, fetchStub };
};

// Real time a step may take; a cold start on a slow runner needs more than a fast laptop.
const SETTLE_BUDGET_MS = 10_000;

/**
 * Lets pending promise chains and short timers run under fake timers. Each
 * round also yields one real macrotask, so work on the real clock (the
 * IndexedDB double's setImmediate) can finish; the budget is real time, not a
 * round count.
 */
const settle = async (until: () => boolean): Promise<void> => {
  const deadline = performance.now() + SETTLE_BUDGET_MS;
  while (!until() && performance.now() < deadline) {
    await vi.advanceTimersByTimeAsync(1);
    await new Promise<void>(resolve => setImmediate(resolve));
  }
  expect(until()).toBe(true);
};

describe('a chat client stopped by session recovery', () => {
  let server: ReturnType<typeof scriptChatServer>;

  beforeEach(async () => {
    // Timers only: the credential store's IndexedDB double schedules its work
    // with setImmediate, which must keep running for real.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
    server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    vi.mocked(attemptSilentSso).mockImplementation(async () => {
      await storeCredentials({
        userId: USER_ID,
        deviceId: 'DEV2',
        accessToken: FRESH_TOKEN,
        homeserverUrl: HOMESERVER,
      });
      return 'authenticated';
    });
    await storeCredentials({
      userId: USER_ID,
      deviceId: 'DEV1',
      accessToken: EXPIRED_TOKEN,
      homeserverUrl: HOMESERVER,
    });
  });

  afterEach(async () => {
    stopActiveSession();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    await clearNamespace(USER_ID);
  });

  const sentWith = (token: string, fromIndex = 0) => server.sent.slice(fromIndex).filter(r => r.token === token);
  const capabilitiesWith = (token: string, fromIndex = 0) =>
    sentWith(token, fromIndex).filter(r => r.path.endsWith('/capabilities'));

  const freshSyncs = () => sentWith(FRESH_TOKEN).filter(r => r.path.endsWith('/sync')).length;

  /** The fresh client is up once it has opened its sync long-poll. */
  const recovered = () => freshSyncs() > 0;

  it('sends no further request once its own rejected capabilities request triggered the recovery', async () => {
    void establishSession(ACTOR);
    await settle(() => server.expired.capabilities.length === 1);

    // Everything the stopped client sends from here on is measured.
    const atStop = server.sent.length;
    server.expired.capabilities[0].resolve(tokenRejected());
    await settle(recovered);
    const syncsAtRecovery = freshSyncs();

    await vi.advanceTimersByTimeAsync(BEYOND_RETRY_WINDOW_MS);

    expect(capabilitiesWith(EXPIRED_TOKEN, atStop)).toEqual([]);
    // Only the recovery's logout of the rejected device carries the expired token.
    expect(sentWith(EXPIRED_TOKEN, atStop)).toEqual([{ path: '/_matrix/client/v3/logout', token: EXPIRED_TOKEN }]);
    expect(getActiveClient()?.getAccessToken()).toBe(FRESH_TOKEN);
    expect(freshSyncs()).toBeGreaterThan(syncsAtRecovery);
  });

  it('sends no further request when its capabilities request was still in flight as another request triggered the recovery', async () => {
    void establishSession(ACTOR);
    await settle(() => server.expired.capabilities.length === 1 && server.expired.sync.length === 1);

    // The sync request is rejected first: recovery stops this client while its
    // capabilities request is still waiting for an answer.
    const atStop = server.sent.length;
    server.expired.sync[0].resolve(tokenRejected());
    await settle(recovered);
    const syncsAtRecovery = freshSyncs();

    // Only then does the in-flight capabilities request fail.
    server.expired.capabilities[0].resolve(tokenRejected());
    await vi.advanceTimersByTimeAsync(BEYOND_RETRY_WINDOW_MS);

    expect(capabilitiesWith(EXPIRED_TOKEN, atStop)).toEqual([]);
    // Only the recovery's logout of the rejected device carries the expired token.
    expect(sentWith(EXPIRED_TOKEN, atStop)).toEqual([{ path: '/_matrix/client/v3/logout', token: EXPIRED_TOKEN }]);
    expect(getActiveClient()?.getAccessToken()).toBe(FRESH_TOKEN);
    expect(freshSyncs()).toBeGreaterThan(syncsAtRecovery);
  });

  it('does not re-arm its refresh when its in-flight capabilities request succeeds after the recovery', async () => {
    void establishSession(ACTOR);
    await settle(() => server.expired.capabilities.length === 1 && server.expired.sync.length === 1);

    const atStop = server.sent.length;
    server.expired.sync[0].resolve(tokenRejected());
    await settle(recovered);
    const syncsAtRecovery = freshSyncs();

    server.expired.capabilities[0].resolve(json(200, { capabilities: {} }));
    // The refresh interval of a successful fetch is six hours.
    await vi.advanceTimersByTimeAsync(6 * 60 * 60 * 1000 + BEYOND_RETRY_WINDOW_MS);

    expect(capabilitiesWith(EXPIRED_TOKEN, atStop)).toEqual([]);
    // Only the recovery's logout of the rejected device carries the expired token.
    expect(sentWith(EXPIRED_TOKEN, atStop)).toEqual([{ path: '/_matrix/client/v3/logout', token: EXPIRED_TOKEN }]);
    expect(getActiveClient()?.getAccessToken()).toBe(FRESH_TOKEN);
    expect(freshSyncs()).toBeGreaterThan(syncsAtRecovery);
  });
});
