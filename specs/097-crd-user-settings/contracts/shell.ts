/**
 * SettingsShell + SettingsTabStrip + SettingsCard contracts.
 *
 * The shell is actor-agnostic — User (7 tabs), Organization (5 tabs), and
 * Virtual Contributor (3 tabs) all pass their tab list via the `tabs` prop.
 * The component is generic over `TTabId extends string` so each actor's
 * concrete tab-id union flows through without a primitive change. See
 * research.md Decision #9.
 *
 * All components live under `src/crd/components/contributor/settings/`.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Per-actor tab-id unions used by the shell. */
export type UserTabId =
  | 'profile'
  | 'account'
  | 'membership'
  | 'organizations'
  | 'notifications'
  | 'settings'
  | 'security';
export type OrgTabId = 'profile' | 'account' | 'community' | 'authorization' | 'settings';
export type VcTabId = 'profile' | 'membership' | 'settings';

/** A single tab descriptor. Hidden tabs are not rendered (used for User Security on non-owner viewers). */
export type SettingsTab = {
  id: string; // actor-specific tab-id union — UserTabId | OrgTabId | VcTabId
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
