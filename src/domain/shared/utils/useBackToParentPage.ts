import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { LinkWithState } from '../types/LinkWithState';

const LOCATION_STATE_PARAM_PARENT_PAGE = 'parentPage';

export type ReturnTuple = [() => void, (url: string) => LinkWithState];

/**
 * Returns a tuple of 2 functions:
 * First is a callback that takes a user to the previous page only if the user got to the current page from that parent.
 * Second is a function that produces a link with history item state that holds the info abount the parent page.
 * Useful for scenarios when there's a back navigation action, but we really only want to go back when "back" leads
 * to the given "parent" page. E.g. we may not want to go "back" when current page was opened in a new tab.
 * @param parentPageName
 * @param parentPageUrl
 */

const useBackToParentPage = (parentPageName: string, parentPageUrl: string): ReturnTuple => {
  const navigate = useNavigate();
  const location = useLocation();

  const backToParentPage = useCallback(() => {
    const { parentPage } = (location.state ?? {}) as { [LOCATION_STATE_PARAM_PARENT_PAGE]?: unknown };
    if (parentPage === parentPageName) {
      navigate(-1);
    } else {
      navigate(parentPageUrl, { replace: true });
    }
  }, []);

  const buildLinkWithState = useCallback(
    (url: string): LinkWithState => {
      return {
        url,
        linkState: { [LOCATION_STATE_PARAM_PARENT_PAGE]: parentPageName },
      };
    },
    [parentPageName]
  );

  return [backToParentPage, buildLinkWithState];
};

export default useBackToParentPage;
