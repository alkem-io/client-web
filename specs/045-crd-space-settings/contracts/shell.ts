/**
 * CRD Space Settings — shell contracts
 *
 * These interfaces describe the props of the shell components (tab strip, save bar,
 * confirm-discard dialog) and are imported by `src/crd/components/space/settings/`
 * and by `src/main/crdPages/topLevelPages/spaceSettings/`.
 *
 * Presentational contracts ONLY. They MUST NOT import GraphQL-generated types.
 *
 * Every CRD view prop interface declared below MAY also accept an optional
 * `className?: string` for composition (CRD CLAUDE.md Checklist → "Accepts
 * `className` for composition"). Omitted from individual types for brevity.
 */

import type { SpaceHeroProps } from '@/crd/components/space/SpaceHeader';

export type TabId =
  | 'about'
  | 'layout'
  | 'community'
  | 'subspaces'
  | 'templates'
  | 'storage'
  | 'settings'
  | 'account';

export type SaveBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; canSave: boolean }
  | { kind: 'saving' }
  | { kind: 'saveError'; message: string };

export type SpaceSettingsShellProps = {
  hero: SpaceHeroProps;
  activeTab: TabId;
  onTabChange: (next: TabId) => void;
  children: React.ReactNode;
};

export type SpaceSettingsTabStripProps = {
  activeTab: TabId;
  onTabChange: (next: TabId) => void;
  tabs: ReadonlyArray<{
    id: TabId;
    labelKey: string;
    iconKey: string;
  }>;
};

export type SpaceSettingsSaveBarProps = {
  state: SaveBarState;
  onSave: () => void;
  onReset: () => void;
};

export type ConfirmDiscardDialogProps = {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};
