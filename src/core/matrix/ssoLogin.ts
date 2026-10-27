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
  // A consumed token's exchange runs beside the poll loop below and is not
  // awaited by it. If the loop reaches its deadline first and returns `timeout`,
  // the caller goes on to mint and starts a client on the MINTED credential
  // while this exchange is still in flight — and its own `storeCredentials`
  // then overwrites the record that running client was built from, leaving the
  // live session and the stored credential on two different Synapse devices.
  // So the exchange gets a signal this function controls, and the deadline path
  // settles it rather than walking away from it.
  const exchangeAbort = new AbortController();
  signal?.addEventListener('abort', () => exchangeAbort.abort());
  const onMessage = (event: MessageEvent) => {
    if (tokenConsumed || signal?.aborted || event.origin !== platformOrigin) {
      return;
    }
    const loginToken = (event.data as { loginToken?: unknown } | null)?.loginToken;
    if (typeof loginToken !== 'string' || loginToken === '') {
      return;
    }
    tokenConsumed = true;
    void exchangeAndStore(homeserverUrl, loginToken, exchangeAbort.signal);
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
    // The deadline passed. One last read first: an exchange that completed
    // between the final poll and here has already persisted, and reporting that
    // as a timeout would mint a second credential for no reason.
    if (await loadActorCredentials(expectedLocalpart)) {
      return 'authenticated';
    }
    // Otherwise cancel it, so no write of its can land after the caller has
    // acted on this `timeout`. If it is already past its own write, it sees the
    // abort and clears what it stored (matrixCallback.ts:53-55) — so every
    // interleaving leaves the stored record agreeing with the running client,
    // which is the point. The cost is an orphaned Synapse device in that narrow
    // window: the known device-churn residual, and the lesser of the two.
    exchangeAbort.abort();
    return 'timeout';
  } finally {
    window.removeEventListener('message', onMessage);
    iframe.remove();
  }
};

export { attemptSilentSso };
