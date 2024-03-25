import { useCallback } from 'react';
import useNavigate from './useNavigate';
import useCanGoBack from './useCanGoBack';

/**
 * Goes back only if the previous history item has the specified URL.
 * This is based on the native browser history API, so it may not work with all flavors of react-router.
 */
const useBackToPath = () => {
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  return useCallback((parentPagePath: string) => {
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

export default useBackToPath;
