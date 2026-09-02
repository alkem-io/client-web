/**
 * Org Settings tab — view contracts.
 * Two switches; no Design System toggle (FR-132).
 * See data-model.md "User Story 12" for details.
 */

export type OrgSettingsSwitchRow = {
  /** Switch label — i18n. */
  label: string;
  /** Optional caption below the switch — i18n. */
  caption?: string;
  value: boolean;
  saving: boolean;
  onToggle: (next: boolean) => void;
};

export type OrgSettingsViewProps = {
  /** Card title — i18n: "Organization Settings". */
  title: string;
  allowUsersMatchingDomainToJoin: OrgSettingsSwitchRow;
  contributionRolesPubliclyVisible: OrgSettingsSwitchRow;
  loading: boolean;
};
