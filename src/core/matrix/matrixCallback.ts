import { storeCredentials } from './storage';

type ExchangeResult = {
  readonly user_id: string;
  readonly device_id: string;
  readonly access_token: string;
};

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
const handleMatrixCallback = async (homeserverUrl: string): Promise<void> => {
  const loginToken = new URLSearchParams(window.location.search).get('loginToken');
  if (!loginToken) {
    return;
  }

  try {
    const result = await exchangeLoginToken(homeserverUrl, loginToken);
    // A record missing any field would be resumed unchecked until sign-out.
    if (!result.user_id || !result.device_id || !result.access_token) {
      return;
    }
    await storeCredentials({
      userId: result.user_id,
      deviceId: result.device_id,
      accessToken: result.access_token,
      homeserverUrl,
    });
  } catch {
    // Fail closed: the initiating frame's poll times out.
  }
};

export { handleMatrixCallback, exchangeLoginToken };
