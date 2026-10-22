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
 *
 * SUPERSEDED: settings pages no longer embed the hero. They render the compact
 * `SpaceSettingsHeader` whose props are `{ title, titleHref?, tagline?, fullWidth?,
 * className? }` — no banner, no avatar, no member avatars (the interim
 * subspace-settings avatar was removed 2026-08-21; `titleHref` links the title
 * back to the space/subspace home). Kept for the historical record.
 *
 * Amended 2026-10-16: the header gains an optional square identity tile — see
 * `SpaceSettingsHeaderProps.visual` below.
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

/**
 * Compact settings header (FR-001, amended 2026-10-16).
 *
 * `visual` renders a 48px SQUARE identity tile with rounded corners
 * (`rounded-lg` — never a circle; circles are reserved for people) left of the
 * title + tagline. The integration passes:
 *   - L1 / L2: the space `avatar` visual;
 *   - L0: the `cardBanner`, cropped square (`object-cover`) — L0 has no avatar
 *     visual. This is an owner-approved exception to spec 100's "no cardBanner
 *     as avatar" rule, scoped to identity tiles in navigation chrome (this
 *     tile and the breadcrumbs). The public Space/Subspace page header still
 *     shows no avatar.
 *   - no image: `src` omitted → the tile shows `initials`.
 * The tile is decorative (`aria-hidden`) — the title carries the name.
 */
export type SpaceSettingsHeaderProps = {
  title: string;
  titleHref?: string;
  tagline?: string | null;
  visual?: { src?: string; initials: string };
  fullWidth?: boolean;
  className?: string;
};

export type TabId =
  | 'about'
  | 'layout'
  | 'community'
  /** Added in implementation (2026-04-15) — second-round clarification 1; not in earlier draft. */
  | 'updates'
  | 'subspaces'
  | 'templates'
  | 'storage'
  | 'settings'
  | 'account';

export const TAB_ORDER: readonly TabId[] = [
  'about',
  'layout',
  'community',
  'updates',
  'subspaces',
  'templates',
  'storage',
  'settings',
  'account',
] as const;

/**
 * Added 2026-04-27. Visible-tab list per level — mirrors the legacy MUI
 * configuration in `SpaceAdminRouteL{0,1,2}.tsx` (FR-035).
 *
 *  - L0: all 9 tabs.
 *  - L1: hide templates, storage, account.
 *  - L2: hide templates, storage, account, subspaces.
 *
 * Implementation lives in
 * `src/main/crdPages/topLevelPages/spaceSettings/useVisibleSettingsTabs.ts`.
 */
export type SettingsScopeLevel = 'L0' | 'L1' | 'L2';
export type GetVisibleSettingsTabs = (level: SettingsScopeLevel) => readonly TabId[];

/**
 * SaveBarState — used ONLY by the Layout tab.
 * About saves per section via `FieldFooter` (FR-005a, amended 2026-10-16 —
 * was "per-field autosave"); it has no tab-wide save bar.
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
 * Added 2026-10-22 (spec Session 2026-10-22, FR-025 – FR-026c). Supersedes
 * `SaveBarState` / `SpaceSettingsSaveBarProps` above, which were Layout-only.
 *
 * One tab-wide bar, fixed to the bottom of the viewport, shared by About,
 * Layout and Settings. Every participating data hook exposes a
 * `TabUnsavedChanges`; the page maps the ACTIVE tab's one to the bar.
 */
export type TabUnsavedChanges = {
  /** FR-025b — one per changed field; 0 = clean. */
  count: number;
  /** False while any buffered edit is invalid. */
  canSave: boolean;
  saving: boolean;
  /** Last Save failure; the failed parts stay counted. */
  error: string | null;
  /** Saves every change on the tab; resolves `true` when everything saved. */
  saveAll: () => Promise<boolean>;
  /** Puts every changed field back to its server value, in place. */
  reset: () => void;
};

export type UnsavedChangesBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; count: number; canSave: boolean }
  | { kind: 'saving'; count: number }
  | { kind: 'saveError'; count: number; message: string };

/**
 * `src/crd/components/space/settings/SpaceSettingsUnsavedChangesBar.tsx`.
 * Left: filled circle with `count` + "1 unsaved change" / "N unsaved changes".
 * Right: Discard (ghost) + Save changes (primary). `aria-live="polite"`.
 * `onDiscard` opens the page-owned confirmation (FR-025c); the bar never
 * resets anything itself.
 */
export type SpaceSettingsUnsavedChangesBarProps = {
  state: UnsavedChangesBarState;
  onSave: () => void;
  onDiscard: () => void;
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
