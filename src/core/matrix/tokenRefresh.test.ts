import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type CredentialRecord, clearNamespace, loadCredentials, storeCredentials } from './storage';
import { renewTokens } from './tokenRefresh';

const USER_ID = '@alice:matrix.example.com';
const HOMESERVER = 'https://matrix.example.com';

const CURRENT: CredentialRecord = {
  userId: USER_ID,
  deviceId: 'DEVICE_ABC',
  accessToken: 'syt_old',
  homeserverUrl: HOMESERVER,
  refreshToken: 'syr_old',
  expiresAt: 1_700_000_000_000,
};

const REFRESHED = { access_token: 'syt_new', refresh_token: 'syr_new', expires_in_ms: 900_000 };

const jsonResponse = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), { status });

/** Runs each name's callbacks one after another, in request order. */
const stubLocks = () => {
  const tails = new Map<string, Promise<unknown>>();
  vi.stubGlobal('navigator', {
    locks: {
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

/** A fetch mock whose response the test releases by hand. */
const holdFetch = () => {
  let release: (response: Response) => void = () => undefined;
  const response = new Promise<Response>(resolve => {
    release = resolve;
  });
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(response);
  return { fetchSpy, release };
};

const waitForCall = (fetchSpy: ReturnType<typeof vi.spyOn>) => vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());

describe('renewTokens', () => {
  beforeEach(stubLocks);

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await clearNamespace(USER_ID);
  });

  it('concurrent refreshes of one token make a single homeserver call', async () => {
    await storeCredentials(CURRENT);
    const { fetchSpy, release } = holdFetch();

    const first = renewTokens(CURRENT);
    const second = renewTokens(CURRENT);
    await waitForCall(fetchSpy);
    release(jsonResponse(REFRESHED));

    const [a, b] = await Promise.all([first, second]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${HOMESERVER}/_matrix/client/v3/refresh`);
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('omit');
    expect(JSON.parse(init?.body as string)).toEqual({ refresh_token: 'syr_old' });

    expect(a).toEqual({ accessToken: 'syt_new', refreshToken: 'syr_new', expiresAt: expect.any(Number) });
    expect(b).toEqual(a);
    expect(await loadCredentials(USER_ID)).toEqual({ ...CURRENT, ...a });
  });

  it('adopts the pair another tab already rotated without calling the homeserver', async () => {
    const rotated = { accessToken: 'syt_other_tab', refreshToken: 'syr_other_tab', expiresAt: 1_700_000_900_000 };
    await storeCredentials({ ...CURRENT, ...rotated });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    expect(await renewTokens(CURRENT)).toEqual(rotated);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('a sign-out during the refresh leaves no record behind', async () => {
    await storeCredentials(CURRENT);
    const { fetchSpy, release } = holdFetch();

    const renewal = renewTokens(CURRENT);
    await waitForCall(fetchSpy);
    await clearNamespace(USER_ID);
    release(jsonResponse(REFRESHED));

    expect(await renewal).toBe(null);
    expect(await loadCredentials(USER_ID)).toBe(null);
  });

  it('refuses when the stored record is gone or belongs to another device', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    expect(await renewTokens(CURRENT)).toBe(null);

    const other = { ...CURRENT, deviceId: 'DEVICE_OTHER', accessToken: 'syt_other', refreshToken: 'syr_other' };
    await storeCredentials(other);
    expect(await renewTokens(CURRENT)).toBe(null);
    expect(await loadCredentials(USER_ID)).toEqual(other);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('treats network errors, 5xx, 429 and an unanswered request as transient', async () => {
    await storeCredentials(CURRENT);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(renewTokens(CURRENT)).rejects.toThrow();
    for (const status of [503, 429]) {
      fetchSpy.mockResolvedValueOnce(jsonResponse({}, status));
      await expect(renewTokens(CURRENT)).rejects.toThrow();
    }
    expect(await loadCredentials(USER_ID)).toEqual(CURRENT);

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    let sent: () => void = () => undefined;
    const requestSent = new Promise<void>(resolve => {
      sent = resolve;
    });
    fetchSpy.mockImplementationOnce(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          sent();
          init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        })
    );
    const unanswered = renewTokens(CURRENT);
    const settled = vi.fn();
    unanswered.then(settled, settled);
    await requestSent;
    await vi.advanceTimersByTimeAsync(19_999);
    expect(settled).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await expect(unanswered).rejects.toThrow();
    vi.useRealTimers();
    expect(await loadCredentials(USER_ID)).toEqual(CURRENT);
  });

  it('treats a refused refresh token as a logout', async () => {
    await storeCredentials(CURRENT);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { refresh_token: _omitted, ...withoutRefreshToken } = REFRESHED;

    for (const response of [
      jsonResponse({ errcode: 'M_UNKNOWN_TOKEN' }, 401),
      jsonResponse({ errcode: 'M_FORBIDDEN' }, 403),
      jsonResponse(withoutRefreshToken),
    ]) {
      fetchSpy.mockResolvedValueOnce(response);
      expect(await renewTokens(CURRENT)).toBe(null);
    }
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(await loadCredentials(USER_ID)).toEqual(CURRENT);
  });
});
