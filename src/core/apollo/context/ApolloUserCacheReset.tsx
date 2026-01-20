import { useApolloClient } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

/**
 * Resets Apollo cache when user identity changes.
 * This prevents stale data from previous user sessions bleeding into new sessions.
 * Handles: proper logout, session expiry, account switching, etc.
 */
export const ApolloUserCacheReset = () => {
  const client = useApolloClient();
  const { userModel } = useCurrentUserContext();
  const previousUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const currentUserId = userModel?.id;
    const previousUserId = previousUserIdRef.current;

    // Only reset if user actually changed (not on initial load)
    if (previousUserId !== undefined && previousUserId !== currentUserId) {
      client.resetStore();
    }

    previousUserIdRef.current = currentUserId;
  }, [userModel?.id, client]);

  return null;
};
