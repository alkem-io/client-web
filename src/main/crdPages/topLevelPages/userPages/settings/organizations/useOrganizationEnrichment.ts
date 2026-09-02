import { useApolloClient } from '@apollo/client';
import { useEffect, useState } from 'react';
import { AssociatedOrganizationDocument } from '@/core/apollo/generated/apollo-hooks';
import type {
  AssociatedOrganizationQuery,
  AssociatedOrganizationQueryVariables,
  RoleName,
} from '@/core/apollo/generated/graphql-schema';

export type OrgEnrichment = {
  /** GraphQL Organization id (same key the map uses). */
  id: string;
  displayName: string;
  /** Org logo / avatar URL (square). */
  avatarUrl?: string;
  /** Tagline rendered in the card body. */
  tagline?: string;
  /** Free-text description (longer than tagline; not currently surfaced in the card but available to consumers). */
  description?: string;
  /** Concatenated `city, country` when both are present; whichever is non-empty otherwise. */
  location?: string;
  /** Public organization profile URL — drives "View Profile" + the row name link. */
  profileUrl: string;
  /** Verified manual-attestation flag. Read-only — the badge has no edit affordance (Decision #12 / FR-094). */
  verified: boolean;
  /** Associates metric (count). When unavailable the card footer omits the count. */
  associatesCount?: number;
  /** RoleSet id — used by `removeRoleFromUser` to disassociate. */
  roleSetId: string;
  /** The roles the current user holds in this org. Drives the role badge ("Admin" vs "Associate"). */
  myRoles: RoleName[];
};

/**
 * Per-row enrichment fetcher for the User Organizations tab. Mirrors the
 * MUI `useAssociatedOrganization` pattern (each card lazy-fetches its own
 * `useAssociatedOrganizationQuery`), but batched from the integration
 * layer so the CRD card stays pure presentational.
 *
 * Apollo's request-deduplication + cache means re-firing the same query
 * for already-cached org ids is a no-op. The hook stores enrichment in
 * local state so the parent re-renders with the populated map as queries
 * resolve.
 */
export const useOrganizationEnrichment = (organizationIds: ReadonlyArray<string>): Map<string, OrgEnrichment> => {
  const client = useApolloClient();
  const [enrichment, setEnrichment] = useState<Map<string, OrgEnrichment>>(() => new Map());

  // Stable string key so the effect only re-fires when the SET of ids changes.
  const idsKey = [...organizationIds].sort().join(',');

  useEffect(() => {
    let cancelled = false;
    if (organizationIds.length === 0) return;

    void Promise.all(
      organizationIds.map(organizationId =>
        client
          .query<AssociatedOrganizationQuery, AssociatedOrganizationQueryVariables>({
            query: AssociatedOrganizationDocument,
            variables: { organizationId },
            fetchPolicy: 'cache-first',
          })
          .then(result => {
            const org = result.data?.lookup.organization;
            if (!org) return null;
            const profile = org.profile;
            const associatesMetric = org.metrics?.find(m => m.name === 'associates');
            const associatesCount = associatesMetric ? Number(associatesMetric.value) : undefined;
            const city = profile?.location?.city ?? '';
            const country = profile?.location?.country ?? '';
            const location = [city, country].filter(Boolean).join(', ') || undefined;
            return [
              organizationId,
              {
                id: organizationId,
                displayName: profile?.displayName ?? '',
                avatarUrl: profile?.avatar?.uri,
                tagline: profile?.tagline,
                description: profile?.description,
                location,
                profileUrl: profile?.url ?? '',
                // `OrganizationVerificationEnum.VerifiedManualAttestation` is the
                // single positive value; everything else (`NotVerified`,
                // `VerificationPending`) renders the badge off.
                verified: org.verification.status === 'VERIFIED_MANUAL_ATTESTATION',
                associatesCount: Number.isFinite(associatesCount) ? associatesCount : undefined,
                roleSetId: org.roleSet.id,
                myRoles: org.roleSet.myRoles ?? [],
              } satisfies OrgEnrichment,
            ] as const;
          })
          .catch(() => null)
      )
    ).then(entries => {
      if (cancelled) return;
      const next = new Map<string, OrgEnrichment>();
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

export default useOrganizationEnrichment;
