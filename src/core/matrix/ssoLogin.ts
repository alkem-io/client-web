import { getConfig } from './matrixConfig';
import { findStoredUserId, loadCredentials } from './storage';

const CALLBACK_ROUTE = '/matrix-callback';
const PENDING_SSO_KEY = 'alkemio-matrix-sso-pending';

// Marks a silent SSO this tab started, so the callback can reject a token it
// never asked for.
type SsoFlowState = {
  readonly startedAt: number;
};

type SsoIdpResult = {
  readonly ok: boolean;
  readonly idpId?: string;
  readonly error?: string;
  /** True when the failure looks transient (network down, 5xx, rate limit) rather than a misconfiguration. */
  readonly unreachable?: boolean;
};

const discoverIdp = async (homeserverUrl: string, signal?: AbortSignal): Promise<SsoIdpResult> => {
  let response: Response;
  let body: { flows?: { type?: string; identity_providers?: { id?: string }[] }[] };
  try {
    response = await fetch(`${homeserverUrl}/_matrix/client/v3/login`, {
      credentials: 'omit',
      signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `login endpoint returned ${response.status}`,
        unreachable: response.status >= 500 || response.status === 429,
      };
    }

    body = (await response.json()) as typeof body;
  } catch {
    return { ok: false, error: 'login endpoint unreachable', unreachable: true };
  }

  const ssoFlow = body.flows?.find(f => f.type === 'm.login.sso');
  if (!ssoFlow) {
    return { ok: false, error: 'no m.login.sso flow advertised' };
  }

  const providers = ssoFlow.identity_providers ?? [];
  if (providers.length === 0) {
    return { ok: false, error: 'zero identity providers' };
  }
  if (providers.length > 1) {
    return { ok: false, error: `${providers.length} identity providers (expected exactly 1)` };
  }

  const idpId = providers[0].id;
  if (!idpId) {
    return { ok: false, error: 'identity provider has no id' };
  }

  return { ok: true, idpId };
};

const saveSsoFlowState = (): void => {
  const state: SsoFlowState = { startedAt: Date.now() };
  try {
    sessionStorage.setItem(PENDING_SSO_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — the callback will reject the token and the attempt times out
  }
};

const loadSsoFlowState = (): SsoFlowState | null => {
  try {
    const raw = sessionStorage.getItem(PENDING_SSO_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SsoFlowState;
  } catch {
    return null;
  }
};

const clearSsoFlowState = (): void => {
  try {
    sessionStorage.removeItem(PENDING_SSO_KEY);
  } catch {
    // Ignore
  }
};

const buildSsoUrl = (homeserverUrl: string, idpId: string): string => {
  const redirectUrl = `${window.location.origin}${CALLBACK_ROUTE}`;
  return (
    `${homeserverUrl}/_matrix/client/v3/login/sso/redirect/` +
    `${encodeURIComponent(idpId)}?redirectUrl=${encodeURIComponent(redirectUrl)}`
  );
};

type SilentSsoOptions = {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
  /** Aborting removes the iframe at once, so a callback still in flight never persists credentials. */
  readonly signal?: AbortSignal;
};

/**
 * - `authenticated` — the callback persisted fresh credentials for the expected user.
 * - `unreachable` — the homeserver could not be reached (or answered 5xx/429); worth retrying with backoff.
 * - `timeout` — the round-trip stalled (no live Alkemio session, or an interstitial rendered); fail closed.
 * - `unavailable` — flag off / not configured / SSO misconfigured / page not on the platform origin /
 *   aborted; fail closed, retrying cannot help.
 */
type SilentSsoOutcome = 'authenticated' | 'unreachable' | 'timeout' | 'unavailable';

/**
 * Runs the whole SSO round-trip inside a hidden iframe so the visible page
 * never navigates. Works only while every hop is a redirect (live Alkemio
 * session + whitelisted client, so no login UI and no interstitial renders);
 * anything else stalls invisibly until the timeout and fails closed.
 * Success is detected by the callback (loaded inside the iframe, same origin)
 * persisting fresh credentials to the shared IndexedDB namespace.
 */
const attemptSilentSso = async (
  expectedLocalpart: string,
  options: SilentSsoOptions = {}
): Promise<SilentSsoOutcome> => {
  const timeoutMs = options.timeoutMs ?? 20_000;
  const pollIntervalMs = options.pollIntervalMs ?? 400;

  const config = getConfig();
  if (!config.enabled || config.homeserverUrl === '') {
    return 'unavailable';
  }
  // Synapse whitelists only the platform origin, and matches it by prefix, so
  // it cannot cover arbitrary innovation-hub subdomains. From any other origin
  // the confirmation interstitial would render unseen in the frame and the
  // attempt could only time out.
  if (config.appOrigin !== '' && window.location.origin !== config.appOrigin) {
    return 'unavailable';
  }
  const { signal } = options;
  if (signal?.aborted) {
    return 'unavailable';
  }

  // One deadline bounds the whole attempt, discovery included: a login endpoint
  // that accepts the connection and never answers must not hold establishment
  // open past the timeout. An aborted discovery reads as unreachable.
  const deadline = Date.now() + timeoutMs;
  const discovery = new AbortController();
  const discoveryTimer = setTimeout(() => discovery.abort(), timeoutMs);
  const abortDiscovery = () => discovery.abort();
  signal?.addEventListener('abort', abortDiscovery);
  let idpResult: SsoIdpResult;
  try {
    idpResult = await discoverIdp(config.homeserverUrl, discovery.signal);
  } finally {
    clearTimeout(discoveryTimer);
    signal?.removeEventListener('abort', abortDiscovery);
  }
  if (signal?.aborted) {
    return 'unavailable';
  }
  if (!idpResult.ok || !idpResult.idpId) {
    return idpResult.unreachable ? 'unreachable' : 'unavailable';
  }

  saveSsoFlowState();

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.src = buildSsoUrl(config.homeserverUrl, idpResult.idpId);
  document.body.appendChild(iframe);
  // Removing the frame tears down its browsing context, callback included.
  const removeFrame = () => iframe.remove();
  signal?.addEventListener('abort', removeFrame);

  try {
    while (Date.now() < deadline) {
      if (signal?.aborted) {
        return 'unavailable';
      }
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      const userId = await findStoredUserId(expectedLocalpart);
      if (userId) {
        const { record } = await loadCredentials(userId);
        if (record && record.expiresAt > Date.now()) {
          return 'authenticated';
        }
      }
    }
    return 'timeout';
  } finally {
    signal?.removeEventListener('abort', removeFrame);
    iframe.remove();
    clearSsoFlowState();
  }
};

export {
  CALLBACK_ROUTE,
  PENDING_SSO_KEY,
  attemptSilentSso,
  discoverIdp,
  saveSsoFlowState,
  loadSsoFlowState,
  clearSsoFlowState,
};
export type { SsoFlowState, SsoIdpResult, SilentSsoOptions, SilentSsoOutcome };
