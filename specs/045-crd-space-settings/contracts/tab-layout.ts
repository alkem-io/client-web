import type { SaveBarState } from './shell';

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
};

export type LayoutViewProps = {
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
};
