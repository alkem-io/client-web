/**
 * User Membership tab — view contracts.
 * See data-model.md "User Story 3" for field-level details.
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

export type MembershipFilter = 'all' | 'spaces' | 'subspaces' | 'active' | 'archived';

export type MembershipRow = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  color: string; // pickColorFromId
  type: 'Space' | 'Subspace';
  description?: string;
  role: 'Admin' | 'Lead' | 'Member';
  memberCount?: number;
  status: 'Active' | 'Archived';
  /** href used by the row name link. */
  spaceUrl: string;
};

export type MembershipsTableProps = {
  rows: MembershipRow[];
  searchTerm: string;
  filter: MembershipFilter;
  page: number;
  pageSize: number;
  totalRows: number;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: MembershipFilter) => void;
  onPageChange: (page: number) => void;
  /** Opens the Leave confirmation dialog. */
  onLeave: (membershipId: string) => void;
  loading: boolean;
};

export type PendingApplicationRow = {
  id: string;
  displayName: string;
  createdDate: string; // formatted
  status: string; // i18n-resolved
};

export type PendingApplicationsTableProps = {
  rows: PendingApplicationRow[];
  emptyStateLabel: string; // i18n
  loading: boolean;
};

export type UserMembershipViewProps = {
  homeSpace: HomeSpaceCardProps;
  memberships: MembershipsTableProps;
  pendingApplications: PendingApplicationsTableProps;
};
