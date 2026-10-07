import type { RolesOrganizationQuery } from '@/core/apollo/generated/graphql-schema';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { MembershipEnrichment } from '../../../userPages/settings/membership/useMembershipEnrichment';
import type { MembershipRow } from '../../../userPages/settings/membership/userMembershipMapper';

/**
 * A card row of the organization Membership tab. Same shape as the user tab's
 * row: `spaceId` is the id whose role set the Leave flow acts on — the
 * subspace's own id for a subspace card, never its parent's.
 */
export type OrgMembershipRow = MembershipRow;

/**
 * Pure mapper: `rolesOrganization` payload + per-space enrichment → card rows.
 * Each L0 space yields a Space row followed by one Subspace row per subspace
 * the organization holds a role in. Enrichment (banner, tagline, URL, leads,
 * richer display name) is optional — rows fall back to the query's data while
 * it is still resolving.
 */
export const mapOrgMembershipRows = (
  data: RolesOrganizationQuery | undefined,
  enrichment: Map<string, MembershipEnrichment>
): OrgMembershipRow[] => {
  const rows: OrgMembershipRow[] = [];
  for (const space of data?.rolesOrganization.spaces ?? []) {
    rows.push(toRow(space, 'Space', enrichment));
    for (const subspace of space.subspaces) {
      rows.push(toRow(subspace, 'Subspace', enrichment));
    }
  }
  return rows;
};

/** Every L0 and subspace id in the payload, in display order — drives `useMembershipEnrichment`. */
export const collectOrgMembershipSpaceIds = (data: RolesOrganizationQuery | undefined): string[] => {
  const ids: string[] = [];
  for (const space of data?.rolesOrganization.spaces ?? []) {
    ids.push(space.id);
    for (const subspace of space.subspaces) ids.push(subspace.id);
  }
  return ids;
};

/** An organization only ever holds Member and Lead in a space, so Lead is the one role that outranks Member. */
export const resolveOrgRole = (roles: ReadonlyArray<string>): OrgMembershipRow['role'] =>
  roles.some(role => role.toLowerCase() === RoleName.Lead.toLowerCase()) ? 'Lead' : 'Member';

const toRow = (
  space: { id: string; displayName: string; roles: ReadonlyArray<string> },
  type: OrgMembershipRow['type'],
  enrichment: Map<string, MembershipEnrichment>
): OrgMembershipRow => {
  const enrich = enrichment.get(space.id);
  return {
    id: space.id,
    spaceId: space.id,
    displayName: enrich?.displayName ?? space.displayName,
    tagline: enrich?.tagline,
    bannerUrl: enrich?.bannerUrl,
    color: pickColorFromId(space.id),
    type,
    role: resolveOrgRole(space.roles),
    spaceUrl: enrich?.spaceUrl ?? '',
    leadUsers: enrich?.leadUsers ?? [],
  };
};
