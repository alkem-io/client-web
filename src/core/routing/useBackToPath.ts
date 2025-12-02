import { useCallback } from 'react';
import useNavigate from './useNavigate';
import useCanGoBack from './useCanGoBack';
import { normalizeLink } from '../utils/links';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { useConfig } from '@/domain/platform/config/useConfig';
import { env } from '@/main/env';

const ROUTE_HOME = `/${TopLevelRoutePath.Home}`;

/**
 * Checks if a URL origin is within the allowed Alkemio domains.
 * In development mode, also allows localhost.
 * @param urlOrigin - The origin to check (e.g., "https://alkem.io" or "http://localhost:3000")
 * @param platformDomain - The platform domain from config (e.g., "alkem.io")
 * @returns true if the origin is allowed, false otherwise
 */
const isAllowedOrigin = (urlOrigin: string, platformDomain: string | undefined): boolean => {
  if (!urlOrigin) {
    return false;
  }

  // In development mode, allow localhost
  if (import.meta.env.MODE === 'development') {
    // Check against VITE_APP_ALKEMIO_DOMAIN env variable for local dev
    const devDomain = env?.VITE_APP_ALKEMIO_DOMAIN;
    if (devDomain && urlOrigin.startsWith(devDomain)) {
      return true;
    }
    // Also allow current window origin in dev mode (handles localhost scenarios)
    if (urlOrigin === window.location.origin) {
      return true;
    }
  }

  // Check if the origin matches the platform domain or is a subdomain of it
  if (platformDomain) {
    try {
      const url = new URL(urlOrigin);
      const hostname = url.hostname;
      // Exact match or subdomain match (e.g., "dev.alkem.io" matches "alkem.io")
      if (hostname === platformDomain || hostname.endsWith(`.${platformDomain}`)) {
        return true;
      }
    } catch {
      // Invalid URL, not allowed
      return false;
    }
  }

  return false;
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
 * Useful to close dialogs and navigate back safely within the Alkemio platform.
 * Will navigate back using the history API only if the referrer is within the Alkemio domain.
 * If the referrer is external or empty, navigates to the default URL (home page).
 * In development mode, also respects localhost for local development.
 */
export const useBackWithDefaultUrl = (parentPagePath: string = ROUTE_HOME) => {
  parentPagePath = parentPagePath ?? ROUTE_HOME;
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();
  const { locations } = useConfig();

  return useCallback(() => {
    const normalizedPath = normalizeLink(parentPagePath);
    const platformDomain = locations?.domain;

    // Check if we can safely go back by examining the referrer
    // document.referrer contains the URL of the page that linked to the current page
    const referrer = document.referrer;

    // If there's no history or we can't verify the referrer is within our domain, use default path
    if (!canGoBack || !referrer) {
      navigate(normalizedPath);
      return;
    }

    // Extract origin from referrer and check if it's an allowed Alkemio domain
    let referrerOrigin: string;
    try {
      referrerOrigin = new URL(referrer).origin;
    } catch {
      // Invalid referrer URL, navigate to default
      navigate(normalizedPath);
      return;
    }

    // If referrer is not from an allowed origin, navigate to home page
    if (!isAllowedOrigin(referrerOrigin, platformDomain)) {
      navigate(ROUTE_HOME);
      return;
    }

    // Safe to go back - referrer is within Alkemio domain
    const currentUrl = window.location.pathname;
    const handlePopState = () => {
      window.removeEventListener('popstate', handlePopState);
      const previousUrl = window.location.pathname;

      // If we ended up at the same URL (e.g., hash change), navigate to default
      if (currentUrl === previousUrl) {
        navigate(normalizedPath);
      }
    };
    window.addEventListener('popstate', handlePopState);
    navigate(-1);
  }, [parentPagePath, canGoBack, locations?.domain, navigate]);
};

export default useBackToPath;
