import { ApolloLink } from '@apollo/client';
import { encodeToBase64 } from '@/core/utils/encodeToBase64';

/**
 * Apollo Link middleware to inject x-guest-name header for public routes
 * Reads guest name from session storage and adds it to GraphQL requests
 */

export const guestHeaderLink = new ApolloLink((operation, forward) => {
  // Only inject header for public whiteboard routes
  if (globalThis.window?.location.pathname.startsWith('/public/whiteboard')) {
    try {
      const guestName = globalThis.sessionStorage.getItem('alkemio_guest_name');

      if (guestName) {
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            'x-guest-name': encodeToBase64(guestName),
          },
        }));
      }
    } catch (error) {
      console.warn('Failed to read guest name from session storage:', error);
    }
  }

  return forward(operation);
});
