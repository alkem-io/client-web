import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useNavigate from './useNavigate';
import useCanGoBack from './useCanGoBack';
import { normalizeLink } from '../utils/links';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';

const ROUTE_HOME = `/${TopLevelRoutePath.Home}`;

/**
 * Tracks the previous pathname within the SPA.
 * Returns undefined on first render, then the previous path after navigation.
 */
export const usePreviousPath = () => {
  const location = useLocation();
  const prevPathRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Update after render so we capture the "previous" value
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  return prevPathRef.current;
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
 * 1. If there's a previous path tracked within the SPA, navigate there
 * 2. Otherwise, navigate to parentPagePath (or /home if not provided)
 *
 * This ensures users always stay within the platform. Since we only track paths
 * within our SPA, we never navigate to external sites.
 */
export const useBackWithDefaultUrl = (parentPagePath: string = ROUTE_HOME) => {
  const normalizedDefaultPath = normalizeLink(parentPagePath ?? ROUTE_HOME);
  const navigate = useNavigate();
  const previousPath = usePreviousPath();

  return useCallback(() => {
    // If we have a previous path from within the SPA, use it
    if (previousPath) {
      navigate(previousPath);
      return;
    }

    // Otherwise, use the default path
    navigate(normalizedDefaultPath);
  }, [normalizedDefaultPath, navigate, previousPath]);
};

export default useBackToPath;
