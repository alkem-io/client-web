/**
 * Public types for `VCMembershipTabView`. Plain TypeScript — no GraphQL
 * types, no Apollo imports, no MUI imports.
 *
 * Implements the contract documented in
 * `specs/097-crd-user-settings/contracts/tab-vcMembership.ts`.
 */

import type { ReactNode } from 'react';

export type VcMembershipRow = {
  id: string;
  /** Space or subspace id (used to scope Leave's role-set lookup). */
  spaceId: string;
  /** Display name resolved from the per-row enrichment. */
  displayName: string;
  /** `space` for L0, `subspace` for L1+. Drives the badge label + Leave-dialog copy. */
  type: 'space' | 'subspace';
  tagline?: string;
  spaceUrl?: string;
  bannerUrl?: string;
  /** Deterministic accent color for the fallback gradient. */
  color: string;
};

export type VcPendingInvitationRow = {
  id: string;
  spaceDisplayName: string;
  bannerUrl?: string;
  color: string;
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
  memberships: VcMembershipRow[];
  onRequestLeave: (id: string) => void;
  emptyMembershipsLabel: string;

  pendingInvitations: VcPendingInvitationRow[];
  onRequestAccept: (id: string) => void;
  onRequestDecline: (id: string) => void;
  pendingInvitationsHeading: string;
  pendingInvitationsHelp?: ReactNode;

  leaveConfirm: VcLeaveConfirmProps;
  acceptConfirm: VcAcceptInvitationConfirmProps;
};
