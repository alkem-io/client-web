// Amended 2026-10-28 (#10187): rewritten to the shipped `SpaceSettingsAccountView` props.
// The earlier draft (entitlement rows, plan description, `visibilityStatus.tone`) was never built.

export type AccountPlan = {
  name: string;
  features: string[];
  daysLeft: number | null;
};

/** Plain values, translated by the view (FR-024b) — never the raw GraphQL enum. */
export type AccountVisibility = 'active' | 'archived' | 'demo' | 'inactive';

export type AccountHostType = 'organization' | 'user' | 'virtualContributor';

export type AccountHost = {
  displayName: string;
  avatarUrl: string | null;
  /** Translated by the view (FR-024b); supersedes the 2026-10-22 sentence-case rule. null for any other actor type: no type line. */
  type: AccountHostType | null;
};

export type AccountViewProps = {
  url: string;
  /** null → the License section shows "No active license" (FR-024b). */
  plan: AccountPlan | null;
  visibility: AccountVisibility | null;
  /** Host card has NO Change Host CTA — the support-contact box routes host changes (FR-024). */
  host: AccountHost | null;
  contactSupportHref: string;
  changeLicenseHref: string | null;
  canDeleteSpace: boolean;
  loading?: boolean;
  /** Opens the destructive confirmation; the consumer notifies and navigates on the outcome (FR-024a). */
  onDeleteSpace: () => void;
  onCopyUrl: () => Promise<boolean> | boolean;
};
