import { useCallback } from 'react';
import useNavigate from './useNavigate';
import useCanGoBack from './useCanGoBack';
import { normalizeLink } from '../utils/links';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';

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
 * Useful to close dialogs.
 * Will navigate back using the history API if possible, but will navigate to the default URL if it's not possible or if the previous URL is the same as the current one.
 */
export const useBackWithDefaultUrl = (parentPagePath: string = `/${TopLevelRoutePath.Home}`) => {
  parentPagePath = parentPagePath ?? `/${TopLevelRoutePath.Home}`;
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  return useCallback(() => {
    parentPagePath = normalizeLink(parentPagePath);
    if (!canGoBack) {
      navigate(parentPagePath);
      return;
    }
    const currentUrl = window.location.pathname;
    const handlePopState = () => {
      window.removeEventListener('popstate', handlePopState);
      const previousUrl = window.location.pathname;

      if (currentUrl === previousUrl) {
        navigate(parentPagePath);
      }
    };
    window.addEventListener('popstate', handlePopState);
    navigate(-1);
  }, [parentPagePath]);
};

export default useBackToPath;
