/**
 * Plain string-union level prop. CRD components MUST NOT import the GraphQL
 * `SpaceLevel` enum (per `src/crd/CLAUDE.md` Rule 4). Page boundary converts.
 */
export type SettingsScopeLevel = 'L0' | 'L1' | 'L2';

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
  /** Added 2026-04-27. Drives the per-row promote/demote disabled state at L1/L2. */
  isLead: boolean;
  /** Added 2026-04-27. When true, lead-toggle dropdown items MUST be hidden (Admin row stays read-only). */
  isAdmin: boolean;
  status: MemberStatus;
  joinedAt: string | null;
};

/**
 * Aggregate flags from `useCommunityPolicyChecker` (added 2026-04-27).
 * The view composes these with each row's `isLead` to derive the per-row
 * disabled state: `(!canAddLead && !row.isLead) || (!canRemoveLead && row.isLead)`.
 */
export type LeadPolicy = {
  canAddLead: boolean;
  canRemoveLead: boolean;
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
  /**
   * Added 2026-04-27. Gates promote/demote-Lead dropdown items (visible only when `level !== 'L0'`)
   * and hides the VC block + "Save as guidelines template" at non-L0 (FR-036).
   */
  level: SettingsScopeLevel;
  /** Added 2026-04-27. Aggregate flags driving the lead-toggle disabled state per row. */
  leadPolicy: LeadPolicy;
  /** Added 2026-04-27. Delegates to `useCommunityAdmin().onUserLeadChange`. Immediate (no buffer). */
  onUserLeadChange: (userId: string, isLead: boolean) => void;
  /** Added 2026-04-27. Delegates to `useCommunityAdmin().onOrganizationLeadChange`. Immediate. */
  onOrgLeadChange: (orgId: string, isLead: boolean) => void;

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
