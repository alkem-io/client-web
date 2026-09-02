import type { VcMembershipsQuery } from '@/core/apollo/generated/graphql-schema';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type {
  VcMembershipRow,
  VcPendingInvitationRow,
} from '@/crd/components/virtualContributor/settings/VCMembershipTabView.types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

type EnrichmentEntry = {
  displayName: string;
  tagline?: string;
  bannerUrl?: string;
  spaceUrl?: string;
  roleSetId?: string;
};

/**
 * Build the confirmed-memberships rows from `useVcMembershipsQuery` +
 * per-space enrichment supplied by the caller (the integration page batches
 * `useSpaceContributionDetailsQuery` via the existing `useMembershipEnrichment`
 * hook, same as User Membership).
 *
 * For each L0 space we emit a `type: 'space'` row; subspaces produce
 * `type: 'subspace'` rows with their own ids. The Leave dialog uses
 * `spaceId` (not the row id) to scope role-set lookup.
 */
export const mapVcMembershipsToRows = (
  data: VcMembershipsQuery | undefined,
  enrichment: Map<string, EnrichmentEntry>
): VcMembershipRow[] => {
  const spaces = data?.rolesVirtualContributor.spaces ?? [];
  const rows: VcMembershipRow[] = [];
  for (const space of spaces) {
    const e = enrichment.get(space.id);
    rows.push({
      id: space.id,
      spaceId: space.id,
      displayName: e?.displayName ?? '',
      type: 'space',
      tagline: e?.tagline,
      spaceUrl: e?.spaceUrl,
      bannerUrl: e?.bannerUrl,
      color: pickColorFromId(space.id),
    });
    for (const subspace of space.subspaces ?? []) {
      const se = enrichment.get(subspace.id);
      rows.push({
        id: subspace.id,
        spaceId: subspace.id,
        displayName: se?.displayName ?? '',
        type: 'subspace',
        tagline: se?.tagline,
        spaceUrl: se?.spaceUrl,
        bannerUrl: se?.bannerUrl,
        color: pickColorFromId(subspace.id),
      });
    }
  }
  return rows;
};

/**
 * Pending invitations addressed to this VC: filter on `actor.type === VirtualContributor`
 * AND `actor.id === vcId` (mirrors MUI `VCMembershipPage` filter).
 */
export const mapVcPendingInvitationsToRows = (
  data: VcMembershipsQuery | undefined,
  vcId: string | undefined
): VcPendingInvitationRow[] => {
  if (!data || !vcId) return [];
  const invitations = data.me?.communityInvitations ?? [];
  return invitations
    .filter(inv => inv.invitation.actor.type === ActorType.VirtualContributor && inv.invitation.actor.id === vcId)
    .map(inv => {
      const spaceId = inv.spacePendingMembershipInfo.id;
      const aboutAny = inv.spacePendingMembershipInfo.about as
        | { profile?: { displayName?: string; cardBanner?: { uri?: string } } }
        | undefined;
      const profile = aboutAny?.profile;
      return {
        id: inv.id,
        spaceDisplayName: profile?.displayName ?? '',
        bannerUrl: profile?.cardBanner?.uri,
        color: pickColorFromId(spaceId),
        welcomeMessage: inv.invitation.welcomeMessage ?? undefined,
      };
    });
};

/** Collect all space ids (including subspace ids) for per-row enrichment. */
export const collectSpaceIds = (data: VcMembershipsQuery | undefined): string[] => {
  const ids: string[] = [];
  for (const space of data?.rolesVirtualContributor.spaces ?? []) {
    ids.push(space.id);
    for (const sub of space.subspaces ?? []) ids.push(sub.id);
  }
  return ids;
};
