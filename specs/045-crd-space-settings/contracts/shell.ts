/**
 * CRD Space Settings — shell contracts
 *
 * Presentational contracts ONLY. They MUST NOT import GraphQL-generated types
 * and MUST NOT import from `src/**` — contracts describe the shape the
 * implementation must conform to, not the implementation itself.
 *
 * Every CRD view prop interface MAY also accept an optional `className?: string`
 * for composition (CRD CLAUDE.md Checklist). Omitted from individual types for brevity.
 */

import type { ReactNode } from 'react';

/**
 * Shape passed into the shell's hero slot. Must match (by duck-typing) the
 * props exported by `src/crd/components/space/SpaceHeader.tsx` at implementation
 * time. Declared here as a standalone contract so the spec is self-contained.
 */
export type SpaceHeroProps = {
  spaceName: string;
  tagline: string;
  bannerUrl: string | null;
  memberAvatars: ReadonlyArray<{
    id: string;
    displayName: string;
    avatarUrl: string | null;
  }>;
  memberCount: number;
};

export type TabId =
  | 'about'
  | 'layout'
  | 'community'
  | 'subspaces'
  | 'templates'
  | 'storage'
  | 'settings'
  | 'account';

export const TAB_ORDER: readonly TabId[] = [
  'about',
  'layout',
  'community',
  'subspaces',
  'templates',
  'storage',
  'settings',
  'account',
] as const;

/**
 * SaveBarState — used ONLY by the Layout tab.
 * About uses per-field autosave (FR-005a).
 * All other tabs commit per action.
 */
export type SaveBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; canSave: boolean }
  | { kind: 'saving' }
  | { kind: 'saveError'; message: string };

export type SpaceSettingsShellProps = {
  hero: SpaceHeroProps;
  activeTab: TabId;
  onTabChange: (next: TabId) => void;
  children: ReactNode;
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

/**
 * Single confirmation primitive (delete + discard variants) — reused, not duplicated.
 * Backed by src/crd/components/dialogs/ConfirmationDialog.tsx.
 */
export type ConfirmationDialogProps =
  | {
      open: boolean;
      variant: 'delete';
      title: string;
      description: string;
      confirmLabel: string;
      onConfirm: () => void;
      onCancel: () => void;
    }
  | {
      open: boolean;
      variant: 'discard';
      title: string;
      description: string;
      onSave: () => void;
      onDiscard: () => void;
      onCancel: () => void;
    };
