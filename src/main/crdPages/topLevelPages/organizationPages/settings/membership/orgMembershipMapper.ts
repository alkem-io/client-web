import type { RolesOrganizationQuery } from '@/core/apollo/generated/graphql-schema';
import type { MembershipEnrichment } from '../../../userPages/settings/membership/useMembershipEnrichment';
import {
  collectSpaceIds,
  type MembershipRow,
  mapMembershipRows,
} from '../../../userPages/settings/membership/userMembershipMapper';

/** A card row of the organization Membership tab — the user tab's row shape. */
export type OrgMembershipRow = MembershipRow;

/**
 * Pure mapper: `rolesOrganization` payload + per-space enrichment → card rows.
 * Enrichment (banner, tagline, URL, leads, richer display name) is optional —
 * rows fall back to the query's data while it is still resolving.
 */
export const mapOrgMembershipRows = (
  data: RolesOrganizationQuery | undefined,
  enrichment: Map<string, MembershipEnrichment>
): OrgMembershipRow[] =>
  mapMembershipRows(data?.rolesOrganization.spaces ?? [], enrichment, subspace => subspace.displayName);

/** Every L0 and subspace id in the payload, in display order — drives `useMembershipEnrichment`. */
export const collectOrgMembershipSpaceIds = (data: RolesOrganizationQuery | undefined): string[] =>
  collectSpaceIds(data?.rolesOrganization.spaces ?? []);
