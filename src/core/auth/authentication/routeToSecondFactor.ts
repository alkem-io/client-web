export const SECOND_FACTOR_PATH = '/second-factor';

let navigationPending = false;

/**
 * Sends the browser to `/second-factor`, the one page a session refused for a
 * missing second factor is served. Every refusal signal (the id-token-hint
 * flag, a GraphQL `SECOND_FACTOR_REQUIRED`, a subscription closed with 4403)
 * calls this, often several at once, so it navigates once.
 */
export const routeToSecondFactor = () => {
  if (navigationPending || window.location.pathname === SECOND_FACTOR_PATH) {
    return;
  }
  navigationPending = true;
  window.location.replace(SECOND_FACTOR_PATH);
};
