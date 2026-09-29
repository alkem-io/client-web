import { clearNamespace, storeCredentials } from './storage';

type ExchangeResult = {
  readonly user_id: string;
  readonly device_id: string;
  readonly access_token: string;
};

const exchangeLoginToken = async (
  homeserverUrl: string,
  loginToken: string,
  signal?: AbortSignal
): Promise<ExchangeResult> => {
  const response = await fetch(`${homeserverUrl}/_matrix/client/v3/login`, {
    method: 'POST',
    signal,
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
 * Exchanges a loginToken for a device and access token and persists them in
 * this origin's IndexedDB. Once `signal` aborts (sign-out, user switch),
 * nothing stays persisted: the exchange is cancelled, or its record removed.
 */
const exchangeAndStore = async (homeserverUrl: string, loginToken: string, signal?: AbortSignal): Promise<void> => {
  try {
    const result = await exchangeLoginToken(homeserverUrl, loginToken, signal);
    await storeCredentials({
      userId: result.user_id,
      deviceId: result.device_id,
      accessToken: result.access_token,
      homeserverUrl,
    });
    // A sign-out during the write may already have listed and cleared the
    // stored namespaces; remove what this write left behind.
    if (signal?.aborted) {
      await clearNamespace(result.user_id);
    }
  } catch {
    // Fail closed: the initiating frame's poll times out.
  }
};

/**
 * A `parent` announced by the silent-SSO iframe is accepted only when it is an
 * https origin on a subdomain of this page's own host. The browser then
 * delivers the posted token only if the real embedding parent has that origin.
 */
const isAcceptedParent = (parent: string, ownHost: string): boolean => {
  try {
    const url = new URL(parent);
    return url.protocol === 'https:' && url.origin === parent && url.host.endsWith(`.${ownHost}`);
  } catch {
    return false;
  }
};

/**
 * Runs inside the hidden silent-SSO iframe, on the platform origin. With no
 * `parent`, the embedding page is this origin: exchange the loginToken and
 * persist the credentials here. With an accepted `parent` (an innovation-hub
 * origin), the credentials must land in the parent's own storage, so the
 * token is handed to it instead of exchanged. The iframe URL never reaches the
 * address bar, so there is no visible token to scrub.
 */
const handleMatrixCallback = async (homeserverUrl: string): Promise<void> => {
  const params = new URLSearchParams(window.location.search);
  const loginToken = params.get('loginToken');
  if (!loginToken) {
    return;
  }

  const parent = params.get('parent');
  if (parent === null) {
    await exchangeAndStore(homeserverUrl, loginToken);
    return;
  }
  if (isAcceptedParent(parent, window.location.host)) {
    window.parent.postMessage({ loginToken }, parent);
  }
};

export { handleMatrixCallback, exchangeAndStore, exchangeLoginToken, isAcceptedParent };
