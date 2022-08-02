import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { LinkWithState } from '../types/LinkWithState';

const LOCATION_STATE_PARAM_PARENT_PAGE = 'parentPage';

export type ReturnTuple = [() => void, (url: string) => LinkWithState];

/**
 * Returns a tuple of 2 functions:
 * First is a callback that takes a user to the previous page only if the user got to the current page from that parent.
 * Second is a function that produces a link with history item state that holds the info about the parent page.
 * Useful for scenarios when there's a back navigation action, but we really only want to go back when "back" leads
 * to the given "parent" page. E.g. we may not want to go "back" when current page was opened in a new tab.
 * @param parentPageUrl
 */

// TODO: Temporarily simplified to just hold a flag; add some identifier instead
const useBackToParentPage = (parentPageUrl: string): ReturnTuple => {
  const navigate = useNavigate();
  const location = useLocation();

  const backToParentPage = useCallback(() => {
    const { parentPage } = (location.state ?? {}) as { [LOCATION_STATE_PARAM_PARENT_PAGE]?: unknown };
    if (parentPage) {
      navigate(-1);
    } else {
      navigate(parentPageUrl, { replace: true });
    }
  }, [parentPageUrl, location]);

  const buildLinkWithState = useCallback((url: string): LinkWithState => {
    return {
      to: url,
      state: { [LOCATION_STATE_PARAM_PARENT_PAGE]: true },
    };
  }, []);

  return [backToParentPage, buildLinkWithState];
};

export default useBackToParentPage;
