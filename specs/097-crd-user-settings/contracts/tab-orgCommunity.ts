/**
 * Org Community (Associates) tab — view contracts (US10).
 *
 * Composes the shared `RoleAssignmentView` (also used by Org Authorization
 * sub-tabs in `tab-orgAuthorization.ts`). Per Q2 / Rule #9 / FR-112, the
 * Remove (×) flow goes through a destructive `ConfirmationDialog` rendered
 * at the integration page level — the view itself never fires
 * `removeRoleFromUser` directly.
 *
 * See `data-model.md` "User Story 10" and `research.md` Decision #5 for
 * the underlying GraphQL surface.
 */

import type { RoleAssignmentPerson } from '@/crd/components/contributor/settings/RoleAssignmentView';

export type RoleMember = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

/**
 * Slot of props the view passes down to the shared `RoleAssignmentView`.
 * Uses the production `RoleAssignmentPerson` row shape.
 *
 * - `onAdd(id)` fires the role-assignment mutation immediately.
 * - `onRequestRemove(id)` opens the parent's destructive
 *   `ConfirmationDialog`. The actual `removeRoleFromUser` mutation is
 *   only fired by the page's `onConfirmRemove` callback (see
 *   `OrgCommunityPagePendingRemoveProps` below).
 */
export type RoleAssignmentViewProps = {
  current: RoleAssignmentPerson[];
  available: RoleAssignmentPerson[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAdd: (id: string) => void;
  onRequestRemove: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingCurrent: boolean;
  loadingAvailable: boolean;
  updating: boolean;
};

export type OrgCommunityViewProps = RoleAssignmentViewProps;

/**
 * Page-level pending-remove + confirm/cancel triple, owned at the
 * integration page level. The `useOrgAssociates(roleSetId)` hook produces
 * this shape; the page passes `pendingRemove?.contributorId` /
 * `displayName` into a single role-aware `ConfirmationDialog` (Rule #9).
 */
export type OrgCommunityPagePendingRemoveProps = {
  /** The id of the row whose × was clicked, or `null` when no dialog is open. */
  pendingRemoveId: string | null;
  /** The display name to interpolate into the dialog body / confirm-button label. */
  pendingRemoveDisplayName: string;
  /** Fired by the dialog's Confirm button — runs `removeRoleFromUser`. */
  onConfirmRemove: () => Promise<void>;
  /** Fired by the dialog's Cancel button or backdrop click. */
  onCancelRemove: () => void;
};

export type OrgCommunityPageProps = OrgCommunityViewProps & OrgCommunityPagePendingRemoveProps;
