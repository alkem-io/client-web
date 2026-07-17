import { useCookies } from 'react-cookie';
import { STORAGE_KEY_RETURN_URL, STORAGE_KEY_SIGNUP_RETURN_ARMED } from '../constants/authentication.constants';

// Determine base cookie domain (e.g. .alkem.io) for cross-subdomain cookies
const cookieDomain = (() => {
  if (typeof window === 'undefined') return undefined;

  // Don't set domain for localhost or IP addresses
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return undefined;
  }

  const parts = window.location.hostname.split('.');
  return parts.length >= 2 ? `.${parts.slice(-2).join('.')}` : undefined;
})();

// maxAge (1h) makes this a persistent cookie: a session cookie dies with the
// browser session, so a first-time user who registers, closes the browser, and
// opens the verification email later would lose the return destination and
// land on home after signing in.
const returnUrlCookieOptions = { path: '/', domain: cookieDomain, sameSite: 'lax', maxAge: 3600 } as const;

type UseReturnUrlProvided = {
  returnUrl: string | undefined;
  setReturnUrl: (url: string | null) => void;
  clearReturnUrl: () => void;
};

/**
 * Hook that exposes the returnUrl cookie and setter/clearer.
 * @returns UseReturnUrlProvided
 */
export function useReturnUrl(): UseReturnUrlProvided {
  const [cookies, setCookie, removeCookie] = useCookies([STORAGE_KEY_RETURN_URL]);
  const returnUrl = cookies[STORAGE_KEY_RETURN_URL];
  const setReturnUrl = (url: string | null) => {
    if (url?.trim()) {
      setCookie(STORAGE_KEY_RETURN_URL, url, returnUrlCookieOptions);
    }
  };
  const clearReturnUrl = () => {
    removeCookie(STORAGE_KEY_RETURN_URL, returnUrlCookieOptions);
  };

  return {
    returnUrl,
    setReturnUrl,
    clearReturnUrl,
  };
}

type UseSignUpRoundTripProvided = {
  armed: boolean;
  arm: () => void;
  clearArmed: () => void;
};

/**
 * Marks that a sign-up carrying a return destination is in flight.
 *
 * Kratos's verification email link is a server-side GET that verifies and
 * redirects straight to its configured landing page (`/home`) — the SPA's
 * `/verify` screen never renders and the OIDC request that carried the
 * destination is long gone. `useSignUpReturnRedirect` reads this flag on that
 * landing to decide whether the stored `returnUrl` is still owed to the user.
 *
 * Same base-domain, 1h-lifetime cookie options as `returnUrl`: the flag is set
 * on the identity subdomain and read on the apex.
 */
export function useSignUpRoundTrip(): UseSignUpRoundTripProvided {
  const [cookies, setCookie, removeCookie] = useCookies([STORAGE_KEY_SIGNUP_RETURN_ARMED]);

  return {
    armed: cookies[STORAGE_KEY_SIGNUP_RETURN_ARMED] === '1',
    arm: () => setCookie(STORAGE_KEY_SIGNUP_RETURN_ARMED, '1', returnUrlCookieOptions),
    clearArmed: () => removeCookie(STORAGE_KEY_SIGNUP_RETURN_ARMED, returnUrlCookieOptions),
  };
}
