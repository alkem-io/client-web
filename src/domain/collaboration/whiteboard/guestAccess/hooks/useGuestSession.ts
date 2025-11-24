import { useEffect, useState } from 'react';
import { useGuestSessionContext } from '../context/GuestSessionContext';
import { anonymizeGuestName } from '../utils/anonymizeGuestName';
import { useCurrentUserFullQuery } from '@/core/apollo/generated/apollo-hooks';

/**
 * Hook for guest session management with auth cookie detection and derivation
 * Automatically derives anonymized guest name if user is authenticated
 */
export const useGuestSession = () => {
  const context = useGuestSessionContext();
  const [isDerived, setIsDerived] = useState(false);
  const [derivationAttempted, setDerivationAttempted] = useState(false);

  // Detect auth cookie
  const hasAuthCookie = typeof document !== 'undefined' && document.cookie.includes('ory_kratos_session=');

  // Fetch current user data only if authenticated
  const { data: userData, error: userError } = useCurrentUserFullQuery({
    skip: !hasAuthCookie || !!context.guestName || derivationAttempted,
  });

  useEffect(() => {
    // Only attempt derivation once
    if (derivationAttempted) return;

    // Check if guest name already exists
    if (context.guestName) {
      setDerivationAttempted(true);
      return;
    }

    // If not authenticated, mark as attempted
    if (!hasAuthCookie) {
      setDerivationAttempted(true);
      return;
    }

    // If the query errored, fallback to prompt
    if (userError) {
      setDerivationAttempted(true);
      return;
    }

    // If we have user data, attempt to derive guest name
    if (userData?.me) {
      const user = userData.me.user;

      if (user) {
        const { firstName, lastName } = user;
        const anonymized = anonymizeGuestName(firstName, lastName);

        if (anonymized) {
          context.setGuestName(anonymized);
          setIsDerived(true);
        }
      }

      setDerivationAttempted(true);
    }
  }, [context, derivationAttempted, hasAuthCookie, userData, userError]);

  return {
    ...context,
    isDerived,
    derivationAttempted,
  };
};

export { anonymizeGuestName } from '../utils/anonymizeGuestName';

/**
 * Clears guest session data when user signs in
 * Should be called before navigating to authentication flow
 * to prevent stale guest data from persisting after login
 */
export const clearGuestSessionOnSignIn = (): void => {
  if (typeof globalThis === 'undefined') {
    return;
  }

  const storage = globalThis.sessionStorage ?? globalThis.window?.sessionStorage;

  storage?.removeItem('alkemio_guest_name');
};
