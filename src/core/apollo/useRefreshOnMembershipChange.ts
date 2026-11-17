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
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

const CHECK_THROTTLE_MS = 5_000;

/** The user's space memberships and pending-invitation counts, as one comparable string. */
const readMembershipState = async (client: ApolloClient<object>, fetchPolicy: FetchPolicy): Promise<string> => {
  const context = { skipGlobalErrorHandler: true };
  const [memberships, invitations] = await Promise.all([
    client.query<LatestContributionsSpacesFlatQuery>({
      query: LatestContributionsSpacesFlatDocument,
      fetchPolicy,
      context,
    }),
    client.query<PendingInvitationsCountQuery>({ query: PendingInvitationsCountDocument, fetchPolicy, context }),
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
 * received, a direct add by an admin). If they did, every cached query is
 * dropped and the ones on screen are refetched, so the new privileges apply
 * without a reload or an app restart. Skipped for anonymous users.
 */
export const useRefreshOnMembershipChange = (): void => {
  const client = useApolloClient();
  const { isAuthenticated } = useCurrentUserContext();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Make sure the cache holds a state to compare against later.
    readMembershipState(client, 'cache-first').catch(() => {});

    let lastCheckAt = 0;
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastCheckAt < CHECK_THROTTLE_MS) return;
      lastCheckAt = now;
      try {
        const known = await readMembershipState(client, 'cache-first');
        const current = await readMembershipState(client, 'network-only');
        if (known === current) return;
        await client.refetchQueries({
          updateCache: cache => {
            cache.evict({ id: 'ROOT_QUERY' });
          },
        });
      } catch {
        // A failed background check changes nothing; the next foreground retries.
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [client, isAuthenticated]);
};
