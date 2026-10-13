/**
 * Public types for `MembershipsSection` — the membership card grid shared by
 * the user and organization Membership tabs. Plain TypeScript — no GraphQL
 * types, no Apollo imports.
 */

export type MembershipLeadUserData = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type MembershipRowData = {
  id: string;
  displayName: string;
  /** Optional tagline rendered as the card body description. */
  tagline?: string;
  /** Banner image URL when available; falls back to a gradient from `color`. */
  bannerUrl?: string;
  color: string;
  type: 'Space' | 'Subspace';
  role: 'Admin' | 'Lead' | 'Member';
  /** Public space URL — used by the row name link and "View {{type}}" menu item (when non-empty). */
  spaceUrl: string;
  /** Users who lead this space — rendered in the card footer. Empty array hides the footer. */
  leadUsers: MembershipLeadUserData[];
};

export type MembershipFilter = 'all' | 'spaces' | 'subspaces';

/**
 * Every user-visible string of the grid, resolved by the consuming tab's
 * integration layer so the shared component stays label-free.
 */
export type MembershipsSectionLabels = {
  searchPlaceholder: string;
  filterAll: string;
  filterSpaces: string;
  filterSubspaces: string;
  summary: (shown: number, total: number) => string;
  filteredEmptyTitle: string;
  filteredEmptyDescription: string;
  clearFilters: string;
  /** Muted caption shown when there are no memberships at all. */
  emptyCaption: string;
  typeSpace: string;
  typeSubspace: string;
  roleLabel: (role: MembershipRowData['role']) => string;
  viewLabel: (typeLabel: string) => string;
  leaveLabel: (typeLabel: string) => string;
  /** Names the card the menu acts on, so screen-reader button lists tell the cards apart. */
  menuTriggerAriaLabel: (displayName: string) => string;
  ledBy: string;
  ledByAria: (count: number) => string;
  leadsMore: (count: number) => string;
};

export type MembershipsSectionProps = {
  rows: MembershipRowData[];
  totalShown: number;
  totalUnfiltered: number;
  search: string;
  filter: MembershipFilter;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: MembershipFilter) => void;
  onClearFilters: () => void;
  onLeave: (row: MembershipRowData) => void;
  labels: MembershipsSectionLabels;
};
