/**
 * VC Membership tab — view contract.
 *
 * Confirmed memberships (spaces the VC is a member of) + pending invitations
 * (spaces inviting the VC; admin must accept/decline). Mirrors the MUI
 * `VCMembershipPage` (`src/domain/community/virtualContributor/vcMembershipPage/`)
 * — same `useVcMembershipsQuery`, same Leave / Accept mutations.
 *
 * Smaller surface than User Membership (US3): no Home Space selector, no
 * search/filter input, no auto-redirect checkbox. The VC has no "preferred
 * space" concept.
 *
 * Destructive actions go through `ConfirmationDialog` per Rule #9 / FR-112:
 * - Leave space → `onRequestLeave(membershipId)` raises pending state;
 *   the page-level dialog's Confirm fires `removeRoleFromVirtualContributor`.
 * - Accept invitation → `onRequestAccept(invitationId)` raises pending state;
 *   the dialog's Confirm fires the existing accept-invitation mutation.
 *   (Decline is treated symmetrically.)
 */

import type { ReactNode } from 'react';

export type VcMembershipRow = {
  id: string;
  /** Space or subspace display name. */
  displayName: string;
  /** `space` for L0, `subspace` for L1+. Drives badge label + Leave-dialog copy. */
  type: 'space' | 'subspace';
  /** Optional tagline shown under the title. */
  tagline?: string;
  /** Space URL — the View action links here. */
  spaceUrl?: string;
  /** Optional banner URL; falls back to a deterministic gradient when absent. */
  bannerUrl?: string;
  /** Deterministic accent color from `pickColorFromId` for the fallback gradient. */
  color: string;
};

export type VcPendingInvitationRow = {
  id: string;
  /** Inviting space's display name. */
  spaceDisplayName: string;
  /** Optional inviting space banner. */
  bannerUrl?: string;
  color: string;
  /** Optional welcome / context message from the inviter. */
  welcomeMessage?: string;
};

export type VcLeaveConfirmProps = {
  pendingId: string | null;
  pendingDisplayName: string | null;
  pendingType: 'space' | 'subspace' | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export type VcAcceptInvitationConfirmProps = {
  pendingId: string | null;
  pendingSpaceName: string | null;
  pendingWelcomeMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export type VcMembershipViewProps = {
  loading: boolean;
  /** Confirmed memberships card grid. */
  memberships: VcMembershipRow[];
  /** Per-row Leave action — raises pending state, NOT the mutation directly. */
  onRequestLeave: (id: string) => void;
  /** Pre-localized empty-state caption when there are no confirmed memberships. */
  emptyMembershipsLabel: string;

  /** Pending invitations — separate card / list under the confirmed grid. */
  pendingInvitations: VcPendingInvitationRow[];
  /** Per-row Accept action — raises pending state. */
  onRequestAccept: (id: string) => void;
  /**
   * Per-row Decline action. Symmetric to Accept but fires the invitation
   * `REJECT` event directly (no confirmation dialog) — declining is
   * non-destructive (the VC simply doesn't join; the invitation can be
   * re-issued).
   */
  onRequestDecline: (id: string) => void;
  pendingInvitationsHeading: string;
  /** Optional copy / icon under the pending-invitations heading. */
  pendingInvitationsHelp?: ReactNode;

  /** Confirmation-dialog state (rendered by the integration page). */
  leaveConfirm: VcLeaveConfirmProps;
  acceptConfirm: VcAcceptInvitationConfirmProps;
};
