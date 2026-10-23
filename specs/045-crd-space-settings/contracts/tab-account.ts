export type EntitlementRow = {
  feature: string;
  limit: number | 'unlimited';
  usage: number;
};

export type AccountPlan = {
  name: string;
  description: string;
  features: string[];
};

export type AccountVisibilityStatus = {
  label: string;
  tone: 'active' | 'inactive';
};

export type AccountHost = {
  displayName: string;
  avatarUrl: string | null;
  /** ~~organizationName: string;~~ (Amended 2026-10-22: never shipped — the card shows the provider type instead.) */
  /**
   * The provider's `type` enum (`USER`, `ORGANIZATION`, …), rendered in
   * sentence case — `User`, `Organization` — never the raw upper-case value
   * (amended 2026-10-22).
   */
  type: string;
};

export type AccountViewProps = {
  url: string;
  plan: AccountPlan;
  entitlements: EntitlementRow[];
  visibilityStatus: AccountVisibilityStatus;
  /** Host card has NO Change Host CTA — support-contact message routes host changes (FR-024). */
  host: AccountHost;
  contactSupportHref: string;
  /** External link when the host provider supports it; null otherwise. */
  changeLicenseHref: string | null;
  canDeleteSpace: boolean;
  onCopyUrl: () => void;
  onContactSupport: () => void;
  onDeleteSpace: () => void;
};
