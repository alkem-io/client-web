/**
 * Public types for `MembershipsSection` — the membership list shared by
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
  /** Space avatar; the row falls back to an initials tile in `color`. */
  avatarUrl?: string;
  /** Deterministic accent colour (`pickColorFromId`) for the initials fallback. */
  color: string;
  type: 'Space' | 'Subspace';
  role: 'Admin' | 'Lead' | 'Member';
  /** Public space URL — the row's name links to it when non-empty. */
  spaceUrl: string;
  /** Users who lead this space — the row's "Led by:" avatars. Empty array hides the line. */
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
  roleLabel: (role: MembershipRowData['role']) => string;
  leave: string;
  /** Names the space the Leave button acts on, so screen-reader button lists tell the rows apart. */
  leaveAriaLabel: (displayName: string) => string;
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
