import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const eventHandler = () => {
      window.removeEventListener('popstate', eventHandler);
      if (window.location.pathname !== parentPagePath) {
        navigate(parentPagePath);
      }
    };
    window.addEventListener('popstate', eventHandler);
    navigate(-1);
  }, []);
};

export default useBackToPath;
