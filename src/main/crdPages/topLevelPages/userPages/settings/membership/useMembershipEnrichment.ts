import { useApolloClient } from '@apollo/client';
import { useEffect, useState } from 'react';
import { SpaceContributionDetailsDocument } from '@/core/apollo/generated/apollo-hooks';
import type {
  SpaceContributionDetailsQuery,
  SpaceContributionDetailsQueryVariables,
} from '@/core/apollo/generated/graphql-schema';

export type LeadUser = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  /** Public profile URL — surfaced as a tooltip / link in future iterations. */
  profileUrl: string;
};

export type MembershipEnrichment = {
  displayName: string;
  tagline?: string;
  bannerUrl?: string;
  spaceUrl: string;
  /** roleSetID — used by the Leave flow to scope `removeRoleFromUser`. */
  roleSetId?: string;
  /** Users who lead the space's community — rendered as the card's "Led by:" footer. */
  leadUsers: LeadUser[];
};

/**
 * Per-row enrichment fetcher. Mirrors the existing MUI `ContributionCard`
 * pattern (it calls `useSpaceContributionDetailsQuery({spaceId})` per card)
 * but batches all queries from the integration layer so the CRD card stays
 * pure presentational.
 *
 * Apollo's request-deduplication + cache means re-firing the same query
 * for already-cached space ids is a no-op. The hook stores enrichment in
 * local state so the parent re-renders with the populated map as queries
 * resolve.
 *
 * Works for any viewer (the query takes `spaceId` only — no `userId`
 * variable to scope, unlike `useDashboardWithMembershipsQuery`).
 */
export const useMembershipEnrichment = (spaceIds: ReadonlyArray<string>): Map<string, MembershipEnrichment> => {
  const client = useApolloClient();
  const [enrichment, setEnrichment] = useState<Map<string, MembershipEnrichment>>(() => new Map());

  // Stable string key so the effect only re-fires when the SET of ids changes.
  const idsKey = [...spaceIds].sort().join(',');

  useEffect(() => {
    let cancelled = false;
    if (spaceIds.length === 0) return;

    void Promise.all(
      spaceIds.map(spaceId =>
        client
          .query<SpaceContributionDetailsQuery, SpaceContributionDetailsQueryVariables>({
            query: SpaceContributionDetailsDocument,
            variables: { spaceId },
            // Re-use Apollo's cache — most spaces will already be cached after the
            // first visit. `cache-first` is the default but we make it explicit.
            fetchPolicy: 'cache-first',
          })
          .then(result => {
            const space = result.data?.lookup.space;
            if (!space) return null;
            const profile = space.about.profile;
            const leadUsers: LeadUser[] = (space.about.membership?.leadUsers ?? [])
              .filter(u => Boolean(u.profile))
              .map(u => ({
                id: u.id,
                displayName: u.profile?.displayName ?? '',
                avatarUrl: u.profile?.avatar?.uri,
                profileUrl: u.profile?.url ?? '',
              }));
            return [
              spaceId,
              {
                displayName: profile.displayName,
                tagline: profile.tagline,
                // cardBanner is the right asset for card-sized previews; if a
                // space hasn't uploaded one, fall back to undefined so the
                // deterministic gradient takes over.
                bannerUrl: profile.cardBanner?.uri,
                spaceUrl: profile.url,
                roleSetId: space.about.membership?.roleSetID,
                leadUsers,
              } satisfies MembershipEnrichment,
            ] as const;
          })
          .catch(() => null)
      )
    ).then(entries => {
      if (cancelled) return;
      const next = new Map<string, MembershipEnrichment>();
      for (const entry of entries) {
        if (entry) next.set(entry[0], entry[1]);
      }
      setEnrichment(next);
    });

    return () => {
      cancelled = true;
    };
  }, [client, idsKey]);

  return enrichment;
};

export default useMembershipEnrichment;
