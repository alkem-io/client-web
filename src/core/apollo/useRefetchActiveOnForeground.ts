import { useApolloClient } from '@apollo/client';
import { useEffect } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

const REFETCH_THROTTLE_MS = 30_000;

/**
 * Refetches every active query when the page comes back to the foreground, at
 * most once per 30 s. Membership and privilege changes made elsewhere (an
 * invitation received, a direct add by an admin) then take effect without a
 * reload or an app restart. Skipped for anonymous users.
 */
export const useRefetchActiveOnForeground = (): void => {
  const client = useApolloClient();
  const { isAuthenticated } = useCurrentUserContext();

  useEffect(() => {
    if (!isAuthenticated) return;

    let lastRefetchAt = 0;
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastRefetchAt < REFETCH_THROTTLE_MS) return;
      lastRefetchAt = now;
      client.refetchQueries({ include: 'active' }).catch(() => {
        // Query errors are already surfaced by the Apollo error link.
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [client, isAuthenticated]);
};
