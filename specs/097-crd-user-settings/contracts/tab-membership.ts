/**
 * CRD Membership tab contracts.
 *
 * File location at implementation time:
 *   src/crd/components/user/settings/tabs/MembershipView.tsx
 *   src/crd/components/user/settings/tabs/HomeSpaceCard.tsx
 *   src/crd/components/user/settings/tabs/MembershipsTable.tsx
 *   src/crd/components/user/settings/tabs/PendingApplicationsTable.tsx
 */

export type HomeSpaceCardProps = {
  options: { id: string; displayName: string }[];
  selectedSpaceId: string | null;
  autoRedirect: boolean;
  /** Disabled until a Home Space is selected. */
  autoRedirectDisabled: boolean;
  /** i18n-resolved disabled reason caption. */
  autoRedirectDisabledReason: string | null;
  /** Spinner overlays the active control while the underlying mutation is in flight. */
  saving: boolean;
  onSelectSpace: (next: string | null) => void;
  onToggleAutoRedirect: (next: boolean) => void;
};

export type MembershipFilter = 'all' | 'spaces' | 'subspaces' | 'active' | 'archived';

export type MembershipRow = {
  id: string;
  displayName: string;
  spaceUrl: string;
  type: 'Space' | 'Subspace';
  description: string | null;
  role: string;
  memberCount: number;
  status: 'Active' | 'Archived';
  avatarImageUrl: string | null;
};

export type MembershipsTableProps = {
  rows: MembershipRow[];
  totalRows: number;
  search: string;
  onSearchChange: (next: string) => void;
  filter: MembershipFilter;
  onFilterChange: (next: MembershipFilter) => void;
  page: number;
  pageSize: 10;
  onPageChange: (next: number) => void;
  /** Opens the CRD ConfirmationDialog flow; mutation fires on Confirm. */
  onLeaveRow: (row: MembershipRow) => void;
};

export type PendingApplicationRow = {
  id: string;
  spaceDisplayName: string;
  /** ISO date string. The view formats via existing CRD date utilities. */
  appliedAt: string;
  status: string;
};

export type PendingApplicationsTableProps = {
  rows: PendingApplicationRow[];
  /** i18n-resolved empty-state copy. */
  emptyStateI18nKey: string;
};

export type MembershipViewProps = {
  homeSpace: HomeSpaceCardProps;
  myMemberships: MembershipsTableProps;
  pendingApplications: PendingApplicationsTableProps;
};
