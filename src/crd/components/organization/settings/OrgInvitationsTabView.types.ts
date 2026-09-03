/**
 * Public types for `OrgInvitationsTabView`. Plain TypeScript — no GraphQL
 * types, no Apollo imports, no MUI imports.
 */

export type OrgInvitationRow = {
  id: string;
  spaceDisplayName: string;
  spaceUrl: string;
  /** Fully resolved "Invited by <name>" / "Invited by a Space admin" text. */
  invitedByText: string;
  /** Pre-formatted date string. */
  dateText: string;
  /** Pre-translated role text ("Member" / "Member + Lead"). */
  roleLabel: string;
  welcomeMessage?: string;
  /** Pre-resolved "Accepting also joins: A, B" text — undefined when there is nothing extra to list. */
  spacesToJoinText?: string;
  /** Whether Accept/Decline are enabled — false while the invitation is still resolving ('accepting' state). */
  canAct: boolean;
};

export type OrgInvitationsAcceptConfirm = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export type OrgInvitationsTabViewProps = {
  loading: boolean;
  title: string;
  rows: OrgInvitationRow[];
  emptyLabel: string;
  acceptLabel: string;
  declineLabel: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  acceptConfirm: OrgInvitationsAcceptConfirm;
};
