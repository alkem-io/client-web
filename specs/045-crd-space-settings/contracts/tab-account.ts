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
  organizationName: string;
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
