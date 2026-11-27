import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Offline fallback and maintenance reload of `public/service-worker.js` (workspace#126).
 * The worker is shipped verbatim, so it is evaluated against stubs, as in serviceWorkerPush.test.ts.
 */
type SwEventListener = (event: unknown) => void;

type WindowClientStub = {
  url: string;
  navigate: ReturnType<typeof vi.fn>;
  postMessage: ReturnType<typeof vi.fn>;
};

const MAINTENANCE_CACHE = 'alkemio-maintenance';
const UNEXPECTED_PAGE = '/maintenance/unexpected.html';

let listeners: Record<string, SwEventListener>;
let fetchStub: ReturnType<typeof vi.fn>;
let skipWaiting: ReturnType<typeof vi.fn>;
let matchAll: ReturnType<typeof vi.fn>;
let navigatorStub: { onLine: boolean };
let put: ReturnType<typeof vi.fn>;
let cachesStub: { open: ReturnType<typeof vi.fn>; match: ReturnType<typeof vi.fn> };
let consoleError: ReturnType<typeof vi.spyOn>;

const loadServiceWorker = () => {
  listeners = {};
  fetchStub = vi.fn();
  skipWaiting = vi.fn();
  matchAll = vi.fn(() => Promise.resolve([] as WindowClientStub[]));
  navigatorStub = { onLine: true };
  put = vi.fn(() => Promise.resolve());
  cachesStub = {
    open: vi.fn(() => Promise.resolve({ put })),
    match: vi.fn(() => Promise.resolve(undefined)),
  };

  const selfStub = {
    addEventListener: (type: string, handler: SwEventListener) => {
      listeners[type] = handler;
    },
    skipWaiting,
    navigator: navigatorStub,
    location: { origin: 'https://alkem.io' },
    clients: { matchAll, claim: vi.fn() },
  };

  const source = readFileSync(resolve(process.cwd(), 'public/service-worker.js'), 'utf8');
  new Function('self', 'fetch', 'caches', source)(selfStub, fetchStub, cachesStub);
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

const fireFetch = (mode: string) => {
  const respondWith = vi.fn();
  listeners.fetch({ request: { mode, url: 'https://alkem.io/spaces' }, respondWith });
  return respondWith;
};

const respondedWith = (respondWith: ReturnType<typeof vi.fn>) => respondWith.mock.calls[0][0] as Promise<unknown>;

const fireInstall = () => {
  let pending: Promise<unknown> = Promise.resolve();
  listeners.install({
    waitUntil: (promise: Promise<unknown>) => {
      pending = promise;
    },
  });
  return pending;
};

const fireMessage = (type: string, version: string) => listeners.message({ data: { type, version } });

const windowClient = (url: string): WindowClientStub => ({
  url,
  navigate: vi.fn(() => Promise.resolve()),
  postMessage: vi.fn(),
});

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  loadServiceWorker();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('service worker fetch — failed navigation (US4)', () => {
  it('answers a network-rejected navigation with the stored unexpected page', async () => {
    const page = new Response('<html data-alkemio-maintenance></html>');
    fetchStub.mockRejectedValue(new TypeError('Failed to fetch'));
    cachesStub.match.mockResolvedValue(page);

    const respondWith = fireFetch('navigate');

    await expect(respondedWith(respondWith)).resolves.toBe(page);
    expect(cachesStub.match).toHaveBeenCalledWith(UNEXPECTED_PAGE, { cacheName: MAINTENANCE_CACHE });
  });

  it('lets the navigation fail when the browser is offline', async () => {
    navigatorStub.onLine = false;
    fetchStub.mockRejectedValue(new TypeError('Failed to fetch'));
    cachesStub.match.mockResolvedValue(new Response('page'));

    await expect(respondedWith(fireFetch('navigate'))).rejects.toThrow('Failed to fetch');
  });

  it('lets the navigation fail when nothing is stored', async () => {
    fetchStub.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(respondedWith(fireFetch('navigate'))).rejects.toThrow('Failed to fetch');
  });

  it('passes a 503 answer through unchanged', async () => {
    const unavailable = new Response('planned', { status: 503 });
    fetchStub.mockResolvedValue(unavailable);

    await expect(respondedWith(fireFetch('navigate'))).resolves.toBe(unavailable);
    expect(cachesStub.match).not.toHaveBeenCalled();
  });

  it('leaves non-navigation requests alone', () => {
    expect(fireFetch('cors')).not.toHaveBeenCalled();
  });
});

describe('service worker install — stores the unexpected page', () => {
  it('stores the page when the answer carries the maintenance marker', async () => {
    fetchStub.mockResolvedValue(new Response('<html data-alkemio-maintenance lang="en"></html>'));

    await fireInstall();

    expect(fetchStub).toHaveBeenCalledWith(UNEXPECTED_PAGE, { cache: 'reload' });
    expect(cachesStub.open).toHaveBeenCalledWith(MAINTENANCE_CACHE);
    expect(put).toHaveBeenCalledTimes(1);
    expect(put).toHaveBeenCalledWith(UNEXPECTED_PAGE, expect.any(Response));
  });

  it("does not store the app's index.html that an older web pod returns", async () => {
    fetchStub.mockResolvedValue(new Response('<html lang="en"><div id="root"></div></html>'));

    await fireInstall();

    expect(put).not.toHaveBeenCalled();
  });

  it('does not store a non-ok answer', async () => {
    fetchStub.mockResolvedValue(new Response('<html data-alkemio-maintenance></html>', { status: 404 }));

    await fireInstall();

    expect(put).not.toHaveBeenCalled();
  });

  it('still installs when the page cannot be fetched', async () => {
    fetchStub.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fireInstall()).resolves.toBeUndefined();
    expect(skipWaiting).toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });
});

describe('service worker messages', () => {
  it('never opens or writes the cache on a version message', async () => {
    fetchStub.mockResolvedValue({ status: 200, json: () => Promise.resolve({ version: '1.2.0' }) });

    fireMessage('CLIENT_VERSION', '1.1.0');
    fireMessage('CHECK_VERSION', '1.1.0');
    await flush();

    expect(cachesStub.open).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });
});

describe('service worker version check — planned maintenance (US5)', () => {
  it('reloads every controlled window to its own address on a 503', async () => {
    const json = vi.fn();
    fetchStub.mockResolvedValue({ status: 503, json });
    const spaces = windowClient('https://alkem.io/spaces');
    const home = windowClient('https://alkem.io/home');
    home.navigate.mockRejectedValue(new TypeError('not controlled'));
    matchAll.mockResolvedValue([spaces, home]);

    fireMessage('CHECK_VERSION', '1.1.0');
    await vi.waitFor(() => expect(home.navigate).toHaveBeenCalled());
    await flush();

    expect(matchAll).toHaveBeenCalledWith({ type: 'window' });
    expect(spaces.navigate).toHaveBeenCalledTimes(1);
    expect(spaces.navigate).toHaveBeenCalledWith('https://alkem.io/spaces');
    expect(home.navigate).toHaveBeenCalledTimes(1);
    expect(home.navigate).toHaveBeenCalledWith('https://alkem.io/home');
    expect(json).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('still announces a new minor version on a 200 and navigates nothing', async () => {
    fetchStub.mockResolvedValue({ status: 200, json: () => Promise.resolve({ version: '1.2.0' }) });
    const client = windowClient('https://alkem.io/spaces');
    matchAll.mockResolvedValue([client]);

    fireMessage('CHECK_VERSION', '1.1.0');
    await vi.waitFor(() => expect(client.postMessage).toHaveBeenCalled());

    expect(client.postMessage).toHaveBeenCalledWith({ type: 'NEW_VERSION_AVAILABLE', version: '1.2.0' });
    expect(client.navigate).not.toHaveBeenCalled();
  });
});
