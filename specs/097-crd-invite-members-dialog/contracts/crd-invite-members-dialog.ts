/**
 * Contract: TypeScript prop interfaces for the new CRD components introduced
 * by spec 097-crd-invite-members-dialog. This file is documentation only —
 * the actual implementation files re-declare the types in their own modules
 * to avoid creating a barrel/contracts package, per the project's no-barrel
 * import rule.
 *
 * Source of truth at runtime:
 * - src/crd/components/community/InviteMembersDialog.tsx
 * - src/crd/forms/ContributorSelector.tsx
 * - src/crd/forms/RoleMultiSelect.tsx
 * - src/main/crdPages/space/dialogs/InviteMembersDialogConnector.tsx
 *
 * If the contracts here drift from the implementation, the implementation wins
 * and this file should be updated — never the other way around.
 */

// -----------------------------------------------------------------------------
// Shared view-model types (see data-model.md)
// -----------------------------------------------------------------------------

export type Role = 'Member' | 'Lead' | 'Admin';

export type Invitee =
  | { kind: 'user'; userId: string; displayName: string; avatarUrl?: string; location?: string }
  | { kind: 'email'; email: string; validationError?: 'invalid' | 'duplicate' };

export type InvitationResult = {
  invitee: Invitee;
  outcome: 'sent' | 'alreadyMember' | 'error';
  errorMessage?: string;
};

// -----------------------------------------------------------------------------
// <ContributorSelector> — sibling of UserSelector that accepts Invitee union
// -----------------------------------------------------------------------------

export type ContributorSelectorProps = {
  /** Current chips. Includes both kind:'user' and kind:'email' entries. */
  selectedContributors: Invitee[];

  /** Search results from the connector's useContributors hook. */
  searchResults: Array<{
    userId: string;
    displayName: string;
    avatarUrl?: string;
    location?: string;
  }>;

  /** Free-text query reflected in the input field. */
  searchQuery: string;
  onSearchChange: (query: string) => void;

  /**
   * Called when the admin picks a user from the autocomplete dropdown.
   * The connector turns this into a kind:'user' Invitee and appends to the chip list.
   */
  onSelectUser: (userId: string) => void;

  /**
   * Called when the admin presses Enter (or clicks Add) on free-text input.
   * The connector runs emailParser, builds kind:'email' Invitees (with
   * validationError if applicable), appends them, clears the input.
   * If `allowEmailInvites` is false, this prop is omitted by the consumer.
   */
  onAddEmails?: (rawText: string) => void;

  /** Removes the chip at the given index. */
  onRemoveContributor: (index: number) => void;

  /** Connector-loading state for the autocomplete dropdown. */
  loading?: boolean;

  /** When true (default): pressing Enter adds emails. When false: only autocomplete picks. */
  allowEmailInvites?: boolean;

  /** Called when the dropdown is scrolled near the bottom and more pages are available. */
  onLoadMore?: () => void;
  hasMore?: boolean;

  // i18n labels — passed by the consumer because the form lives in CRD (no t()).
  placeholder: string;
  searchAriaLabel: string;
  noResultsLabel: string;
  loadingLabel: string;
  loadMoreLabel: string;
  removeAriaLabel: (label: string) => string;
  /** Per-chip error tooltip text. */
  validationErrorLabel: (kind: 'invalid' | 'duplicate') => string;

  className?: string;
};

// -----------------------------------------------------------------------------
// <RoleMultiSelect> — Popover + Checkbox group, Member is locked
// -----------------------------------------------------------------------------

export type RoleMultiSelectProps = {
  /** Roles the admin has chosen. Always contains every role in `lockedRoles`. */
  value: Role[];
  onChange: (next: Role[]) => void;

  /** Roles that are checked AND disabled — admin cannot uncheck them. Default: ['Member']. */
  lockedRoles?: Role[];

  /** Roles the admin can toggle on/off. Default: ['Lead', 'Admin']. */
  optionalRoles?: Role[];

  /** Pre-localized labels — keyed by Role. Consumer provides via t(`crd-community:roles.${role}`). */
  roleLabels: Record<Role, string>;

  /** "Invite to be a:" prefix shown next to the trigger. */
  triggerLabel: string;

  /** Optional helper text under the option list, e.g. "Member is always granted." */
  helperText?: string;

  /** Trigger button's aria-label. */
  triggerAriaLabel: string;

  className?: string;
};

// -----------------------------------------------------------------------------
// <InviteMembersDialog> — top-level CRD presentational component
// -----------------------------------------------------------------------------

export type InviteMembersDialogProps = {
  /** Controlled open state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** The space the invitations target — used in the title and the default welcome message. */
  spaceName: string;

  // ----- Contributor input -----
  selectedContributors: Invitee[];
  searchResults: ContributorSelectorProps['searchResults'];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectUser: (userId: string) => void;
  onAddEmails?: (rawText: string) => void;
  onRemoveContributor: (index: number) => void;
  searchLoading?: boolean;
  hasMoreSearchResults?: boolean;
  onLoadMoreSearchResults?: () => void;
  /**
   * When false, the email-paste path is hidden — the admin can only pick
   * existing platform users. Mirrors the legacy `onlyFromParentCommunity` prop.
   */
  allowEmailInvites?: boolean;

  // ----- Welcome message -----
  welcomeMessage: string;
  onWelcomeMessageChange: (next: string) => void;

  // ----- Role picker -----
  extraRoles: Role[];
  onExtraRolesChange: (next: Role[]) => void;

  // ----- Send / result -----
  /**
   * Triggers the connector's mutation. When the connector resolves it,
   * it should set `results` and the dialog auto-switches to the result view.
   */
  onSend: () => void;
  /** True while the mutation is in flight. Disables Send and shows aria-busy. */
  sending?: boolean;
  /** When defined, dialog renders the result view. When undefined, the form view. */
  results?: InvitationResult[];

  // ----- Result-view actions -----
  /** Clears chips + results. Connector wires this to reset state and let the dialog return to the form view. */
  onBack: () => void;

  // ----- i18n labels (consumer provides) -----
  /** All user-visible strings, pre-resolved via t('crd-community:...') in the connector. */
  labels: {
    title: string;                    // "Invite others to join '{spaceName}'"
    searchHint: string;               // "Search for people below or directly add their email address"
    searchPlaceholder: string;
    searchAriaLabel: string;
    noResultsLabel: string;
    loadingLabel: string;
    loadMoreLabel: string;
    removeAriaLabel: (label: string) => string;
    validationErrorLabel: (kind: 'invalid' | 'duplicate') => string;
    welcomeMessageLabel: string;
    welcomeMessagePlaceholder: string;
    emailVisibilityNote: string;      // "Keep in mind that your personal email address will be visible..."
    inviteToRoleLabel: string;        // "Invite to be a:"
    rolePopoverHelper: string;        // "Member is always granted."
    rolePopoverAriaLabel: string;
    roleLabels: Record<Role, string>;
    sendButtonLabel: string;
    backButtonLabel: string;
    closeButtonLabel: string;
    resultOutcomeLabels: Record<InvitationResult['outcome'], string>;
    closeAriaLabel: string;
  };

  className?: string;
};
