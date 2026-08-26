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
}

const discoverIdp = async (homeserverUrl: string): Promise<SsoIdpResult> => {
  const response = await fetch(`${homeserverUrl}/_matrix/client/v3/login`, {
    credentials: 'omit',
  });

  if (!response.ok) {
    return { ok: false, error: `login endpoint returned ${response.status}` };
  }

  const body = (await response.json()) as {
    flows?: { type?: string; identity_providers?: { id?: string }[] }[];
  };

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
 * Runs the whole SSO round-trip inside a hidden iframe so the visible page
 * never navigates. Works only while every hop is a redirect (live Alkemio
 * session + whitelisted client, so no login UI and no interstitial renders);
 * anything else stalls invisibly until the timeout and resolves false.
 * Success is detected by the callback (loaded inside the iframe, same origin)
 * persisting fresh credentials to the shared IndexedDB namespace.
 */
const attemptSilentSso = async (expectedLocalpart: string, options: SilentSsoOptions = {}): Promise<boolean> => {
  const timeoutMs = options.timeoutMs ?? 20_000;
  const pollIntervalMs = options.pollIntervalMs ?? 400;

  const config = getConfig();
  if (!config.enabled || config.homeserverUrl === '') {
    return false;
  }

  const idpResult = await discoverIdp(config.homeserverUrl);
  if (!idpResult.ok || !idpResult.idpId) {
    return false;
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
          return true;
        }
      }
    }
    return false;
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
export type { SsoFlowState, SsoIdpResult, InitiateSsoResult, SilentSsoOptions };
