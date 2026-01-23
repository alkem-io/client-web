import { useCallback } from 'react';
import useNavigate from './useNavigate';
import useCanGoBack from './useCanGoBack';
import { normalizeLink } from '../utils/links';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { getPreviousSafePath } from './NavigationHistory';

const ROUTE_HOME = `/${TopLevelRoutePath.Home}`;

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
 * 1. If there's a previous path tracked within the SPA (via NavigationHistoryTracker), navigate there
 * 2. Otherwise, navigate to parentPagePath (or /home if not provided)
 *
 * This ensures users always stay within the platform. Since NavigationHistoryTracker only tracks
 * paths within our SPA, we never navigate to external sites.
 *
 * @param parentPagePath - Default fallback path if no previous path exists (defaults to /home)
 * @param steps - How many steps back to go (1 = previous page, 2 = two pages back, etc.)
 *                Useful when a redirect occurred and you want to skip the redirected-from page.
 */
export const useBackWithDefaultUrl = (parentPagePath: string = ROUTE_HOME, steps: number = 1) => {
  const normalizedDefaultPath = normalizeLink(parentPagePath ?? ROUTE_HOME);
  const navigate = useNavigate();

  return useCallback(() => {
    // Get the previous path from the global navigation history tracker
    const previousPath = getPreviousSafePath(steps);

    // If we have a previous path from within the SPA, use it
    if (previousPath) {
      navigate(previousPath);
      return;
    }

    // Otherwise, use the default path
    navigate(normalizedDefaultPath);
  }, [normalizedDefaultPath, navigate, steps]);
};

export default useBackToPath;
