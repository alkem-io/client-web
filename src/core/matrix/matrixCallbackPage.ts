import { handleMatrixCallback } from './matrixCallback';
import { getConfig } from './matrixConfig';

/**
 * The only legitimate visitor is the hidden silent-SSO frame: it exchanges the
 * token and persists the credentials, and the parent page detects success via
 * storage. Anything else — flag off, or the page opened top-level — has no
 * business here and goes home.
 */
const runMatrixCallbackPage = async (): Promise<void> => {
  if (getConfig().enabled && window.self !== window.top) {
    await handleMatrixCallback();
    return;
  }
  window.location.replace('/');
};

export { runMatrixCallbackPage };
