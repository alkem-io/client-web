import { To, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { LinkWithState } from '@/domain/shared/types/LinkWithState';
import useNavigate from '@/core/routing/useNavigate';

const LOCATION_STATE_PARAM_PARENT_PAGE = 'parentPage';

export type ReturnTuple = [() => void, (url: string) => LinkWithState];

interface Options {
  keepScroll?: boolean;
}

/**
 * @deprecated - try to start using useBackToPath instead which doesn't require to navigate forward in a special way
 * Returns a tuple of 2 functions:
 * First is a callback that takes a user to the previous page only if the user got to the current page from that parent.
 * Second is a function that produces a link with history item state that holds the info about the parent page.
 * Useful for scenarios when there's a back navigation action, but we really only want to go back when "back" leads
 * to the given "parent" page. E.g. we may not want to go "back" when current page was opened in a new tab.
 * @param parentPageUrl
 */
const useBackToParentPage = (parentPageUrl: string, { keepScroll }: Options = {}): ReturnTuple => {
  const navigate = useNavigate();
  const location = useLocation();

  const backToParentPage = useCallback(() => {
    const { parentPage } = (location.state ?? {}) as { [LOCATION_STATE_PARAM_PARENT_PAGE]?: unknown };
    if (parentPage) {
      navigate(-1 as To, { state: { keepScroll } });
    } else {
      navigate(parentPageUrl, { replace: true, state: { keepScroll } });
    }
  }, [parentPageUrl, location, keepScroll, navigate]);

  const buildLinkWithState = useCallback(
    (url: string): LinkWithState => {
      return {
        to: url,
        state: { [LOCATION_STATE_PARAM_PARENT_PAGE]: true, keepScroll },
      };
    },
    [keepScroll]
  );

  return [backToParentPage, buildLinkWithState];
};

export default useBackToParentPage;
