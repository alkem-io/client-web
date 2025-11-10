import { ApolloLink } from '@apollo/client';

/**
 * Apollo Link middleware to inject x-guest-name header for public routes
 * Reads guest name from session storage and adds it to GraphQL requests
 */
export const guestHeaderLink = new ApolloLink((operation, forward) => {
  // Only inject header for public whiteboard routes
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/public/whiteboard')) {
    try {
      const guestName = sessionStorage.getItem('alkemio_guest_name');

      if (guestName) {
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            'x-guest-name': guestName,
          },
        }));
      }
    } catch (error) {
      console.warn('Failed to read guest name from session storage:', error);
    }
  }

  return forward(operation);
});
