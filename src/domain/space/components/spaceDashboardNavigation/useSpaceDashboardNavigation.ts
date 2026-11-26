import { pageSpace } from '@/domain/space/context/spacePageShellMapper';
import { treeSubspaces, useSpacePageData, useSpaceTree } from '@/domain/space/hooks/useSpacePage';

interface UseSpaceDashboardNavigationProps {
  spaceId: string | undefined;
  skip?: boolean;
}

/**
 * The sidebar's child links (021 F040), read from the page cache with no request: the first 7 subspaces of the page's
 * space tree, in the tree's signed order, so six rows show and a seventh proves Show all.
 * The pin icon follows the parent's `settings.sort_mode` as legacy (pinned shown unless custom).
 */
const useSpaceDashboardNavigation = ({ spaceId, skip }: UseSpaceDashboardNavigationProps) => {
  const id = skip ? undefined : spaceId;
  const { tree, notServed } = useSpaceTree(id);
  const space = pageSpace(useSpacePageData(id, 'space')?.node, id);
  const rows = tree && treeSubspaces(tree).slice(0, 7);
  const showPins = (space?.settings as { sort_mode?: string } | null | undefined)?.sort_mode !== 'custom';
  return {
    dashboardNavigation: rows && {
      children: rows.map(child => {
        if (!child.url) throw new Error(`Subspace ${child.id} has no canonical destination`);
        return {
          id: child.id,
          displayName: child.about.displayName,
          url: child.url,
          avatar: child.about.avatar ? { uri: child.about.avatar.file.url } : undefined,
          private: !child.isContentPublic,
          pinned: showPins && Boolean(child.pinned),
        };
      }),
    },
    loading: Boolean(id) && !rows && !notServed,
    /** The space tree is not served yet: the links widget says so in place. */
    unavailable: notServed,
  };
};

export default useSpaceDashboardNavigation;
