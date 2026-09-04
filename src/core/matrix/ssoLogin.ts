import { getConfig } from './matrixConfig';
import { findStoredUserId, loadCredentials } from './storage';

const CALLBACK_ROUTE = '/matrix-callback';
const PENDING_SSO_KEY = 'alkemio-matrix-sso-pending';

interface SsoFlowState {
  readonly returnPath: string;
  readonly startedAt: number;
}

interface SsoIdpResult {
  readonly ok: boolean;
  readonly idpId?: string;
  readonly error?: string;
  /** True when the failure looks transient (network down, 5xx, rate limit) rather than a misconfiguration. */
  readonly unreachable?: boolean;
}

const discoverIdp = async (homeserverUrl: string): Promise<SsoIdpResult> => {
  let response: Response;
  let body: { flows?: { type?: string; identity_providers?: { id?: string }[] }[] };
  try {
    response = await fetch(`${homeserverUrl}/_matrix/client/v3/login`, {
      credentials: 'omit',
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

const saveSsoFlowState = (returnPath: string): void => {
  const state: SsoFlowState = { returnPath, startedAt: Date.now() };
  try {
    sessionStorage.setItem(PENDING_SSO_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — proceed anyway; worst case we lose restore
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

interface InitiateSsoResult {
  readonly ok: boolean;
  readonly error?: string;
}

const buildSsoUrl = (homeserverUrl: string, idpId: string): string => {
  const redirectUrl = `${window.location.origin}${CALLBACK_ROUTE}`;
  return (
    `${homeserverUrl}/_matrix/client/v3/login/sso/redirect/` +
    `${encodeURIComponent(idpId)}?redirectUrl=${encodeURIComponent(redirectUrl)}`
  );
};

const initiateSsoRedirect = async (
  navigate: (url: string) => void = url => {
    window.location.href = url;
  }
): Promise<InitiateSsoResult> => {
  const config = getConfig();
  if (!config.enabled || config.homeserverUrl === '') {
    return { ok: false, error: 'matrix not configured' };
  }

  const idpResult = await discoverIdp(config.homeserverUrl);
  if (!idpResult.ok || !idpResult.idpId) {
    return { ok: false, error: idpResult.error };
  }

  saveSsoFlowState(window.location.pathname + window.location.search);

  navigate(buildSsoUrl(config.homeserverUrl, idpResult.idpId));
  return { ok: true };
};

interface SilentSsoOptions {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
}

/**
 * - `authenticated` — the callback persisted fresh credentials for the expected user.
 * - `unreachable` — the homeserver could not be reached (or answered 5xx/429); worth retrying with backoff.
 * - `timeout` — the round-trip stalled (no live Alkemio session, or an interstitial rendered); fail closed.
 * - `unavailable` — flag off / not configured / SSO misconfigured; fail closed, retrying cannot help.
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

  const idpResult = await discoverIdp(config.homeserverUrl);
  if (!idpResult.ok || !idpResult.idpId) {
    return idpResult.unreachable ? 'unreachable' : 'unavailable';
  }

  saveSsoFlowState(window.location.pathname + window.location.search);

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.src = buildSsoUrl(config.homeserverUrl, idpResult.idpId);
  document.body.appendChild(iframe);

  try {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
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
    iframe.remove();
    clearSsoFlowState();
  }
};

export {
  CALLBACK_ROUTE,
  PENDING_SSO_KEY,
  attemptSilentSso,
  discoverIdp,
  initiateSsoRedirect,
  saveSsoFlowState,
  loadSsoFlowState,
  clearSsoFlowState,
};
export type { SsoFlowState, SsoIdpResult, InitiateSsoResult, SilentSsoOptions, SilentSsoOutcome };
