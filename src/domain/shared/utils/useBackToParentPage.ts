import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const LOCATION_STATE_PARAM_PARENT_PAGE = 'parentPage';

/**
 * Returns a callback that takes a user to the previous page only if the user got to the current page from that parent.
 * Useful for scenarios when there's a back navigation action, but we really only want to go back when "back" leads
 * to the given "parent" page. E.g. we may not want to go "back" when current page was opened in a new tab.
 * @param parentPageName
 * @param parentPageUrl
 */

const useBackToParentPage = (parentPageName: string, parentPageUrl: string) => {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const { parentPage } = (location.state ?? {}) as { [LOCATION_STATE_PARAM_PARENT_PAGE]?: unknown };
    if (parentPage === parentPageName) {
      navigate(-1);
    } else {
      navigate(parentPageUrl, { replace: true });
    }
  }, []);
};

export default useBackToParentPage;
