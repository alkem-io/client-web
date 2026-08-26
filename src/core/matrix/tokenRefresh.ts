import { rotateTokens } from './storage';

interface RefreshedTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiry: Date;
}

const refreshMatrixTokens = async (
  homeserverUrl: string,
  userId: string,
  refreshToken: string
): Promise<RefreshedTokens> => {
  const response = await fetch(`${homeserverUrl}/_matrix/client/v3/refresh`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`token refresh failed with status ${response.status}`);
  }

  const body = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in_ms?: number;
  };

  const expiresAt = Date.now() + (body.expires_in_ms ?? 0);
  const nextRefreshToken = body.refresh_token ?? refreshToken;
  await rotateTokens(userId, body.access_token, nextRefreshToken, expiresAt);

  return {
    accessToken: body.access_token,
    refreshToken: nextRefreshToken,
    expiry: new Date(expiresAt),
  };
};

export { refreshMatrixTokens };
export type { RefreshedTokens };
