import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { OrgEnrichment } from './useOrganizationEnrichment';

export type OrgRowRole = 'Admin' | 'Associate';

export type OrgRow = {
  id: string;
  displayName: string;
  /** Org logo URL. Falls back to a deterministic accent color initials tile when absent. */
  avatarUrl?: string;
  /** Tagline shown as the card body description (`line-clamp-2`). */
  tagline?: string;
  /** Concatenated "City, Country" when present. */
  location?: string;
  /** Deterministic accent colour. Used as the banner-area gradient and avatar fallback bg. */
  color: string;
  role: OrgRowRole;
  verified: boolean;
  /** Public organization profile URL. */
  profileUrl: string;
  /** Associates (members) count. `undefined` when not yet enriched. */
  associatesCount?: number;
  /** RoleSet id — consumed by the Disassociate flow. */
  roleSetId: string;
};

/**
 * Map a list of organization ids + their enrichment payloads to view rows.
 * Ids missing from the enrichment map (queries still resolving) render a
 * lean placeholder row that still has a stable `id` + `color` so the grid
 * layout doesn't shift when data arrives.
 */
export const mapUserOrganizations = (
  organizationIds: ReadonlyArray<string>,
  enrichment: Map<string, OrgEnrichment>
): OrgRow[] =>
  organizationIds.map(id => {
    const enrich = enrichment.get(id);
    const role: OrgRowRole = enrich?.myRoles.includes(RoleName.Admin) ? 'Admin' : 'Associate';
    return {
      id,
      displayName: enrich?.displayName ?? '',
      avatarUrl: enrich?.avatarUrl,
      tagline: enrich?.tagline,
      location: enrich?.location,
      color: pickColorFromId(id),
      role,
      verified: enrich?.verified ?? false,
      profileUrl: enrich?.profileUrl ?? '',
      associatesCount: enrich?.associatesCount,
      roleSetId: enrich?.roleSetId ?? '',
    };
  });

/** Filter rows by case-insensitive substring on displayName + location. */
export const filterOrganizations = (rows: OrgRow[], search: string): OrgRow[] => {
  const term = search.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter(row => {
    if (row.displayName.toLowerCase().includes(term)) return true;
    if (row.location?.toLowerCase().includes(term)) return true;
    return false;
  });
};
