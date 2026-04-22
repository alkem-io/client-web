export type MemberRole =
  | 'host'
  | 'admin'
  | 'lead'
  | 'member'
  | 'virtualContributor';

export type MemberStatus = 'active' | 'pending' | 'invited' | 'inactive';

export type MemberKind = 'user' | 'organization' | 'virtualContributor';

/**
 * Shared row template — used by the Community main users table,
 * the Organizations collapsible table, and the Virtual Contributors
 * collapsible table.
 */
export type MemberRow = {
  id: string;
  kind: MemberKind;
  displayName: string;
  secondaryText: string | null;
  avatarUrl: string | null;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string | null;
};

export type MemberTableFilter = {
  role?: MemberRole;
  status?: MemberStatus;
};

export type MemberTableState<TPageSize extends number = number> = {
  rows: MemberRow[];
  totalCount: number;
  pageSize: TPageSize;
  page: number;
};

export type CollapsibleMemberTableState<TPageSize extends number = number> =
  MemberTableState<TPageSize> & {
    collapsed: boolean;
  };

export type ApplicationQuestion = {
  id: string;
  question: string;
  required: boolean;
};

export type MemberRowAction =
  | 'viewProfile'
  | 'changeRole'
  | 'resend'
  | 'revoke'
  | 'approve'
  | 'reject'
  | 'remove'
  | 'edit'
  | 'toggleActive';

export type CommunityViewProps = {
  users: MemberTableState<10>;
  organizations: CollapsibleMemberTableState<5>;
  virtualContributors: CollapsibleMemberTableState<5>;
  applicationForm: ApplicationQuestion[];
  communityGuidelines: string;
  onUsersPageChange: (page: number) => void;
  onUsersSearch: (query: string) => void;
  onUsersFilter: (filter: MemberTableFilter) => void;
  onOrgsPageChange: (page: number) => void;
  onVcsPageChange: (page: number) => void;
  onToggleOrganizations: () => void;
  onToggleVirtualContributors: () => void;
  onRowAction: (kind: MemberKind, id: string, action: MemberRowAction) => void;
  onInvite: () => void;
  onApplicationFormChange: (questions: ApplicationQuestion[]) => void;
  onGuidelinesChange: (markdown: string) => void;
  onSaveGuidelinesAsTemplate: () => void;
};
