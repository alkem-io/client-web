/**
 * CRD User Settings shell — header + tab strip + outlet.
 *
 * File location at implementation time:
 *   src/crd/components/user/settings/UserSettingsShell.tsx
 *   src/crd/components/user/settings/UserSettingsTabStrip.tsx
 *   src/crd/components/user/UserPageHero.tsx
 *
 * Purely presentational. Zero `@mui/*`, `@emotion/*`, `@/core/apollo`,
 * `@/domain/*`, `react-router-dom`, or `formik` imports per FR-005 / FR-006.
 */

import type { ReactNode } from 'react';

/* ----------------------------- UserPageHero ------------------------------ */

export type UserPageHeroProps = {
  /**
   * Banner image. When `null` the component renders a deterministic gradient
   * computed via `pickColorFromId(userId)` (FR-010).
   */
  bannerImageUrl: string | null;
  avatarImageUrl: string | null;
  displayName: string;
  /** "City, Country" — null when both empty. */
  location: string | null;
  /**
   * When true, render the Settings (gear) icon button. The component itself
   * does not navigate — it calls `onClickSettings` (Q3 clarification:
   * canEditSettings predicate is computed by the integration layer).
   */
  showSettingsIcon: boolean;
  onClickSettings?: () => void;
  /**
   * When true, render the Message button. The button opens an in-hero
   * compose Popover; submitting calls `onSendMessage` with the typed text.
   */
  showMessageButton: boolean;
  onSendMessage?: (messageText: string) => Promise<void>;
};

/* --------------------------- UserSettingsShell --------------------------- */

export type UserSettingsTabKey =
  | 'profile'
  | 'account'
  | 'membership'
  | 'organizations'
  | 'notifications'
  | 'settings'
  | 'security';

export type UserSettingsTabDescriptor = {
  key: UserSettingsTabKey;
  /** i18n key resolved by the shell. */
  labelI18nKey: string;
  /** lucide-react icon component. */
  icon: ReactNode;
  /** Absolute `/user/<slug>/settings/<tab>` URL. */
  href: string;
  /**
   * When false, the tab is omitted from the strip entirely (e.g., Security
   * for any non-owner viewer per FR-093).
   */
  visible: boolean;
};

export type UserSettingsShellProps = {
  /** Header data — same shape as UserPageHero, minus the action buttons. */
  user: {
    avatarImageUrl: string | null;
    displayName: string;
  };
  tabs: UserSettingsTabDescriptor[];
  activeTab: UserSettingsTabKey;
  /** The active tab's content node. */
  children: ReactNode;
};

/* -------------------------- UserSettingsTabStrip ------------------------- */

export type UserSettingsTabStripProps = {
  tabs: UserSettingsTabDescriptor[];
  activeTab: UserSettingsTabKey;
  /**
   * Called when the user clicks a tab. The integration layer is responsible
   * for navigation (`react-router-dom` lives in the integration layer only).
   */
  onSelectTab: (key: UserSettingsTabKey) => void;
};

/**
 * Responsive contract:
 *  - `>= md`:   horizontal strip, all tabs inline, no scroll required.
 *  - `<  md`:   `overflow-x-auto no-scrollbar`. All tabs remain inline; the
 *               strip scrolls horizontally; the active tab MUST be auto-
 *               scrolled into view on mount and on every `activeTab` change
 *               (Q4 clarification, FR-020).
 */

/* -------------------------- UserSettingsCard ----------------------------- */

export type UserSettingsCardProps = {
  /** lucide-react icon component shown next to the title. */
  icon: ReactNode;
  /** i18n-resolved title text. */
  title: string;
  /** Optional helper / caption text rendered below the title. */
  helperText?: string;
  children: ReactNode;
};
