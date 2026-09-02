import type { SaveBarState } from './shell';
import type { SettingsScopeLevel } from './tab-community';

/**
 * Innovation-flow state UUID. Columns on the Layout board are DYNAMIC — count
 * and order are driven by `innovationFlow.states`. The spec's example labels
 * "Home / Community / Subspaces / Knowledge" are prototype mock data, not
 * fixed column IDs.
 */
export type LayoutColumnId = string;

export type LayoutCallout = {
  id: string;
  /** Read-only on the Layout tab. Post text is edited from the post's own page. */
  title: string;
  /** Read-only on the Layout tab. Post text is edited from the post's own page. */
  description: string;
  /** Tagset UUID (`classification.flowState`) — needed to issue `updateCallout` moves. */
  flowStateTagsetId: string;
};

export type LayoutPoolColumn = {
  id: LayoutColumnId;
  title: string;
  description: string;
  /** True when this state is the innovation flow's currently-active state. */
  isCurrentPhase: boolean;
  callouts: LayoutCallout[];
};

export type LayoutReorderTarget = {
  columnId: LayoutColumnId;
  index: number;
};

/**
 * Per-column overflow menu (top-right three-dot on each column header).
 * Fires IMMEDIATELY — not buffered. Distinct from the rename / reorder /
 * display-mode buffer that Save Changes flushes.
 */
export type ColumnMenuActions = {
  /** Mark `columnId` as the innovation flow's current state. */
  onChangeActivePhase: (columnId: LayoutColumnId) => void;
  /** Set (or clear, if `templateId` is null) the default post template for `columnId`. */
  onSetAsDefaultPostTemplate: (columnId: LayoutColumnId, templateId: string | null) => void;
  availablePostTemplates: ReadonlyArray<{ id: string; label: string }>;
  /**
   * Added 2026-04-27. L1/L2 only — the page wires this only when `level !== 'L0'`
   * AND `columns.length > minimumNumberOfStates`. Delegates to
   * `useInnovationFlowSettings.actions.deleteState` (atomic delete + refetch).
   * Confirmed via existing `ConfirmationDialog`.
   */
  onDeletePhase?: (columnId: LayoutColumnId) => Promise<void>;
};

export type LayoutViewProps = {
  /**
   * Added 2026-04-27. Gates Add Phase + Delete phase visibility (FR-038 / FR-039).
   * The view filters its own affordances by level — the data hook stays level-agnostic.
   */
  level: SettingsScopeLevel;

  /** Dynamic count and order — driven by backend `innovationFlow.states`. */
  columns: LayoutPoolColumn[];
  postDescriptionDisplay: 'collapsed' | 'expanded';
  saveBar: SaveBarState;
  onReorder: (calloutId: string, target: LayoutReorderTarget) => void;
  onRenameColumn: (
    columnId: LayoutColumnId,
    patch: { title?: string; description?: string }
  ) => void;
  onPostDescriptionDisplayChange: (next: 'collapsed' | 'expanded') => void;
  onSave: () => void;
  onReset: () => void;

  /**
   * Visible per-callout menu — two entries specified by the prototype:
   * Move to (submenu with other columns), View Post.
   * "Remove from Tab" is NOT part of this menu — the backend has no
   * unassigned state for a callout.
   */
  onMoveToColumn: (calloutId: string, target: LayoutColumnId) => void;
  onViewPost: (calloutId: string) => void;

  /** Per-column overflow menu (immediate, not buffered). */
  columnMenuActions: ColumnMenuActions;

  /**
   * Added 2026-04-27. L1/L2 only — the page passes this only when `level !== 'L0'`.
   * Delegates to `useInnovationFlowSettings.actions.createState` (atomic create+sortOrder+refetch).
   */
  onCreatePhase?: (input: { displayName: string; description?: string }) => Promise<void>;
  /** Added 2026-04-27. Used to disable / hide Add Phase when at maximum. */
  maximumNumberOfStates: number;
  /** Added 2026-04-27. Used to disable / hide Delete phase when at minimum. */
  minimumNumberOfStates: number;
  /**
   * Added 2026-04-27. True while a create / delete state mutation is in flight.
   * Disables the Save Changes bar to prevent double-fire while the structural
   * change is being committed.
   */
  isStructureMutating: boolean;
};
