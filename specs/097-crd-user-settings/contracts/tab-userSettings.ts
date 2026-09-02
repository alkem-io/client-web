/**
 * User Settings tab — view contracts.
 * See data-model.md "User Story 6" for field-level details.
 */

export type CommunicationPrivacyCardProps = {
  title: string; // i18n
  /** Switch label — i18n: "Allow other users to send me messages". */
  allowMessagesLabel: string;
  allowOtherUsersToSendMessages: boolean;
  saving: boolean;
  onToggle: (next: boolean) => void;
};

export type DesignSystemSwitchCardProps = {
  title: string; // i18n
  /** Switch label — i18n: "CRD (new design system)". */
  switchLabel: string;
  /** Caption — i18n: "The page will reload after the change." */
  caption: string;
  /** Reads viewer's localStorage; viewer-scoped only (never tied to the target user). */
  crdEnabled: boolean;
  /** Writes localStorage + reloads page. */
  onToggle: (next: boolean) => void;
};

export type UserSettingsViewProps = {
  communicationPrivacy: CommunicationPrivacyCardProps;
  designSystem: DesignSystemSwitchCardProps;
  loading: boolean;
};
