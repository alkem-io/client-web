/**
 * Internal use
 * Use buildLoginUrl() helper
 */
export const _AUTH_LOGIN_PATH = '/login';

export const AUTH_LOGOUT_PATH = '/logout';
export const AUTH_VERIFY_PATH = '/verify';
export const AUTH_REMINDER_PATH = `${AUTH_VERIFY_PATH}/reminder`;
export const AUTH_REQUIRED_PATH = '/required';
export const AUTH_SIGN_UP_PATH = '/sign_up';
export const AUTH_REGISTRATION_PATH = '/registration';
export const AUTH_RESET_PASSWORD_REQUEST = '/ory/kratos/public/self-service/recovery/browser';
export const AUTH_RESET_PASSWORD_PATH = '/recovery';
export const PARAM_NAME_RETURN_URL = 'returnUrl';
export const STORAGE_KEY_RETURN_URL = 'returnUrl';

export const AUTH_PAGE_PREFIXES = [_AUTH_LOGIN_PATH, AUTH_REGISTRATION_PATH, AUTH_SIGN_UP_PATH];

// OIDC BFF (Backend-For-Frontend) proxy routes served by alkemio-server on the
// same origin as the SPA. Not OIDC-standard endpoints — those live on the IdP
// and are advertised via the discovery document. These paths must stay relative
// (same-origin) because the BFF only mounts on the apex domain.
export const OIDC_BFF_BASE = '/api/auth/oidc';
export const OIDC_LOGIN_PATH = `${OIDC_BFF_BASE}/login`;
export const OIDC_LOGOUT_PATH = `${OIDC_BFF_BASE}/logout`;
export const OIDC_ID_TOKEN_HINT_PATH = `${OIDC_BFF_BASE}/id-token-hint`;
