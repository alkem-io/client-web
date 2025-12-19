import { ApolloLink } from '@apollo/client';

/**
 * Apollo Link middleware to inject x-guest-name header for public routes
 * Reads guest name from session storage and adds it to GraphQL requests
 */
/**
 * Encodes a string to Base64, handling Unicode characters properly.
 * This is necessary because HTTP headers only support ISO-8859-1 characters.
 */
const encodeToBase64 = (str: string): string => {
  // TextEncoder converts the string to UTF-8 bytes
  const bytes = new TextEncoder().encode(str);
  // Convert bytes to a binary string
  const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  // Encode to Base64
  return btoa(binaryString);
};

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
