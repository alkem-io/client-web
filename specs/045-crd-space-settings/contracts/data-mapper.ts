/**
 * Per-tab data-mapper contracts.
 *
 * Each `use<Tab>TabData()` hook is the sole integration point between Apollo
 * (generated hooks from `src/core/apollo/generated/apollo-hooks.ts`) and the
 * CRD presentational components. The hook returns props for the matching CRD
 * view, with every mutation call wrapped in `useTransition`.
 *
 * Implementations MUST live under `src/main/crdPages/topLevelPages/spaceSettings/<tab>/`.
 */

import type { AboutViewProps } from './tab-about';
import type { LayoutViewProps, ColumnMenuActions } from './tab-layout';
import type { CommunityViewProps } from './tab-community';
import type { SubspacesViewProps } from './tab-subspaces';
import type { TemplatesViewProps } from './tab-templates';
import type { StorageViewProps } from './tab-storage';
import type { SettingsViewProps } from './tab-settings';
import type { AccountViewProps } from './tab-account';
import type { SettingsScopeLevel, TabId } from './shell';

/**
 * Result shape for tabs that have a tab-wide save bar (About, Layout).
 */
export type UseBufferedTabDataResult<Props> = {
  props: Props | null;
  loading: boolean;
  error: Error | null;
  isDirty: boolean;
  reset: () => void;
};

/**
 * Result shape for tabs that commit per-action (no save bar).
 */
export type UseImmediateTabDataResult<Props> = {
  props: Props | null;
  loading: boolean;
  error: Error | null;
};

/**
 * About tab saves per section (FR-005a, amended 2026-10-16 — the original
 * "per-field autosave + `flushPending()`" contract never shipped).
 * The hook keeps a local buffer; `isDirty` is true while any section differs
 * from the server. `onSaveAll` / `onResetAll` back the dirty-tab guard's
 * Save / Discard choices. There is no debounce and no flush.
 */
export type UseAboutTabDataResult = {
  props: AboutViewProps | null;
  loading: boolean;
  error: Error | null;
  /** True while any section has unsaved edits — drives `useDirtyTabGuard`. */
  isDirty: boolean;
  /** Persist every dirty section (the guard dialog's "Save"). */
  onSaveAll: () => Promise<void>;
  /** Drop the local buffer back to the server values (the guard dialog's "Discard"). */
  onResetAll: () => void;
};

export type UseAboutTabData = (spaceId: string) => UseAboutTabDataResult;
export type UseLayoutTabData = (spaceId: string) => UseBufferedTabDataResult<LayoutViewProps>;
export type UseCommunityTabData = (spaceId: string) => UseImmediateTabDataResult<CommunityViewProps>;
export type UseSubspacesTabData = (spaceId: string) => UseImmediateTabDataResult<SubspacesViewProps>;
export type UseTemplatesTabData = (spaceId: string) => UseImmediateTabDataResult<TemplatesViewProps>;
export type UseStorageTabData = (spaceId: string) => UseImmediateTabDataResult<StorageViewProps>;
export type UseSettingsTabData = (spaceId: string) => UseImmediateTabDataResult<SettingsViewProps>;
export type UseAccountTabData = (spaceId: string) => UseImmediateTabDataResult<AccountViewProps>;

/**
 * Per-**column** (innovation-flow step) overflow menu wiring (Layout tab).
 * Rendered in the top-right of each column header (FR-010). Not deferred.
 *
 * Returns `ColumnMenuActions` directly. Internally owns the rename-cascade
 * mutations, the active-phase setter, the default-post-template setter, and
 * (when `onDeleteState` is provided + `columnCount > minimumNumberOfStates`)
 * the `onDeletePhase` handler. The page wires `onDeleteState` only at L1 / L2
 * (FR-039).
 */
export type UseColumnMenu = (options: {
  innovationFlowId: string;
  availablePostTemplates: ReadonlyArray<{ id: string; label: string }>;
  /** All callouts with their current flowState tag + tagset ID — needed for the rename cascade. */
  callouts: ReadonlyArray<{ id: string; flowStateTagsetId: string; currentStateName: string }>;
  /** Map column ID → current title — needed to find the old name during rename. */
  columnNames: ReadonlyArray<{ id: string; title: string }>;
  /** Called after a successful save to update the buffer/snapshot in the layout hook. */
  onColumnSaved?: (columnId: string, title: string, description: string) => void;
  /** Phase-delete handler — provided only at L1/L2. */
  onDeleteState?: (stateId: string) => Promise<void>;
  /** Current column count and min-states, used to gate `onDeletePhase` exposure. */
  columnCount?: number;
  minimumNumberOfStates?: number;
}) => ColumnMenuActions;

/**
 * Dirty-state guard — single instance per settings page.
 * Enforces the "at most one dirty tab" invariant (Clarification Q2).
 * Layout and (amended 2026-10-16) About can enter a dirty state — About while
 * any section is unsaved; the guard dialog's Save / Discard call
 * `useAboutTabData().onSaveAll()` / `onResetAll()`. (Decision 3a's
 * `flushPending()` never shipped.)
 */
export type UseDirtyTabGuard = () => {
  isDirty: boolean;
  markDirty: () => void;
  clearDirty: () => void;
  confirmSwitch: (next: TabId) => Promise<boolean>;
};

/**
 * Added 2026-04-27. Level-aware ID resolution. Implementation reads
 * `useUrlResolver` + `useSpace` (L0) or `useSubSpace` (L1 / L2) and returns
 * the scope every settings tab uses. The page MUST source IDs from this hook
 * — never from `useSpace()` directly — or L1 / L2 mutations will silently
 * target the L0 root (FR-034).
 */
export type SettingsScope = {
  id: string;
  level: SettingsScopeLevel;
  url: string;
  roleSetId: string | undefined;
  communityId: string | undefined;
  guidelinesId: string | undefined;
  /** Populated only at L0 — Templates / Account tabs are hidden at L1 / L2. */
  accountId: string | undefined;
  loading: boolean;
};
export type UseSettingsScope = () => SettingsScope;

/**
 * Added 2026-04-27. Level-aware tab visibility. Pure function used by the page
 * AND by `CrdSubspacePageLayout`'s settings-header branch.
 */
export type GetVisibleSettingsTabs = (level: SettingsScopeLevel) => readonly TabId[];

/**
 * Added 2026-04-27. Returns the translated tab descriptors filtered to the
 * visible set for the given level. Implementation calls `useTranslation('crd-spaceSettings')`
 * and reads `t('tabs.<id>')` for each visible tab.
 */
export type UseSettingsTabDescriptors = (level: SettingsScopeLevel) => ReadonlyArray<{
  id: TabId;
  label: string;
  /** Lucide icon component reference; presentation-only. */
  icon: unknown;
}>;
