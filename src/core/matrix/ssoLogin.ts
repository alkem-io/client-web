import { getConfig } from './matrixConfig';
import { loadActorCredentials } from './storage';

type SilentSsoOptions = {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
  /** Aborting removes the iframe at once, so a callback still in flight never persists credentials. */
  readonly signal?: AbortSignal;
};

/**
 * - `authenticated` — the callback persisted fresh credentials for the expected user.
 * - `timeout` — Matrix is not configured for this environment, the attempt was
 *   aborted, or the round-trip stalled (no live Alkemio session); fail closed.
 */
type SilentSsoOutcome = 'authenticated' | 'timeout';

// Synapse has exactly one configured identity provider, so the SSO redirect
// needs no idp id: it goes straight to it.
const buildSsoUrl = (homeserverUrl: string): string => {
  const redirectUrl = `${window.location.origin}/matrix-callback`;
  return `${homeserverUrl}/_matrix/client/v3/login/sso/redirect?redirectUrl=${encodeURIComponent(redirectUrl)}`;
};

/**
 * Runs the whole SSO round-trip inside a hidden iframe so the visible page
 * never navigates. Works only while every hop is a redirect (live Alkemio
 * session and a whitelisted origin, so no interstitial renders); anything
 * else stalls invisibly until the timeout and fails closed. Success is
 * detected by the callback (loaded inside the iframe, same origin)
 * persisting fresh credentials to the shared IndexedDB namespace.
 */
const attemptSilentSso = async (
  expectedLocalpart: string,
  { timeoutMs = 20_000, pollIntervalMs = 400, signal }: SilentSsoOptions = {}
): Promise<SilentSsoOutcome> => {
  const { homeserverUrl } = getConfig();
  if (homeserverUrl === '' || signal?.aborted) {
    return 'timeout';
  }

  const deadline = Date.now() + timeoutMs;
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.src = buildSsoUrl(homeserverUrl);
  document.body.appendChild(iframe);
  // Removing the frame tears down its browsing context, callback included.
  signal?.addEventListener('abort', () => iframe.remove());

  try {
    while (Date.now() < deadline) {
      if (signal?.aborted) {
        return 'timeout';
      }
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      if (await loadActorCredentials(expectedLocalpart)) {
        return 'authenticated';
      }
    }
    return 'timeout';
  } finally {
    iframe.remove();
  }
};

export { attemptSilentSso };
