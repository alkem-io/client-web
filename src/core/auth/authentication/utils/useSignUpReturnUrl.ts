import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { useCookies } from 'react-cookie';

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

const returnUrlCookieOptions = { path: '/', domain: cookieDomain, sameSite: 'lax' } as const;

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

type UseGetReturnUrlProvided = string;

export const useGetReturnUrl = (): UseGetReturnUrlProvided => {
  const [cookies] = useCookies([STORAGE_KEY_RETURN_URL]);
  const platformOrigin = usePlatformOrigin();
  const defaultReturnUrl = platformOrigin && `${platformOrigin}${ROUTE_HOME}`;

  return cookies[STORAGE_KEY_RETURN_URL] || defaultReturnUrl;
};
