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

const useSubspacesSorted = <T extends SubspaceWithSortData>(
  subspaces: T[] | undefined,
  sortMode: SpaceSortMode | undefined
): T[] => {
  return (() => {
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
  })();
};

export default useSubspacesSorted;
