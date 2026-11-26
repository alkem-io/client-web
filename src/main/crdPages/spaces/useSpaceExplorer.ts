import { useExplorerSpaceTreeQuery, useNativeConfigurationQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import type { NativeSubspaceCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { useNativeFoundation } from '@/core/foundation/NativeFoundationProvider';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { nativeSubspaceCard } from '@/main/crdPages/space/dataMappers/subspaceCardDataMapper';

// The legacy explorer card (71f8ddcf spaceCardDataMapper.ts): banner, tags, privacy, leads for signed-in viewers; a root
// shows no avatar, a subspace its avatar and its root as parent; no lock or member mark.
const explorerCard = (
  space: NativeSubspaceCardFragment,
  authenticated: boolean,
  parent?: SpaceCardData
): SpaceCardData => {
  const card = nativeSubspaceCard(space, false);
  return {
    ...card,
    avatarUrl: parent ? card.avatarUrl : undefined,
    hideAvatar: !parent,
    isLocked: undefined,
    isMember: undefined,
    status: undefined,
    visibility: parent ? undefined : 'active',
    leads: authenticated ? card.leads : [],
    parent,
  };
};

// The explorer is one authorized subtree read: every child of the platform up to two levels (the user, 2026-11-26), 500
// per request with continuation (S23-LIST-PAGE-500). Its depth-first order lists each root before its subspaces.
const useSpaceExplorer = () => {
  const { data: foundation } = useNativeFoundation();
  const authenticated = !!foundation?.viewer.session.authenticated;
  const platform = useNativeConfigurationQuery().data?.config.platformId;
  const { data, loading, error, fetchMore } = useExplorerSpaceTreeQuery({
    variables: { platform: platform ?? '' },
    skip: !platform,
  });
  if (error) throw error;

  const tree = data?.subtree;
  // Legacy listed the ACTIVE top-level spaces with their subspaces (71f8ddcf SpaceExplorerQueries.graphql:42).
  const roots = new Map<string, SpaceCardData>();
  const spaces = (tree?.edges ?? []).flatMap(({ node }) => {
    if (!('depth' in node)) return [];
    if (node.depth === 0 && node.status === 'ACTIVE') {
      const root = explorerCard(node, authenticated);
      roots.set(node.id, root);
      return [root];
    }
    const root = node.parent && roots.get(node.parent.id);
    return node.depth === 1 && root ? [explorerCard(node, authenticated, root)] : [];
  });

  return {
    spaces,
    loading: loading || !platform,
    hasMore: tree?.pageInfo.hasNextPage,
    fetchMore: async () => {
      if (!tree?.pageInfo.hasNextPage) return;
      await fetchMore({
        variables: { after: tree.pageInfo.endCursor },
        updateQuery: (previous, { fetchMoreResult: next }) => ({
          subtree: next.subtree && {
            ...next.subtree,
            edges: [...(previous.subtree?.edges ?? []), ...next.subtree.edges],
          },
        }),
      });
    },
  };
};

export default useSpaceExplorer;
