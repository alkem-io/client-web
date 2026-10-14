import { exchangeAndStore } from './matrixCallback';
import { getConfig } from './matrixConfig';
import { loadActorCredentials } from './storage';

type SilentSsoOptions = {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
  /** Aborting removes the iframe at once, so a callback still in flight never persists credentials. */
  readonly signal?: AbortSignal;
  /** The origin serving the callback page; defaults to this page's origin. */
  readonly platformOrigin?: string;
};

/**
 * - `authenticated` — the callback persisted fresh credentials for the expected user.
 * - `timeout` — Matrix is not configured for this environment, the attempt was
 *   aborted, or the round-trip stalled (no live Alkemio session); fail closed.
 */
type SilentSsoOutcome = 'authenticated' | 'timeout';

// Synapse has exactly one configured identity provider, so the SSO redirect
// needs no idp id: it goes straight to it. The callback always lives on the
// platform origin, which Synapse's client whitelist covers; a page on another
// origin (an innovation hub) announces itself so the callback can hand it the
// token, since a cross-origin parent's origin cannot be read from the frame.
const buildSsoUrl = (homeserverUrl: string, platformOrigin: string): string => {
  const parent =
    window.location.origin === platformOrigin ? '' : `?parent=${encodeURIComponent(window.location.origin)}`;
  const redirectUrl = `${platformOrigin}/matrix-callback${parent}`;
  return `${homeserverUrl}/_matrix/client/v3/login/sso/redirect?redirectUrl=${encodeURIComponent(redirectUrl)}`;
};

/**
 * Runs the whole SSO round-trip inside a hidden iframe so the visible page
 * never navigates. Works only while every hop is a redirect (live Alkemio
 * session and a whitelisted origin, so no interstitial renders); anything
 * else stalls invisibly until the timeout and fails closed. Success is
 * detected by fresh credentials appearing in this origin's IndexedDB — put
 * there by the callback itself on the platform origin, or by the token
 * handoff below on any other origin.
 */
const attemptSilentSso = async (
  expectedLocalpart: string,
  { timeoutMs = 20_000, pollIntervalMs = 400, signal, platformOrigin = window.location.origin }: SilentSsoOptions = {}
): Promise<SilentSsoOutcome> => {
  const { homeserverUrl } = getConfig();
  if (homeserverUrl === '' || signal?.aborted) {
    return 'timeout';
  }

  const deadline = Date.now() + timeoutMs;
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.src = buildSsoUrl(homeserverUrl, platformOrigin);
  document.body.appendChild(iframe);
  // Removing the frame tears down its browsing context, callback included.
  signal?.addEventListener('abort', () => iframe.remove());

  // Off the platform origin the callback posts the token here instead of
  // exchanging it; the exchange then persists credentials in this origin's
  // storage, where the polling below finds them.
  let tokenConsumed = false;
  const onMessage = (event: MessageEvent) => {
    if (tokenConsumed || signal?.aborted || event.origin !== platformOrigin) {
      return;
    }
    const loginToken = (event.data as { loginToken?: unknown } | null)?.loginToken;
    if (typeof loginToken !== 'string' || loginToken === '') {
      return;
    }
    tokenConsumed = true;
    void exchangeAndStore(homeserverUrl, loginToken, signal);
  };
  window.addEventListener('message', onMessage);

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
    window.removeEventListener('message', onMessage);
    iframe.remove();
  }
};

export { attemptSilentSso };
