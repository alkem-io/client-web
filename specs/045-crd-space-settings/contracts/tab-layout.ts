import type { SaveBarState } from './shell';

export type LayoutColumnId = 'home' | 'community' | 'subspaces' | 'knowledge';

export type LayoutCallout = {
  id: string;
  /** Read-only on the Layout tab. Post text is edited from the post's own page. */
  title: string;
  /** Read-only on the Layout tab. Post text is edited from the post's own page. */
  description: string;
  kind: 'system' | 'callout';
  icon: string;
  /**
   * Local-buffer-only flag. When true, the row is flagged for removal from
   * its current column but NO mutation has fired — the row stays visible
   * with the pending-removal visual treatment until Save Changes commits
   * the unassignment or Reset clears the flag.
   *
   * Populated by the view model only; never present in the backend payload.
   */
  pendingRemoval: boolean;
};

export type LayoutPoolColumn = {
  id: LayoutColumnId;
  title: string;
  description: string;
  callouts: LayoutCallout[];
};

export type LayoutReorderTarget = {
  columnId: LayoutColumnId;
  index: number;
};

/**
 * Deferred per-**column** (innovation-flow step) menu (FR-010 / SC-009).
 *
 * Implemented and tested now; not surfaced in the UI until the designer
 * specifies CTA placement on the column header. `isDeferredMenuVisible`
 * is hard-coded `false` in this iteration.
 *
 * Not per-callout — Active phase and Default post template are both
 * column-level concerns.
 */
export type DeferredColumnMenuActions = {
  onChangeActivePhase: (columnId: LayoutColumnId, phaseId: string) => void;
  onSetAsDefaultPostTemplate: (columnId: LayoutColumnId, templateId: string) => void;
  availablePhases: ReadonlyArray<{ id: string; label: string }>;
  availablePostTemplates: ReadonlyArray<{ id: string; label: string }>;
};

export type LayoutViewProps = {
  columns: [LayoutPoolColumn, LayoutPoolColumn, LayoutPoolColumn, LayoutPoolColumn];
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
   * Visible per-callout menu — three entries specified by the prototype:
   * Move to (submenu with other columns), View Post, Remove from Tab.
   * Buffered like any other layout change; View Post is immediate navigation.
   *
   * `onRemoveFromTab` sets `pendingRemoval: true` on the callout in the
   * buffer. The row stays visible and the kebab swaps its Remove entry for
   * Undo removal (wired to `onUndoRemoveFromTab`). Nothing hits the server
   * until Save Changes flushes the buffer (FR-008a).
   */
  onMoveToColumn: (calloutId: string, target: LayoutColumnId) => void;
  onViewPost: (calloutId: string) => void;
  onRemoveFromTab: (calloutId: string) => void;
  onUndoRemoveFromTab: (calloutId: string) => void;

  /**
   * Deferred **per-column** (innovation-flow step) actions — wired but
   * not surfaced until the designer specifies CTA placement on the
   * column header. Separate from the visible per-callout kebab above.
   */
  deferredColumnMenuActions: DeferredColumnMenuActions;
  isDeferredMenuVisible: boolean;
};
