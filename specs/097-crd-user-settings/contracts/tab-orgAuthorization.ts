/**
 * Org Authorization tab — view contracts (US11).
 *
 * Two sub-tabs (Admin / Owner) each rendering a `RoleAssignmentView`
 * (defined in `tab-orgCommunity.ts`). The active sub-tab is held in local
 * React state (no URL sync per FR-120) by the integration page. Each
 * sub-tab has its own `pendingRemoveId` + confirm/cancel callback triple
 * so the integration page can render two role-aware destructive
 * `ConfirmationDialog`s (Rule #9 / Q2 / FR-121).
 *
 * See `data-model.md` "User Story 11" for the underlying GraphQL surface.
 */

import type { RoleAssignmentPerson } from '@/crd/components/contributor/settings/RoleAssignmentView';

export type AuthorizationSubTab = 'admin' | 'owner';

/**
 * The slot of props each `RoleAssignmentView` instance receives. Uses the
 * production `RoleAssignmentPerson` row shape (defined in
 * `@/crd/components/contributor/settings/RoleAssignmentView`).
 *
 * Per Q2 / Rule #9, the view is destructive-action-free:
 *
 * - `onAdd(id)` fires the role-assignment mutation immediately.
 * - `onRequestRemove(id)` opens the parent's destructive
 *   `ConfirmationDialog`. The actual `removeRoleFromUser` mutation is only
 *   fired by the page's `onConfirmRemove` callback (see
 *   `OrgAuthorizationPagePendingRemoveProps` below).
 */
export type OrgAuthorizationRoleSlotProps = {
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

export type OrgAuthorizationViewProps = {
  /** Active sub-tab; held in local React state by the integration page (no URL sync per FR-120). */
  activeSubTab: AuthorizationSubTab;
  onSubTabChange: (next: AuthorizationSubTab) => void;
  /** Body of the Admin sub-tab. */
  admin: OrgAuthorizationRoleSlotProps;
  /** Body of the Owner sub-tab. */
  owner: OrgAuthorizationRoleSlotProps;
};

/**
 * Per-role pending-remove + confirm/cancel triple, owned at the
 * integration page level. Each instance corresponds to one of the two
 * `useOrgRoleAssignment(role)` hook instances mounted on the page.
 *
 * `OrgAuthorizationPageProps` is NOT a view contract — it documents the
 * page-level shape consumers can rely on. The view itself does not see
 * `pendingRemoveId`; only the integration page does, because the dialog
 * is rendered at the page level (Rule #9).
 */
export type OrgAuthorizationRolePendingRemove = {
  /** The id of the row whose × was clicked, or `null` when no dialog is open. */
  pendingRemoveId: string | null;
  /** The display name to show in the dialog body and confirm-button label. */
  pendingRemoveDisplayName: string;
  /** Fired by the dialog's Confirm button — runs `removeRoleFromUser`. */
  onConfirmRemove: () => Promise<void>;
  /** Fired by the dialog's Cancel button or backdrop click. */
  onCancelRemove: () => void;
};

export type OrgAuthorizationPageProps = OrgAuthorizationViewProps & {
  adminPendingRemove: OrgAuthorizationRolePendingRemove;
  ownerPendingRemove: OrgAuthorizationRolePendingRemove;
};
