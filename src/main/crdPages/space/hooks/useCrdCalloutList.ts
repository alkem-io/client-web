import { useCalloutsSetAuthorization } from '@/domain/collaboration/calloutsSet/authorization/useCalloutsSetAuthorization';
import { orderedStages, treePosts, useSpaceTree } from '@/domain/space/hooks/useSpacePage';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import { useNativeRouteSpace } from '@/main/routing/urlResolver/native/useNativeRouteSpace';

type UseCrdCalloutListParams = {
  tabPosition: number;
  skip?: boolean;
};

/** A feed card's id and order; the card renders from the PostCard the feed request put in the cache. */
export type CrdFeedCallout = { id: string; sortOrder: number };

/**
 * 021 FR-007: the stage's feed from the page's space tree (SpaceTree: the space's whole subtree, not entering child
 * spaces, continued while the server has more), its own posts in their designed order and of the stage only (the tree
 * has no stage filter, so the client filters by Post.stage; a space without stages shows every post). While the server
 * does not serve the tree read yet, `notServed` and the feed says so in place.
 */
export function useSpaceFeed(spaceId: string | undefined, stageId: string | undefined) {
  const { tree, notServed } = useSpaceTree(spaceId);
  const hasMore = tree?.pageInfo.hasNextPage ?? false;

  const posts = treePosts(tree).filter(post => !stageId || post.stage?.id === stageId);
  return { posts, hasMore, loading: !tree && !notServed, notServed };
}

export function useCrdCalloutList({ tabPosition, skip }: UseCrdCalloutListParams) {
  const { calloutsSetId, classificationTagsets, flowStateForNewCallouts, tabDescription } = useSpaceTabProvider({
    tabPosition,
    skip,
  });
  const { canCreateCallout, canMoveCallouts } = useCalloutsSetAuthorization({ calloutsSetId, skip });
  const stageId = orderedStages(useNativeRouteSpace().space?.stages)[tabPosition]?.id;
  const feed = useSpaceFeed(skip ? undefined : calloutsSetId, stageId);

  return {
    callouts: feed.posts,
    calloutsSetId,
    classificationTagsets,
    canCreateCallout,
    canReorderCallouts: canMoveCallouts,
    tabDescription: tabDescription ?? '',
    flowStateForNewCallouts,
    loading: feed.loading,
    /** The space tree is not served yet: the feed says so in place. */
    unavailable: feed.notServed,
  };
}
