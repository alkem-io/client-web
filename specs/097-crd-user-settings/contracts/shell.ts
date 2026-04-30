/**
 * CRD User Settings shell — header + tab strip + per-tab card primitive.
 *
 * File location at implementation time:
 *   src/crd/components/user/settings/UserSettingsShell.tsx
 *   src/crd/components/user/settings/UserSettingsTabStrip.tsx
 *   src/crd/components/user/settings/UserSettingsCard.tsx
 *
 * The `UserPageHero` contract (used by the public profile, sibling spec
 * 096-crd-user-pages) lives in `specs/096-crd-user-pages/contracts/publicProfile.ts`.
 *
 * Purely presentational. Zero `@mui/*`, `@emotion/*`, `@/core/apollo`,
 * `@/domain/*`, `react-router-dom`, or `formik` imports per FR-005 / FR-006.
 */

import type { ReactNode } from 'react';

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
  /** Header data — abbreviated user identity (no action buttons in the shell). */
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
 *               (FR-020). Same responsive behavior is shared with the
 *               public-profile resource strip in sibling spec
 *               096-crd-user-pages so the visual identity stays consistent.
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
