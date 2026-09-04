import { NEVER_EXPIRES, rotateTokens } from './storage';

interface RefreshedTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiry: Date;
}

class TokenRefreshError extends Error {
  readonly status: number;
  readonly errcode: string | undefined;
  readonly softLogout: boolean;

  constructor(status: number, errcode: string | undefined, softLogout: boolean) {
    super(`token refresh failed with status ${status}`);
    this.name = 'TokenRefreshError';
    this.status = status;
    this.errcode = errcode;
    this.softLogout = softLogout;
  }
}

const postRefresh = async (homeserverUrl: string, refreshToken: string): Promise<Response> =>
  fetch(`${homeserverUrl}/_matrix/client/v3/refresh`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

const toRefreshError = async (response: Response): Promise<TokenRefreshError> => {
  let errcode: string | undefined;
  let softLogout = false;
  try {
    const body = (await response.json()) as { errcode?: string; soft_logout?: boolean };
    errcode = body.errcode;
    softLogout = body.soft_logout === true;
  } catch {
    // Non-JSON error body — status alone carries the failure
  }
  return new TokenRefreshError(response.status, errcode, softLogout);
};

const refreshMatrixTokens = async (
  homeserverUrl: string,
  userId: string,
  refreshToken: string
): Promise<RefreshedTokens> => {
  let response = await postRefresh(homeserverUrl, refreshToken);

  if (!response.ok) {
    const error = await toRefreshError(response);
    if (error.errcode !== 'M_UNKNOWN_TOKEN' || !error.softLogout) {
      throw error;
    }
    // soft_logout: the old refresh token stays valid until the new access
    // token is first used, so one retry with the same token can win the race.
    response = await postRefresh(homeserverUrl, refreshToken);
    if (!response.ok) {
      throw await toRefreshError(response);
    }
  }

  const body = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in_ms?: number;
  };

  const expiresAt = body.expires_in_ms ? Date.now() + body.expires_in_ms : NEVER_EXPIRES;
  const nextRefreshToken = body.refresh_token ?? refreshToken;
  await rotateTokens(userId, body.access_token, nextRefreshToken, expiresAt);

  return {
    accessToken: body.access_token,
    refreshToken: nextRefreshToken,
    expiry: new Date(expiresAt),
  };
};

export { refreshMatrixTokens, TokenRefreshError };
export type { RefreshedTokens };
