import { getConfig } from './matrixConfig';
import { storeCredentials } from './storage';

type ExchangeResult = {
  readonly user_id: string;
  readonly device_id: string;
  readonly access_token: string;
};

type CallbackOutcome = {
  readonly ok: boolean;
  readonly error?: string;
};

const readLoginToken = (): string | null => new URLSearchParams(window.location.search).get('loginToken');

const exchangeLoginToken = async (homeserverUrl: string, loginToken: string): Promise<ExchangeResult> => {
  const response = await fetch(`${homeserverUrl}/_matrix/client/v3/login`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'm.login.token',
      token: loginToken,
      initial_device_display_name: 'Alkemio Web',
    }),
  });

  if (!response.ok) {
    throw new Error(`login exchange failed: ${response.status}`);
  }

  return (await response.json()) as ExchangeResult;
};

/**
 * Runs inside the hidden silent-SSO iframe: exchanges the loginToken Synapse
 * put on this page's URL for a device and access token, and persists them.
 * The iframe URL never reaches the address bar, so there is no visible token
 * to scrub.
 */
const handleMatrixCallback = async (): Promise<CallbackOutcome> => {
  const loginToken = readLoginToken();

  if (!loginToken) {
    return { ok: false, error: 'no loginToken' };
  }

  const config = getConfig();
  if (config.homeserverUrl === '') {
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
      homeserverUrl: config.homeserverUrl,
    });

    if (!stored) {
      return { ok: false, error: 'failed to persist credentials' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'exchange failed' };
  }
};

export { handleMatrixCallback, exchangeLoginToken };
export type { CallbackOutcome, ExchangeResult };
