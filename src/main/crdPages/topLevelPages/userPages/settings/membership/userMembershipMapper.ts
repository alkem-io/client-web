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
  /** Id of the space or subspace whose role set the Leave flow acts on. */
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

  const rows = mapMembershipRows(l0Spaces, enrichment, subspace => subspaceLabel(t, subspace.level, subspace.id));

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

type MembershipSpace<TSubspace> = {
  id: string;
  displayName: string;
  roles: ReadonlyArray<string>;
  subspaces: ReadonlyArray<TSubspace>;
};

/**
 * Shared row loop for the user and organization Membership tabs: each L0
 * space yields a Space row followed by one Subspace row per subspace the
 * contributor holds a role in. Leave is scoped to each row's own role set, so
 * a subspace row's `spaceId` is the subspace's id, never its parent's.
 */
export const mapMembershipRows = <TSubspace extends { id: string; roles: ReadonlyArray<string> }>(
  spaces: ReadonlyArray<MembershipSpace<TSubspace>>,
  enrichment: Map<string, MembershipEnrichment>,
  subspaceName: (subspace: TSubspace) => string
): MembershipRow[] => {
  const rows: MembershipRow[] = [];
  for (const space of spaces) {
    rows.push(toRow(space.id, space.displayName, space.roles, 'Space', enrichment));
    for (const subspace of space.subspaces) {
      rows.push(toRow(subspace.id, subspaceName(subspace), subspace.roles, 'Subspace', enrichment));
    }
  }
  return rows;
};

/** Every L0 + subspace id, in display order — drives `useMembershipEnrichment`. */
export const collectSpaceIds = (spaces: ReadonlyArray<MembershipSpace<{ id: string }>>): string[] =>
  spaces.flatMap(space => [space.id, ...space.subspaces.map(subspace => subspace.id)]);

export const collectMembershipSpaceIds = (contributions: UserContributionsQuery | undefined): string[] =>
  collectSpaceIds(contributions?.rolesUser.spaces ?? []);

const toRow = (
  id: string,
  fallbackName: string,
  roles: ReadonlyArray<string>,
  type: MembershipRow['type'],
  enrichment: Map<string, MembershipEnrichment>
): MembershipRow => {
  const enrich = enrichment.get(id);
  return {
    id,
    spaceId: id,
    displayName: enrich?.displayName ?? fallbackName,
    tagline: enrich?.tagline,
    bannerUrl: enrich?.bannerUrl,
    color: pickColorFromId(id),
    type,
    role: resolveRole(roles),
    spaceUrl: enrich?.spaceUrl ?? '',
    leadUsers: enrich?.leadUsers ?? [],
  };
};

export const resolveRole = (roles: ReadonlyArray<string>): MembershipRow['role'] => {
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
