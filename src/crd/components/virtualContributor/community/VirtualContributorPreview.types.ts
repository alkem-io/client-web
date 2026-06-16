export type VcPreviewHost = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  href?: string;
};

export type VcPreviewData = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  tags: string[];
  /** May contain markdown — render via MarkdownContent, not as plain text. */
  description: string;
  host?: VcPreviewHost;
};

export type VirtualContributorPreviewProps = {
  /** Undefined while the preview data is loading. */
  data?: VcPreviewData;
  loading: boolean;
  /** Return to the list view. */
  onBack: () => void;
  /** Add (account VC) or proceed to the invite-message step (library VC). */
  onAction: () => void;
  /** Localized action label ("Add" | "Invite"). */
  actionLabel: string;
  /** Whether the action is in flight (shows a spinner, disables the button). */
  actionBusy?: boolean;
};
