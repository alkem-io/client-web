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
// Companion cookie to STORAGE_KEY_RETURN_URL: set when a sign-up carrying a
// return destination begins, consumed once on the next authenticated landing.
// See useSignUpRoundTrip / useSignUpReturnRedirect.
export const STORAGE_KEY_SIGNUP_RETURN_ARMED = 'signupReturnArmed';

export const AUTH_PAGE_PREFIXES = [_AUTH_LOGIN_PATH, AUTH_REGISTRATION_PATH, AUTH_SIGN_UP_PATH];

// OIDC BFF (Backend-For-Frontend) proxy routes served by alkemio-server on the
// same origin as the SPA. Not OIDC-standard endpoints — those live on the IdP
// and are advertised via the discovery document. login/logout must stay relative
// (same-origin) because the BFF only mounts on the apex domain.
export const OIDC_BFF_BASE = '/api/auth/oidc';
export const OIDC_LOGIN_PATH = `${OIDC_BFF_BASE}/login`;
export const OIDC_LOGOUT_PATH = `${OIDC_BFF_BASE}/logout`;
// id-token-hint is served on the identity subdomain — resolve the absolute URL
// via useIdTokenHintUrl, which prepends the identity origin (issuer).
export const OIDC_ID_TOKEN_HINT_PATH = `${OIDC_BFF_BASE}/id-token-hint`;

// sessionStorage marker (see useOidcSessionRecovery): a silent recovery redirect
// has already been attempted in this tab — loop guard so a BFF that refuses to
// mint a session can't trap the user in a redirect loop. Cleared on logout and
// whenever a live BFF session is next observed.
export const OIDC_RECOVERY_ATTEMPTED_KEY = 'alkemio_oidc_recovery_attempted';

// sessionStorage marker (see useDeleteAccount): a forced re-authentication
// round trip for account deletion has already been attempted in this tab —
// loop guard so a session that a re-login never freshens (window/IdP
// mismatch, clock skew) can't trap the user in a redirect loop, and so a
// `?resume=delete-account` URL supplied any other way than this tab's own
// redirect can't kick off a forced re-login with no user gesture. Cleared
// once a pre-flight reports a fresh session.
export const DELETE_ACCOUNT_REAUTH_ATTEMPTED_KEY = 'alkemio_delete_account_reauth_attempted';
