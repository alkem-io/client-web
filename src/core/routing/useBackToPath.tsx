import { useCallback, useMemo } from 'react';
import { useLocation, NavigateProps, Navigate as RouterNavigate } from 'react-router-dom';
import useNavigate from './useNavigate';
import useCanGoBack from './useCanGoBack';
import { normalizeLink } from '../utils/links';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { useConfig } from '@/domain/platform/config/useConfig';
import { env } from '@/main/env';

const ROUTE_HOME = `/${TopLevelRoutePath.Home}`;

/**
 * Key used in location.state to store the origin URL for back navigation
 */
export const ORIGIN_URL_STATE_KEY = 'originUrl';

export interface LocationStateWithOrigin {
  [ORIGIN_URL_STATE_KEY]?: string;
}

/**
 * Checks if a URL is within the allowed Alkemio domains.
 * In development mode, also allows localhost.
 * @param url - The URL to check (can be absolute or relative)
 * @param platformDomain - The platform domain from config (e.g., "alkem.io")
 * @returns true if the URL is allowed, false otherwise
 */
export const isAllowedUrl = (url: string, platformDomain: string | undefined): boolean => {
  if (!url) {
    return false;
  }

  // Relative URLs are always allowed (they're within our app)
  if (url.startsWith('/')) {
    return true;
  }

  // Parse the URL to check its origin
  let urlHost: string;
  try {
    const parsedUrl = new URL(url);
    urlHost = parsedUrl.host;
  } catch {
    // Invalid URL, not allowed
    return false;
  }

  // In development mode, allow localhost and dev domain
  if (import.meta.env.MODE === 'development') {
    const devDomain = env?.VITE_APP_ALKEMIO_DOMAIN;
    if (devDomain) {
      let normalizedDevHost: string;
      try {
        normalizedDevHost = new URL(devDomain).host;
      } catch {
        normalizedDevHost = devDomain.replace(/\/$/, '');
      }
      if (urlHost === normalizedDevHost) {
        return true;
      }
    }
    // Allow current window origin in dev mode
    if (url.startsWith(window.location.origin)) {
      return true;
    }
  }

  // Check if the URL matches the platform domain or is a subdomain
  if (platformDomain) {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      if (hostname === platformDomain || hostname.endsWith(`.${platformDomain}`)) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
};

/**
 * Hook that returns a navigate function which automatically includes the current URL as originUrl in state.
 * Use this when navigating to pages that use useBackWithDefaultUrl for back navigation.
 */
export const useNavigateWithOrigin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (to: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => {
      const currentUrl = location.pathname + location.search;
      navigate(to, {
        ...options,
        state: {
          ...options?.state,
          [ORIGIN_URL_STATE_KEY]: currentUrl,
        },
      });
    },
    [navigate, location.pathname, location.search]
  );
};

/**
 * A wrapper around React Router's Navigate that automatically includes the current URL as originUrl in state.
 * Use this for redirects to pages that use useBackWithDefaultUrl for back navigation.
 */
export const NavigateWithOrigin = ({ state, ...props }: NavigateProps) => {
  const location = useLocation();
  const currentUrl = location.pathname + location.search;

  const stateWithOrigin = useMemo(
    () => ({
      ...(typeof state === 'object' ? state : {}),
      [ORIGIN_URL_STATE_KEY]: currentUrl,
    }),
    [state, currentUrl]
  );

  return <RouterNavigate {...props} state={stateWithOrigin} />;
};

/**
 * Goes back only if the previous history item has the specified URL.
 * This is based on the native browser history API, so it may not work with all flavors of react-router.
 */
const useBackToPath = () => {
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  return useCallback((parentPagePath: string) => {
    parentPagePath = normalizeLink(parentPagePath);
    if (!canGoBack) {
      navigate(parentPagePath);
    }
    const handlePopState = () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.location.pathname !== parentPagePath) {
        navigate(parentPagePath);
      }
    };
    window.addEventListener('popstate', handlePopState);
    navigate(-1);
  }, []);
};

export const useBackToStaticPath = (parentPagePath: string) => {
  const backToPath = useBackToPath();

  return useCallback(() => backToPath(parentPagePath), [parentPagePath]);
};

/**
 * Useful to close dialogs and navigate safely within the Alkemio platform.
 *
 * Navigation priority:
 * 1. If location.state contains a valid originUrl within the Alkemio domain, navigate there
 * 2. Otherwise, navigate to parentPagePath (or /home if not provided)
 *
 * This ensures users always stay within the platform and can return to where they came from
 * when navigating through internal links that pass the origin URL via state.
 */
export const useBackWithDefaultUrl = (parentPagePath: string = ROUTE_HOME) => {
  const normalizedDefaultPath = normalizeLink(parentPagePath ?? ROUTE_HOME);
  const navigate = useNavigate();
  const location = useLocation();
  const { locations } = useConfig();

  return useCallback(() => {
    const platformDomain = locations?.domain;
    const state = location.state as LocationStateWithOrigin | null;
    const originUrl = state?.[ORIGIN_URL_STATE_KEY];

    // If we have a valid origin URL from state, use it
    if (originUrl && isAllowedUrl(originUrl, platformDomain)) {
      navigate(normalizeLink(originUrl));
      return;
    }

    // Otherwise, use the default path
    navigate(normalizedDefaultPath);
  }, [normalizedDefaultPath, navigate, location.state, locations?.domain]);
};

export default useBackToPath;
