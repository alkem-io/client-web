/**
 * Plain TypeScript types shared by the account-deletion CRD components
 * (DeleteAccountCard, DeleteAccountBlockedDialog).
 *
 * Deliberately mirrors, but does not import, the GraphQL-generated
 * AccountDeletionBlockerKind enum (CRD components must not import generated
 * types — see src/crd/CLAUDE.md). The integration container in
 * src/main/crdPages/ maps the generated enum to this string literal union.
 */

export type AccountDeletionBlockerKindOption =
  | 'ACCOUNT_SPACE'
  | 'ACCOUNT_VIRTUAL_CONTRIBUTOR'
  | 'ACCOUNT_INNOVATION_PACK'
  | 'ACCOUNT_INNOVATION_HUB'
  | 'SOLE_ORGANIZATION_OWNER';

export type DeleteAccountBlocker = {
  kind: AccountDeletionBlockerKindOption;
  resourceID: string;
  displayName: string;
  /** Client-navigable URL of the blocking resource, when one exists. */
  url: string | undefined;
  /** True when the user can resolve the blocker alone via the account-resources page. */
  selfResolvable: boolean;
};

export type DeleteAccountBlockerTotal = {
  kind: AccountDeletionBlockerKindOption;
  total: number;
};

/**
 * The card's dialog, fully controlled by the integration container — the
 * card itself is presentational (state machine driven by data-model.md §9:
 * closed → preflight-loading → {blocked | confirm} → deleting → signed-out;
 * a stale session redirects out of the flow entirely before any dialog opens).
 */
export type DeleteAccountDialogState =
  | { kind: 'closed' }
  | { kind: 'preflight-loading' }
  | { kind: 'preflight-error' }
  /**
   * A resumed re-authentication round trip still reports a stale session —
   * the one-shot loop guard has already tripped, so we stop here instead of
   * redirecting again (see useDeleteAccount's REAUTH_ATTEMPTED_KEY guard).
   */
  | { kind: 'reauth-failed' }
  | {
      kind: 'confirm';
      typedName: string;
      deleting: boolean;
      error: boolean;
      externalSubscriptionLinked: boolean;
    }
  | {
      kind: 'blocked';
      blockers: DeleteAccountBlocker[];
      totals: DeleteAccountBlockerTotal[];
      truncated: boolean;
    };
