import { type ApolloClient, type FetchPolicy, useApolloClient } from '@apollo/client';
import { useEffect } from 'react';
import {
  LatestContributionsSpacesFlatDocument,
  PendingInvitationsCountDocument,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  LatestContributionsSpacesFlatQuery,
  PendingInvitationsCountQuery,
} from '@/core/apollo/generated/graphql-schema';
import { OWN_ERROR_HANDLING } from '@/core/apollo/graphqlLinks/ownErrorHandling';
import { dropCachedQueries } from '@/core/apollo/utils/dropCachedQueries';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

const CHECK_THROTTLE_MS = 5_000;

/** The user's space memberships and pending-invitation counts, as one comparable string. */
const readMembershipState = async (client: ApolloClient<object>, fetchPolicy: FetchPolicy): Promise<string> => {
  const [memberships, invitations] = await Promise.all([
    client.query<LatestContributionsSpacesFlatQuery>({
      query: LatestContributionsSpacesFlatDocument,
      fetchPolicy,
      context: OWN_ERROR_HANDLING,
    }),
    client.query<PendingInvitationsCountQuery>({
      query: PendingInvitationsCountDocument,
      fetchPolicy,
      context: OWN_ERROR_HANDLING,
    }),
  ]);
  return JSON.stringify([
    memberships.data.me.spaceMembershipsFlat.map(membership => membership.id).sort(),
    invitations.data.me.communityInvitationsCount,
    invitations.data.me.organizationInvitationsCount,
  ]);
};

/**
 * When the page comes back to the foreground, checks whether the user's space
 * memberships or pending invitations changed while it was away (an invitation
 * received, a direct add by an admin). If they did, the cache is emptied
 * and the queries on screen are refetched, so the new privileges apply
 * without a reload or an app restart. Skipped for anonymous users.
 */
export const useRefreshOnMembershipChange = (): void => {
  const client = useApolloClient();
  const { isAuthenticated } = useCurrentUserContext();

  useEffect(() => {
    if (!isAuthenticated) return;

    // The state the screen was last brought up to date with. Kept here, not in the Apollo
    // cache, because every refresh empties the cache. Undefined until the first read
    // succeeds, which then counts as a change.
    let known: string | undefined;
    readMembershipState(client, 'cache-first')
      .then(state => {
        known ??= state;
      })
      .catch(() => {});

    let lastCheckAt = 0;
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastCheckAt < CHECK_THROTTLE_MS) return;
      lastCheckAt = now;
      try {
        const current = await readMembershipState(client, 'network-only');
        if (current !== known) await client.refetchQueries({ updateCache: dropCachedQueries });
        // Recorded only after the refresh succeeded, so a failed one is retried.
        known = current;
      } catch {
        // A failed check or refresh changes nothing; the next foreground retries.
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [client, isAuthenticated]);
};
