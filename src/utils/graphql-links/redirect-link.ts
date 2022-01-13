import { onError } from '@apollo/client/link/error';
import { ServerParseError } from '@apollo/client';
import { logger } from '../../services/logging/winston/logger';
import { AUTH_LOGIN_PATH } from '../../models/constants';

/**
 * This link handles the flow of a changed cookie secret or an expired cookie:
 * When a graphql request is made the server rejects the credentials
 * and returns a 302 redirect response with a URL pointing to the login page.
 *
 * The network error is checked if it's a parse error,
 * the response has been redirected
 * and the response source url matches the auth login page.
 * The browser is redirected to the login page if the above criteria are met.
 */
export const redirectLink = onError(({ networkError, forward, operation }) => {
  if (!networkError) {
    return forward(operation);
  }

  const parseError = networkError as ServerParseError;
  if (parseError.response) {
    const { name, response } = parseError;

    if (name === 'ServerParseError' && response.redirected && response.url && response.url.includes(AUTH_LOGIN_PATH)) {
      window.location.replace(response.url);

      logger.error(new Error(`[ServerParseError]: ${parseError}`));
      logger.info(`[ServerParseError]: Redirecting to ${response.url}...`);
    }
  }

  return forward(operation);
});
export default redirectLink;
