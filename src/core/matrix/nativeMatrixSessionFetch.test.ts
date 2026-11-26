import { afterEach, describe, expect, it, vi } from 'vitest';
import { matrixSessionFetch } from './nativeMatrixSessionFetch';

describe('Matrix platform session transport', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends browser credentials and one tab instance only to the issued Matrix path', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    const lifetime = new AbortController();
    const request = matrixSessionFetch('/api/matrix', 'web-tab', lifetime.signal);
    const endpoint = new URL('/api/matrix/_matrix/client/v3/sync', window.location.href);
    await request(endpoint, { headers: { Accept: 'application/json' } });

    const [destination, init] = fetch.mock.calls[0];
    expect(destination).toEqual(endpoint);
    expect(init.credentials).toBe('same-origin');
    expect(init.redirect).toBe('error');
    expect(init.headers.get('X-Alkemio-Client')).toBe('web');
    expect(init.headers.get('X-Alkemio-Client-Instance')).toBe('web-tab');
    expect(init.headers.get('Accept')).toBe('application/json');
    expect(init.headers.has('Authorization')).toBe(false);

    await expect(request('https://untrusted.test/api/matrix/_matrix/client/v3/sync')).rejects.toThrow();
    await expect(request('/api/matrix-other/_matrix/client/v3/sync')).rejects.toThrow();
    await expect(request(new URL('?access_token=token', endpoint))).rejects.toThrow();
    await expect(request(endpoint, { headers: { Authorization: 'Bearer token' } })).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('keeps each SDK request tied to the platform session after response headers arrive', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    const lifetime = new AbortController();
    const sdk = new AbortController();
    const request = matrixSessionFetch('/api/matrix', 'web-tab', lifetime.signal);
    await request('/api/matrix/_matrix/client/v3/sync', { signal: sdk.signal });
    const signal = fetch.mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    lifetime.abort();
    expect(signal.aborted).toBe(true);
  });
});
