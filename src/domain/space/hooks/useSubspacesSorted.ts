import { SpaceSortMode } from '@/core/apollo/generated/graphql-schema';
import { sortBySortOrder } from '@/core/utils/sortBySortOrder';

type SubspaceWithSortData = {
  sortOrder: number;
  pinned: boolean;
  about: {
    profile: {
      displayName: string;
    };
  };
};

/**
 * Sort subspaces for display: custom sort order, or (default) pinned first then
 * alphabetical. Plain function — call it directly from a compiled component or
 * hook when a stable result matters: the React Compiler memoizes an ordinary
 * call on its arguments, but never a call that is named like a hook, so
 * `useSubspacesSorted` below returns a fresh array on every render.
 */
export const sortSubspaces = <T extends SubspaceWithSortData>(
  subspaces: T[] | undefined,
  sortMode: SpaceSortMode | undefined
): T[] => {
  if (!subspaces) {
    return [];
  }

  if (sortMode === SpaceSortMode.Custom) {
    return [...subspaces].sort(sortBySortOrder);
  }

  // Default: ALPHABETICAL
  const pinned = subspaces.filter(s => s.pinned).sort(sortBySortOrder);
  const unpinned = [...subspaces]
    .filter(s => !s.pinned)
    .sort((a, b) => a.about.profile.displayName.localeCompare(b.about.profile.displayName));

  return [...pinned, ...unpinned];
};

const useSubspacesSorted = <T extends SubspaceWithSortData>(
  subspaces: T[] | undefined,
  sortMode: SpaceSortMode | undefined
): T[] => sortSubspaces(subspaces, sortMode);

export default useSubspacesSorted;
