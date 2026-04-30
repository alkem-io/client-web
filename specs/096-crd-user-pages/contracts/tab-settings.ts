/**
 * CRD Settings tab contracts.
 *
 * File location at implementation time:
 *   src/crd/components/user/settings/tabs/SettingsView.tsx
 *   src/crd/components/user/settings/tabs/DesignSystemSwitchCard.tsx
 */

export type AllowMessagesCardProps = {
  value: boolean;
  saving: boolean;
  onToggle: (next: boolean) => Promise<void>;
  /** i18n keys for the title / caption. */
  labels: {
    title: string;
    caption: string;
  };
};

export type DesignSystemSwitchCardProps = {
  /** Reads localStorage at mount; integration layer manages the read. */
  crdEnabled: boolean;
  /**
   * Writes localStorage AND triggers `window.location.reload()` — the
   * integration layer owns both side effects so the CRD primitive remains
   * pure-presentational.
   */
  onToggle: (next: boolean) => void;
  /** i18n keys. */
  labels: {
    title: string;
    caption: string;          // "The page will reload after the change."
  };
};

export type SettingsViewProps = {
  allowMessages: AllowMessagesCardProps;
  designSystem: DesignSystemSwitchCardProps;
};
