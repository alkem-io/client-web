import { useLocation } from 'react-router-dom';
import { NotAuthorizedError } from '@/core/40XErrorHandler/40XErrors';
import { AUTH_REQUIRED_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildReturnUrlParam } from '@/main/routing/urlBuilders';

/**
 * Gates the entire CRD Space Settings page on the viewer's `SpaceCan.update` verdict for the resolved space
 * (space-screens.tsv "space about: … privileges" → Space.can; it replaces the legacy `Update` privilege):
 *
 * - **Anonymous viewers** → `NotAuthorizedError` with a `redirectUrl`: silent redirect to the sign-in page with the
 *   `returnUrl` preserved.
 * - **Authenticated viewers without update** → `NotAuthorizedError` (no redirect): the CRD forbidden page.
 * - **Viewers with update** → no throw, the page renders.
 *
 * A space the viewer may not even read never gets here: the URL resolver refuses it (NOT_FOUND / FORBIDDEN).
 */
export function useSpaceSettingsAccessGuard(canUpdate: boolean | undefined, scopeLoading: boolean): void {
  const { pathname } = useLocation();
  const { isAuthenticated, loading: viewerLoading } = useCurrentUserContext();

  if (scopeLoading || viewerLoading || canUpdate !== false) return;
  if (!isAuthenticated) {
    throw new NotAuthorizedError({ redirectUrl: `${AUTH_REQUIRED_PATH}${buildReturnUrlParam(pathname)}` });
  }
  throw new NotAuthorizedError();
}
