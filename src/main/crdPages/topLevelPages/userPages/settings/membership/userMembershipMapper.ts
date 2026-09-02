import type { TFunction } from 'i18next';
import type {
  UserContributionsQuery,
  UserPendingMembershipsQuery,
  UserSettingsQuery,
} from '@/core/apollo/generated/graphql-schema';
import { RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { LeadUser, MembershipEnrichment } from './useMembershipEnrichment';

/** Translator scoped to the contributor-settings namespace. */
export type ContributorSettingsTranslator = TFunction<'crd-contributorSettings'>;

export type MembershipRow = {
  id: string;
  /** L0 space id used by `useSpaceContributionDetailsLazyQuery` for the Leave flow. */
  spaceId: string;
  displayName: string;
  /** Optional tagline, surfaced as the card body text when present. */
  tagline?: string;
  /** Banner image URL for the card top. Falls back to a deterministic gradient when absent. */
  bannerUrl?: string;
  /** Deterministic accent colour (used as banner gradient + avatar fallback bg). */
  color: string;
  type: 'Space' | 'Subspace';
  role: 'Admin' | 'Lead' | 'Member';
  /** Public space URL for "View Space" / "View Subspace" navigation. */
  spaceUrl: string;
  /** Users who lead this space's community — rendered as the card's "Led by:" footer. Empty when the enrichment query hasn't resolved yet or the space has no leads. */
  leadUsers: LeadUser[];
};

export type HomeSpaceOption = { value: string; label: string };

export type PendingApplicationRow = {
  id: string;
  displayName: string;
  spaceUrl: string;
};

export type UserMembershipMappedData = {
  homeSpace: {
    options: HomeSpaceOption[];
    selectedSpaceId: string | null;
    autoRedirect: boolean;
    canEnableAutoRedirect: boolean;
  };
  rows: MembershipRow[];
  pendingApplications: PendingApplicationRow[];
};

/**
 * Pure mapper: GraphQL data + i18n → view data. Used by both the per-tab
 * data hook (for filtering / leave dialog state) and the integration page.
 *
 * Mirrors the existing MUI `UserAdminMembershipPage` reading pattern:
 * - `useUserContributionsQuery().rolesUser.spaces[]` provides L0 spaces +
 *   their subspaces with `roles[]` per row.
 * - `useUserSettingsQuery().lookup.user.settings.homeSpace` provides
 *   `{spaceID, autoRedirect}`.
 * - `useUserPendingMembershipsQuery().me.communityApplications[]` provides
 *   pending applications.
 *
 * Role resolution: pick the highest-precedence role from `roles[]`
 * (Admin > Lead > Member). Falls back to `'Member'` if none match.
 */
export const mapUserMembershipData = (
  contributions: UserContributionsQuery | undefined,
  settings: UserSettingsQuery | undefined,
  pending: UserPendingMembershipsQuery | undefined,
  /**
   * Per-row profile enrichment from `useMembershipEnrichment` (which fans
   * out `useSpaceContributionDetailsQuery({spaceId})` calls — same source
   * MUI's `ContributionCard` reads). Pass an empty map while the queries
   * are still in flight.
   */
  enrichment: Map<string, MembershipEnrichment>,
  t: ContributorSettingsTranslator
): UserMembershipMappedData => {
  const l0Spaces = contributions?.rolesUser.spaces ?? [];

  const options: HomeSpaceOption[] = l0Spaces.map(space => ({
    value: space.id,
    label: space.displayName,
  }));

  const selectedSpaceId = settings?.lookup.user?.settings?.homeSpace?.spaceID ?? null;
  const autoRedirect = settings?.lookup.user?.settings?.homeSpace?.autoRedirect ?? false;

  const rows: MembershipRow[] = [];
  for (const space of l0Spaces) {
    const enrich = enrichment.get(space.id);
    rows.push({
      id: space.id,
      spaceId: space.id,
      displayName: enrich?.displayName ?? space.displayName,
      tagline: enrich?.tagline,
      bannerUrl: enrich?.bannerUrl,
      color: pickColorFromId(space.id),
      type: 'Space',
      role: resolveRole(space.roles),
      spaceUrl: enrich?.spaceUrl ?? '',
      leadUsers: enrich?.leadUsers ?? [],
    });
    for (const subspace of space.subspaces) {
      const subEnrich = enrichment.get(subspace.id);
      rows.push({
        id: subspace.id,
        // Leave is scoped to the SUBSPACE's own role-set (not the L0
        // parent's) — each subspace has its own community / role-set.
        spaceId: subspace.id,
        displayName: subEnrich?.displayName ?? subspaceLabel(t, subspace.level, subspace.id),
        tagline: subEnrich?.tagline,
        bannerUrl: subEnrich?.bannerUrl,
        color: pickColorFromId(subspace.id),
        type: 'Subspace',
        role: resolveRole(subspace.roles),
        spaceUrl: subEnrich?.spaceUrl ?? '',
        leadUsers: subEnrich?.leadUsers ?? [],
      });
    }
  }

  const pendingApplications: PendingApplicationRow[] =
    pending?.me.communityApplications.map(app => ({
      id: app.id,
      displayName: app.spacePendingMembershipInfo.about.profile.displayName,
      spaceUrl: app.spacePendingMembershipInfo.about.profile.url,
    })) ?? [];

  return {
    homeSpace: {
      options,
      selectedSpaceId,
      autoRedirect,
      canEnableAutoRedirect: Boolean(selectedSpaceId),
    },
    rows,
    pendingApplications,
  };
};

/**
 * Helper: collect every L0 + subspace id from a contributions payload.
 * Used by the integration page to drive `useMembershipEnrichment`.
 */
export const collectMembershipSpaceIds = (contributions: UserContributionsQuery | undefined): string[] => {
  const ids: string[] = [];
  for (const space of contributions?.rolesUser.spaces ?? []) {
    ids.push(space.id);
    for (const sub of space.subspaces) ids.push(sub.id);
  }
  return ids;
};

const resolveRole = (roles: ReadonlyArray<string>): MembershipRow['role'] => {
  const lower = roles.map(r => r.toLowerCase());
  if (lower.includes(RoleName.Admin.toLowerCase())) return 'Admin';
  if (lower.includes(RoleName.Lead.toLowerCase())) return 'Lead';
  return 'Member';
};

const subspaceLabel = (t: ContributorSettingsTranslator, level: SpaceLevel, id: string): string => {
  // Only the id is available without a follow-up query; use an i18n-driven
  // placeholder that includes a short id slice to keep rows distinguishable.
  const shortId = id.slice(0, 8);
  return level === SpaceLevel.L1
    ? t('user.membership.subspaceFallbackL1', { id: shortId })
    : t('user.membership.subspaceFallbackL2', { id: shortId });
};

/**
 * Filter mapped rows. Pure — exposed separately so the hook can call it on
 * every render without re-mapping the GraphQL payload. The membership grid
 * shows ALL filtered rows (no pagination — matches the prototype's "Load
 * More" pattern, which we implement on top via `visibleCount` if needed).
 */
export const filterMemberships = (
  rows: MembershipRow[],
  search: string,
  filter: 'all' | 'spaces' | 'subspaces'
): MembershipRow[] => {
  const term = search.trim().toLowerCase();
  return rows.filter(row => {
    if (filter === 'spaces' && row.type !== 'Space') return false;
    if (filter === 'subspaces' && row.type !== 'Subspace') return false;
    if (term.length > 0 && !row.displayName.toLowerCase().includes(term)) return false;
    return true;
  });
};
