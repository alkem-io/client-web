import { v4 as uuid } from 'uuid';

const tabKey = 'alkemio-matrix-client-instance';
const instancePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export async function withTabInstance(signal: AbortSignal, run: (id: string) => Promise<void>) {
  const stored = sessionStorage.getItem(tabKey);
  let candidate = stored && instancePattern.test(stored) ? stored : uuid();
  while (!signal.aborted) {
    const ran = await navigator.locks.request(
      `alkemio-matrix-instance:${candidate}`,
      { ifAvailable: true },
      async lock => {
        if (!lock || signal.aborted) return false;
        sessionStorage.setItem(tabKey, candidate);
        await run(candidate);
        return true;
      }
    );
    if (ran) return;
    candidate = uuid();
  }
}

export function sessionEndpoint(value: string): string {
  const url = new URL(value, window.location.origin);
  if (
    url.origin !== window.location.origin ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname.replace(/\/$/, '') !== '/api/matrix'
  ) {
    throw new Error('Invalid platform Matrix endpoint');
  }
  return `${url.origin}/api/matrix`;
}

export function matrixSessionFetch(base: string, instance: string, lifetime: AbortSignal): typeof fetch {
  const endpoint = sessionEndpoint(base);
  return (input, init) => {
    const request = input instanceof Request ? input : undefined;
    const url = new URL(request?.url ?? String(input), window.location.origin);
    const headers = new Headers(init?.headers ?? request?.headers);
    if (
      !url.href.startsWith(`${endpoint}/_matrix/`) ||
      url.searchParams.has('access_token') ||
      headers.has('Authorization')
    ) {
      return Promise.reject(new Error('Matrix request outside platform session'));
    }
    headers.set('X-Alkemio-Client', 'web');
    headers.set('X-Alkemio-Client-Instance', instance);
    const caller = init?.signal ?? request?.signal;
    return fetch(input, {
      ...init,
      headers,
      credentials: 'same-origin',
      redirect: 'error',
      signal: caller ? AbortSignal.any([caller, lifetime]) : lifetime,
    });
  };
}
