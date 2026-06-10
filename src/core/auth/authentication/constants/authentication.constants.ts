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

// Markers coordinating silent recovery of a dropped BFF OIDC session while the
// Kratos SSO session is still alive (see useOidcSessionRecovery). Kept here
// because both the recovery hook and the logout flow read/clear them.
//
// localStorage: a live BFF session has been observed in this browser at least
// once — i.e. the user is a returning Alkemio user, not merely an anonymous
// visitor carrying another RP's Kratos SSO cookie.
export const OIDC_SESSION_SEEN_KEY = 'alkemio_oidc_session_seen';
// sessionStorage: a silent recovery redirect has already been attempted in this
// tab — loop guard so a BFF that refuses to mint a session can't trap the user.
export const OIDC_RECOVERY_ATTEMPTED_KEY = 'alkemio_oidc_recovery_attempted';
