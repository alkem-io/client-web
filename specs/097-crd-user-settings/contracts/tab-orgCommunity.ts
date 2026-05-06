/**
 * Org Community (Associates) tab — view contracts.
 * Reuses the shared `RoleAssignmentView` (also used by Org Authorization sub-tabs).
 * See data-model.md "User Story 10" and research.md Decision #5 for details.
 */

export type RoleMember = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type RoleAssignmentViewProps = {
  /** Title — e.g., "Associates" / "Admins" / "Owners". */
  title: string;
  /** Current members in this role (left column). */
  currentMembers: RoleMember[];
  /** Available users (right column). */
  availableMembers: RoleMember[];
  searchTerm: string;
  searchPlaceholder: string;
  onSearchChange: (term: string) => void;
  /** Adds a user to the role. */
  onAdd: (userId: string) => Promise<void>;
  /** Removes a user from the role. */
  onRemove: (userId: string) => Promise<void>;
  /** Available-list pagination. */
  hasMore: boolean;
  onLoadMore: () => void;
  /** Loading flags (current / available / mutation in flight). */
  loadingCurrent: boolean;
  loadingAvailable: boolean;
  updating: boolean;
  /** Empty-state copy for either column. */
  emptyMembersLabel: string;
  emptyAvailableLabel: string;
};

export type OrgCommunityViewProps = {
  /** The Associate-role view. */
  associates: RoleAssignmentViewProps;
};
