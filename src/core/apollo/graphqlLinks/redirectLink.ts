import { onError } from '@apollo/client/link/error';
import { ServerParseError } from '@apollo/client';
import { _AUTH_LOGIN_PATH } from '@/core/auth/authentication/constants/authentication.constants';

/**
 * This link handles the flow of a changed cookie secret or an expired cookie:
 * When a graphql request is made the server rejects the credentials
 * and returns a 302 redirect response with a URL pointing to the login page.
 *
 * The network error is checked if it's a parse error,
 * the response has been redirected
 * and the response source url matches the auth login page.
 * The browser is redirected to the login page if the above criteria are met.
 *
 * This function is called after the GraphQL operation completes and execution is moving back up your link chain.
 * The function should not return a value unless you want to retry the operation.
 */
export const redirectLink = onError(({ networkError }) => {
  if (!networkError) {
    return;
  }

  const parseError = networkError as ServerParseError;
  if (parseError.response) {
    const { name, response } = parseError;

    if (name === 'ServerParseError' && response.redirected && response.url && response.url.includes(_AUTH_LOGIN_PATH)) {
      window.location.replace(response.url);
    }
  }
});
export default redirectLink;
