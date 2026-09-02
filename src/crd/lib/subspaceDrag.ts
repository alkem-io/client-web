export type SubspaceSortMode = 'alphabetical' | 'manual';

/**
 * Whether a subspace row is locked from drag-reordering, mirroring the legacy
 * `SubspacesSortableList` rule: in Custom (manual) mode every subspace is
 * draggable; in Alphabetical mode only pinned subspaces can be reordered (they
 * lead, the rest stay alphabetical).
 */
export function isSubspaceDragDisabled(sortMode: SubspaceSortMode, isPinned: boolean): boolean {
  return sortMode === 'manual' ? false : !isPinned;
}
