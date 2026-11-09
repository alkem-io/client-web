import { type CredentialRecord, loadCredentials, replaceTokens } from './storage';

const REFRESH_TIMEOUT_MS = 20_000;

type Tokens = { accessToken: string; refreshToken: string; expiresAt: number };

/**
 * A refresh token is single-use, so tabs sharing one stored device must never
 * renew it concurrently. Without a cross-tab lock the browser keeps the
 * non-refreshable login.
 */
const canRenew = (): boolean => 'locks' in navigator;

const refreshPair = (res: {
  refresh_token?: unknown;
  expires_in_ms?: unknown;
}): { refreshToken: string; expiresAt: number } | Record<string, never> =>
  typeof res.refresh_token === 'string' && typeof res.expires_in_ms === 'number'
    ? { refreshToken: res.refresh_token, expiresAt: Date.now() + res.expires_in_ms }
    : {};

/** Throws on a transient failure; null when the homeserver refused the refresh token. */
const postRefresh = async (current: CredentialRecord): Promise<Tokens | null> => {
  const attempt = new AbortController();
  const expire = setTimeout(() => attempt.abort(), REFRESH_TIMEOUT_MS);
  try {
    const response = await fetch(`${current.homeserverUrl}/_matrix/client/v3/refresh`, {
      method: 'POST',
      signal: attempt.signal,
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: current.refreshToken }),
    });
    if (response.status >= 500 || response.status === 429) {
      throw new Error(`refresh failed: ${response.status}`);
    }
    if (!response.ok) {
      return null;
    }
    const { access_token, refresh_token, expires_in_ms } = (await response.json()) as Record<string, unknown>;
    return typeof access_token === 'string' && typeof refresh_token === 'string' && typeof expires_in_ms === 'number'
      ? { accessToken: access_token, refreshToken: refresh_token, expiresAt: Date.now() + expires_in_ms }
      : null;
  } finally {
    clearTimeout(expire);
  }
};

/**
 * Renews `current`'s access token, one tab at a time per user. Resolves the
 * new pair, or null when it must not be used: the stored record is gone or
 * another device's, the homeserver refused the refresh token, or the record
 * changed before the new pair could be written. Rejects on a transient
 * failure, leaving the stored record as it was.
 */
const renewTokens = (current: CredentialRecord): Promise<Tokens | null> =>
  navigator.locks.request(`alkemio-matrix-refresh/${current.userId}`, async () => {
    const stored = await loadCredentials(current.userId);
    if (!stored || stored.deviceId !== current.deviceId) {
      return null;
    }
    if (
      stored.refreshToken !== undefined &&
      stored.expiresAt !== undefined &&
      stored.refreshToken !== current.refreshToken
    ) {
      return { accessToken: stored.accessToken, refreshToken: stored.refreshToken, expiresAt: stored.expiresAt };
    }
    const tokens = await postRefresh(current);
    if (!tokens) {
      return null;
    }
    return (await replaceTokens(current.userId, current.deviceId, tokens)) ? tokens : null;
  });

export { canRenew, refreshPair, renewTokens };
