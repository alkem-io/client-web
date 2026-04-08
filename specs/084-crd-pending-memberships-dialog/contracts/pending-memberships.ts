/**
 * CRD Pending Memberships Dialog — Component Contracts
 *
 * These types define the props interfaces for CRD presentational components.
 * All types are plain TypeScript — no GraphQL or MUI types.
 *
 * Integration layer (src/main/crdPages/dashboard/) maps GraphQL responses
 * to these types via data mapper functions.
 */

import type { ReactNode } from 'react';

// ─── Card Data Types ────────────────────────────────────────────────────────

export type PendingInvitationCardData = {
  id: string;
  spaceName: string;
  spaceAvatarUrl?: string;
  senderName: string;
  welcomeMessageExcerpt?: string;
  timeElapsed: string;
};

export type PendingApplicationCardData = {
  id: string;
  spaceName: string;
  spaceAvatarUrl?: string;
  tagline?: string;
  spaceHref: string;
};

export type InvitationDetailData = {
  spaceName: string;
  spaceAvatarUrl?: string;
  spaceTagline?: string;
  spaceTags: string[];
  spaceHref: string;
  senderName: string;
  timeElapsed: string;
};

// ─── Card Component Props ───────────────────────────────────────────────────

export type PendingInvitationCardProps = {
  invitation: PendingInvitationCardData;
  onClick?: () => void;
  className?: string;
};

export type PendingApplicationCardProps = {
  application: PendingApplicationCardData;
  onClick?: () => void;
  className?: string;
};

// ─── List Dialog Props ──────────────────────────────────────────────────────

export type PendingMembershipsListDialogProps = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  isEmpty: boolean;
  children?: ReactNode;
  className?: string;
};

export type PendingMembershipsSectionProps = {
  title: string;
  children: ReactNode;
};

// ─── Detail Dialog Props ────────────────────────────────────────────────────

export type InvitationDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  invitation?: InvitationDetailData;
  title: string;
  acceptLabel: string;
  rejectLabel: string;
  descriptionSlot?: ReactNode;
  welcomeMessageSlot?: ReactNode;
  guidelinesSlot?: ReactNode;
  onAccept: () => void;
  accepting: boolean;
  onReject: () => void;
  rejecting: boolean;
  updating: boolean;
  className?: string;
};
