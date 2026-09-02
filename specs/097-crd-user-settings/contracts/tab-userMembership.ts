/**
 * User Membership tab — view contracts.
 * See data-model.md "User Story 3" for field-level details.
 *
 * Post-implementation revision: the My Memberships section is a **card grid**,
 * not a table (matches `prototype/src/app/pages/UserMembershipPage.tsx`).
 * Per-row enrichment (banner / tagline / leadUsers / roleSetID) flows
 * through `useMembershipEnrichment` (research §13) which fans out
 * `useSpaceContributionDetailsQuery({spaceId})` per row.
 */

export type HomeSpaceCardProps = {
  /** Title — i18n: "Home Space". */
  title: string;
  /** Description below title — i18n. */
  description: string;
  options: Array<{ value: string; label: string }>;
  selectedSpaceId: string | null;
  /** True while updateUserSettings is in flight; spinner replaces the controls. */
  saving: boolean;
  autoRedirect: boolean;
  /** Disabled when no Home Space is selected. */
  autoRedirectDisabled: boolean;
  /** Caption shown beneath the disabled checkbox — i18n: "Select a home space to enable auto-redirect". */
  autoRedirectDisabledCaption: string;
  onSelectSpace: (spaceId: string | null) => void;
  onToggleAutoRedirect: (next: boolean) => void;
};

/** Type axis only — status (`Active / Archived`) is intentionally not exposed (see FR-043). */
export type MembershipFilter = 'all' | 'spaces' | 'subspaces';

/** A user who leads the space's community — rendered in the card's "Led by:" footer. */
export type MembershipLeadUser = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type MembershipRow = {
  id: string;
  displayName: string;
  /** Tagline shown as the card body (`line-clamp-2`). Resolved via `useSpaceContributionDetailsQuery` enrichment; absent until the query resolves. */
  tagline?: string;
  /** Banner image URL (`cardBanner.uri`); when absent the card renders a deterministic gradient from `color`. */
  bannerUrl?: string;
  /** Deterministic accent colour from `pickColorFromId(id)`. */
  color: string;
  type: 'Space' | 'Subspace';
  role: 'Admin' | 'Lead' | 'Member';
  /** Public space URL — used by the "View Space" / "View Subspace" menu item. Empty until enrichment resolves; the View entry is hidden in that case. */
  spaceUrl: string;
  /** Lead users for the "Led by:" footer (max 3 visible + `+N` overflow). Empty array hides the footer. */
  leadUsers: MembershipLeadUser[];
};

export type MembershipsGridProps = {
  rows: MembershipRow[];
  /** Total filtered rows currently rendered (== `rows.length`); kept for the "Showing X of Y" caption. */
  totalShown: number;
  /** Total unfiltered rows — drives the FR-018 untouched-empty caption vs. the filtered-empty CTA block. */
  totalUnfiltered: number;
  search: string;
  filter: MembershipFilter;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: MembershipFilter) => void;
  /** Resets both `search` and `filter` to defaults — wired to the empty-state "Clear Filters" CTA. */
  onClearFilters: () => void;
  /** Opens the destructive Leave confirmation dialog (Rule #9). */
  onLeave: (row: MembershipRow) => void;
  loading: boolean;
};

export type PendingApplicationRow = {
  id: string;
  displayName: string;
  /** Public space URL — the row name links here. */
  spaceUrl: string;
};

export type PendingApplicationsListProps = {
  rows: PendingApplicationRow[];
  /** i18n caption shown when the list is empty (FR-018). */
  emptyStateLabel: string;
  loading: boolean;
};

export type UserMembershipViewProps = {
  homeSpace: HomeSpaceCardProps;
  memberships: MembershipsGridProps;
  pendingApplications: PendingApplicationsListProps;
};
