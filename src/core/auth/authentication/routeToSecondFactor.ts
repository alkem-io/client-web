import { isAuthRoutePathname } from './utils/isAuthRoutePathname';

export const SECOND_FACTOR_PATH = '/second-factor';

let navigationPending = false;

/**
 * Sends the browser to `/second-factor`, the one page a session refused for a
 * missing second factor is served. Every refusal signal (the id-token-hint
 * flag, a GraphQL `SECOND_FACTOR_REQUIRED`, a subscription closed with 4403)
 * calls this, often several at once, so it navigates once.
 *
 * The identity screens are served to a refused session as they are, like
 * `/second-factor` itself: Kratos hands an errored settings flow back through
 * `/settings?flow=`, which resumes it on `/second-factor`, and leaving that
 * screen would drop the flow and its error.
 */
export const routeToSecondFactor = () => {
  if (navigationPending || isAuthRoutePathname(window.location.pathname)) {
    return;
  }
  navigationPending = true;
  window.location.replace(SECOND_FACTOR_PATH);
};
