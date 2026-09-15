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

export type OrgInvitationsConfirm = {
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
  acceptConfirm: OrgInvitationsConfirm;
  /**
   * Declining is destructive and irreversible from this surface: the
   * invitation lifecycle has no transition from `rejected` back to `invited`
   * (it was removed deliberately, because re-inviting must re-run the
   * organization's opt-out and Lead-slot checks). Recovering from a mis-click
   * therefore needs the SPACE admin to archive the declined invitation and
   * send a new one. CRD Golden Rule 9 admits no exceptions anyway.
   */
  declineConfirm: OrgInvitationsConfirm;
  /**
   * True while an accept or decline mutation is in flight. Disables both row
   * actions until it settles: the row is not removed optimistically (it
   * disappears only after the refetch), so without this a second click sends a
   * second REJECT into a state whose lifecycle defines no REJECT transition —
   * the server throws and the org admin is shown a failure toast for a decline
   * that actually succeeded.
   */
  busy?: boolean;
};
