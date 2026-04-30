/**
 * CRD Account tab contracts.
 *
 * File location at implementation time:
 *   src/crd/components/user/settings/tabs/AccountView.tsx
 *   src/crd/components/user/settings/tabs/AccountResourceCard.tsx
 *
 * Per research §3, the Account tab is a thin presentational shell. Every
 * Create / Manage / Transfer / Delete is delivered as a callback prop;
 * the integration layer wires those callbacks to navigation against the
 * existing MUI admin routes (no MUI dialog is embedded in CRD).
 */

export type AccountKebabAction =
  | { kind: 'view';        labelI18nKey: string; onClick: () => void }
  | { kind: 'manage';      labelI18nKey: string; onClick: () => void }
  | { kind: 'transferOut'; labelI18nKey: string; onClick: () => void }
  | { kind: 'delete';      labelI18nKey: string; onClick: () => void };

export type AccountResourceCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  avatarImageUrl: string | null;
  url: string;
  kebab: AccountKebabAction[];
};

export type AccountTabSectionProps = {
  titleI18nKey: string;
  items: AccountResourceCardItem[];
  /** Visible when the user has the privilege to create this resource type. */
  canCreate: boolean;
  createButtonI18nKey: string;
  onCreate: () => void;
  /** i18n-resolved empty-state line. */
  emptyStateI18nKey: string;
};

export type AccountViewProps = {
  helpTextI18nKey: string;                     // "Here you can view your active resources …"
  hostedSpaces: AccountTabSectionProps;
  virtualContributors: AccountTabSectionProps;
  innovationPacks: AccountTabSectionProps;
  innovationHubs: AccountTabSectionProps;
};
