import { getConfig } from './matrixConfig';
import { redactBreadcrumb } from './redaction';
import { clearSsoFlowState, loadSsoFlowState } from './ssoLogin';
import { NEVER_EXPIRES, storeCredentials } from './storage';

interface ExchangeResult {
  readonly user_id: string;
  readonly device_id: string;
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly expires_in_ms?: number;
}

interface CallbackOutcome {
  readonly ok: boolean;
  readonly error?: string;
  readonly returnPath?: string;
}

type BreadcrumbSink = (breadcrumb: { message?: string; data?: Record<string, unknown> }) => void;

const scrubLoginToken = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('loginToken');

  params.delete('loginToken');
  const cleanSearch = params.toString();
  const cleanUrl = window.location.pathname + (cleanSearch ? `?${cleanSearch}` : '') + window.location.hash;
  window.history.replaceState(window.history.state, '', cleanUrl);

  return token;
};

const exchangeLoginToken = async (homeserverUrl: string, loginToken: string): Promise<ExchangeResult> => {
  const response = await fetch(`${homeserverUrl}/_matrix/client/v3/login`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'm.login.token',
      token: loginToken,
      refresh_token: true,
      initial_device_display_name: 'Alkemio Web',
    }),
  });

  if (!response.ok) {
    throw new Error(`login exchange failed: ${response.status}`);
  }

  return (await response.json()) as ExchangeResult;
};

const handleMatrixCallback = async (
  onBreadcrumb?: BreadcrumbSink,
  navigate?: (path: string) => void
): Promise<CallbackOutcome> => {
  const loginToken = scrubLoginToken();

  if (!loginToken) {
    if (onBreadcrumb) {
      onBreadcrumb(
        redactBreadcrumb({
          message: 'Matrix callback: no loginToken in URL',
        })
      );
    }
    return { ok: false, error: 'no loginToken' };
  }

  const flowState = loadSsoFlowState();
  if (!flowState) {
    if (onBreadcrumb) {
      onBreadcrumb(
        redactBreadcrumb({
          message: 'Matrix callback: unsolicited token (no pending flow)',
        })
      );
    }
    return { ok: false, error: 'unsolicited token' };
  }

  clearSsoFlowState();

  const config = getConfig();
  if (!config.enabled || config.homeserverUrl === '') {
    return { ok: false, error: 'matrix not configured' };
  }

  try {
    const result = await exchangeLoginToken(config.homeserverUrl, loginToken);

    if (!result.access_token || !result.user_id || !result.device_id) {
      return { ok: false, error: 'incomplete exchange response' };
    }

    const stored = await storeCredentials({
      userId: result.user_id,
      deviceId: result.device_id,
      accessToken: result.access_token,
      refreshToken: result.refresh_token ?? '',
      expiresAt: result.expires_in_ms ? Date.now() + result.expires_in_ms : NEVER_EXPIRES,
      homeserverUrl: config.homeserverUrl,
      storedAt: Date.now(),
    });

    if (!stored) {
      return { ok: false, error: 'failed to persist credentials' };
    }

    const returnPath = flowState.returnPath || '/';

    if (navigate) {
      navigate(returnPath);
    }

    return { ok: true, returnPath };
  } catch (err) {
    if (onBreadcrumb) {
      onBreadcrumb(
        redactBreadcrumb({
          message: `Matrix callback: exchange failed — ${err instanceof Error ? err.message : 'unknown'}`,
        })
      );
    }
    return { ok: false, error: 'exchange failed' };
  }
};

export { handleMatrixCallback, scrubLoginToken, exchangeLoginToken };
export type { CallbackOutcome, ExchangeResult };
