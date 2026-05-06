/**
 * SettingsShell + SettingsTabStrip + SettingsCard contracts.
 *
 * The shell is actor-agnostic — both User (7 tabs) and Organization (5 tabs)
 * pass their tab list via the `tabs` prop. See research.md Decision #9.
 *
 * All components live under `src/crd/components/contributor/settings/`.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** A single tab descriptor. Hidden tabs are not rendered (used for User Security on non-owner viewers). */
export type SettingsTab = {
  id: string; // 'profile' | 'account' | 'membership' | ... — actor-specific union
  label: string; // i18n-resolved label
  icon: LucideIcon; // lucide-react icon component
  hidden?: boolean; // optional — when true, the tab is omitted from the strip
};

/** Sticky header above the tab strip — avatar + display name. */
export type SettingsShellHeader = {
  avatarUrl?: string;
  displayName: string;
};

export type SettingsShellProps = {
  header: SettingsShellHeader;
  tabs: SettingsTab[];
  activeTabId: string;
  /** Called when the user clicks a tab. Integration layer wires this to navigation. */
  onTabSelect: (id: string) => void;
  /** The active tab body — receives the tab content rendered by route children. */
  children: ReactNode;
};

export type SettingsTabStripProps = {
  tabs: SettingsTab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
};

/** Card primitive used by every settings tab. Title + bottom-bordered heading + body. */
export type SettingsCardProps = {
  /** Lucide icon rendered to the left of the title in primary color. */
  icon: LucideIcon;
  title: string;
  /** Optional helper text below the title, above the bottom border. */
  helperText?: string;
  children: ReactNode;
};
