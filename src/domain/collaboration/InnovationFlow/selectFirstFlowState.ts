import { sortBySortOrder } from '@/core/utils/sortBySortOrder';

/**
 * The first state of an innovation flow: the lowest `sortOrder`, ties broken by `id` — the
 * same rule the server uses. Always pass ALL states: hidden states count (visibility is a
 * navigation concern only), so never feed this the output of `filterVisibleStates`, nor an
 * editor's unsaved column buffer.
 */
export const selectFirstFlowState = <T extends { sortOrder: number; id: string }>(
  states: readonly T[] | undefined
): T | undefined => (states ? [...states].sort(sortBySortOrder)[0] : undefined);
