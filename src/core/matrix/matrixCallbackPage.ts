import { handleMatrixCallback } from './matrixCallback';
import { CALLBACK_ROUTE } from './ssoLogin';

const isMatrixCallbackPage = (): boolean => window.location.pathname === CALLBACK_ROUTE;

/**
 * Runs the SSO callback without booting the app: the page carries the
 * loginToken, so nothing that reports the URL (APM, Sentry) may start on it,
 * and inside the silent-SSO iframe a full second app would be pure waste.
 * Framed, the parent detects success via storage and nothing navigates;
 * top-level, the page leaves for the saved return path (home on failure).
 */
const runMatrixCallbackPage = async (): Promise<void> => {
  const framed = window.self !== window.top;
  let target = '/';
  try {
    const outcome = await handleMatrixCallback();
    if (outcome.ok && outcome.returnPath) {
      target = outcome.returnPath;
    }
  } catch {
    // Fall through to home: never strand the user on a blank callback page.
  }
  if (!framed) {
    window.location.replace(target);
  }
};

export { isMatrixCallbackPage, runMatrixCallbackPage };
