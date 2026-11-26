import { type ApolloError, type ServerError, useApolloClient } from '@apollo/client';
import { useEffect } from 'react';
import {
  PostDetailDocument,
  SpacePageDocument,
  useSpacePageQuery,
  useSpacePageWithPostQuery,
  useSpaceTreeQuery,
  useSpaceVirtualContributorsQuery,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type { SpacePageQueryVariables, SpaceTreeQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { NativeErrorCode } from '@/core/apollo/hooks/nativeErrorWording';

// One size per list, changed later on its own (S23-LIST-PAGE-500; 021 data-model.md "Documents").
export const POSTS_FIRST = 500;
export const MEMBERS_FIRST = 500;

/**
 * What a mounted space page shows (021 data-model.md "The page needs"): SpacePage's root, the Space document. The
 * page's posts and subspaces are its SPACE TREE, one read of its own (useSpaceTree, spaces 2026-11-26); the virtual
 * contributors are their widget's members read (useSpaceVirtualContributors).
 */
export type SpacePageNeed = 'space';

export const spacePageVariables = (space: string, needs: readonly SpacePageNeed[]): SpacePageQueryVariables => ({
  space,
  withSpace: needs.includes('space'),
});

export const spaceTreeVariables = (space: string) => ({ space, treeFirst: POSTS_FIRST });

/**
 * A read the server does not serve yet: its selection admission refuses the operation (a top-level UNAVAILABLE) or its
 * schema validation does (a VALIDATION on no field path, HTTP 422, e.g. an argument it does not declare yet).
 */
export const isNotServedYet = (error: ApolloError | undefined) => {
  const errors = [
    ...(error?.graphQLErrors ?? []),
    ...(((error?.networkError as ServerError | null)?.result as { errors?: unknown[] } | undefined)?.errors ?? []),
  ] as Array<{ extensions?: { code?: unknown }; path?: unknown }>;
  return errors.some(
    e =>
      (e.extensions?.code === NativeErrorCode.UNAVAILABLE || e.extensions?.code === NativeErrorCode.VALIDATION) &&
      !e.path
  );
};

/** Reads the server answered as not served, by read and subject: asked once, never retried (spaces 2026-11-26). */
const notServedReads = new Set<string>();

/** Whether a read of this subject was already refused as not served (then it is not sent again). */
export const wasNotServed = (read: string, subject: string | undefined) =>
  Boolean(subject && notServedReads.has(`${read} ${subject}`));

/** A read's not-served state: remembered once the server refuses it, so its slots say so without a retry. */
export const useNotServed = (read: string, subject: string | undefined, error: ApolloError | undefined) => {
  const notServed = wasNotServed(read, subject) || isNotServedYet(error);
  useEffect(() => {
    if (subject && notServed) notServedReads.add(`${read} ${subject}`);
  }, [read, subject, notServed]);
  return notServed;
};

/** Continuation pages already asked for, by read, subject and cursor: each is sent once, whichever reader asks first. */
const continuations = new Set<string>();

/** Whether this continuation page is still to be asked for; marks it asked. */
const firstAsk = (read: string, subject: string, cursor: string) => {
  const key = `${read} ${subject} ${cursor}`;
  if (continuations.has(key)) return false;
  continuations.add(key);
  return true;
};

/**
 * The page's SPACE TREE (spaces 2026-11-26): ONE read of the space's whole subtree that does not enter child spaces
 * (SpaceTree, stopAt ["space"]), shared by every section that shows it (its readers share the one request and its
 * cache). It is continued with the same read and `after`, appended to the stored list while the server has more, with
 * no control (S23-LIST-PAGE-500), so every reader sees the whole tree. Until the server serves the read, `notServed`
 * and the tree's sections say "not available yet" in place.
 */
export function useSpaceTree(space: string | undefined) {
  const { data, error, loading, fetchMore } = useSpaceTreeQuery({
    variables: spaceTreeVariables(space ?? ''),
    skip: !space || wasNotServed('tree', space),
  });
  const notServed = useNotServed('tree', space, error);
  const tree = data?.tree ?? undefined;
  const endCursor = tree?.pageInfo.hasNextPage ? tree.pageInfo.endCursor : undefined;
  useEffect(() => {
    if (!space || !endCursor || !firstAsk('tree', space, endCursor)) return;
    void fetchMore({
      variables: { ...spaceTreeVariables(space), after: endCursor },
      updateQuery: (previous, { fetchMoreResult }) => ({
        ...previous,
        tree: fetchMoreResult.tree && appendPage(previous.tree, fetchMoreResult.tree),
      }),
    });
  }, [space, endCursor, fetchMore]);
  return { tree, notServed, loading: loading && !notServed };
}

/**
 * The space's virtual contributors (the members reader), a read of its own: `members` is undefined until it arrives,
 * continued with `after` while the server has more (merged by the members field policy; S23-LIST-PAGE-500), and while
 * the server does not serve it the widget says "not available yet" in place.
 */
export function useSpaceVirtualContributors(space: string | undefined) {
  const { data, error, fetchMore } = useSpaceVirtualContributorsQuery({
    variables: { space: space ?? '', membersFirst: MEMBERS_FIRST },
    skip: !space || wasNotServed('vcs', space),
  });
  const notServed = useNotServed('vcs', space, error);
  const members = data?.members;
  const endCursor = members?.pageInfo.hasNextPage ? members.pageInfo.endCursor : undefined;
  useEffect(() => {
    if (!space || !endCursor || !firstAsk('vcs', space, endCursor)) return;
    void fetchMore({ variables: { after: endCursor } });
  }, [space, endCursor, fetchMore]);
  return { members, notServed };
}

/**
 * The page's one request (021 FR-005): every page action sends one SpacePage carrying exactly the needs the
 * cache does not hold yet, so a tab switch never re-reads the Space document and a cached list is never re-sent.
 * A cold post URL carries its post in the same request (SpacePageWithPost).
 */
export function useSpacePageLoad(
  space: string | undefined,
  needs: SpacePageNeed[],
  /** The post a post, response, task or event URL opens: D1's node, or its parent (D2 SpacePageWithPost). */
  post?: string
) {
  const { cache } = useApolloClient();
  const missing = space
    ? needs.filter(need => !cache.readQuery({ query: SpacePageDocument, variables: spacePageVariables(space, [need]) }))
    : [];
  const postMissing = Boolean(
    space && post && !cache.readQuery({ query: PostDetailDocument, variables: { id: post } })
  );
  const variables = spacePageVariables(space ?? '', missing);
  const page = useSpacePageQuery({ variables, skip: postMissing || missing.length === 0 });
  const withPost = useSpacePageWithPostQuery({ variables: { ...variables, post: post ?? '' }, skip: !postMissing });
  const error = page.error ?? withPost.error;
  if (error) throw error;
}

/** One need's part of the page, read from the cache the page's load fills; undefined until it arrives. */
export const useSpacePageData = (space: string | undefined, need: SpacePageNeed) =>
  useSpacePageQuery({
    variables: spacePageVariables(space ?? '', [need]),
    skip: !space,
    fetchPolicy: 'cache-only',
  }).data;

type TreeNode = NonNullable<SpaceTreeQuery['tree']>['edges'][number]['node'];

/** A tree row that is a post: `contentKind` is the Post arm's own field (no __typename discrimination). */
export const isPostNode = <N extends object>(node: N): node is Extract<N, { contentKind: string }> =>
  'contentKind' in node;

/** A tree row that is a subspace: `isContentPublic` is the Space arm's own field among the tree's rows. */
export const isSubspaceNode = <N extends object>(node: N): node is Extract<N, { isContentPublic: boolean }> =>
  'isContentPublic' in node;

type TreeRows = { edges: ReadonlyArray<{ node: TreeNode }> } | null | undefined;

/** The space's own posts from its tree (depth 1: no parentPost), in their designed order (MANUAL: sortOrder). */
export const treePosts = (tree: TreeRows) =>
  (tree?.edges ?? [])
    .map(edge => edge.node)
    .filter(isPostNode)
    .filter(post => !post.parentPost)
    .sort((a, b) => a.sortOrder - b.sortOrder);

/** One post's responses, tasks or form responses: its child posts in the space tree (depth 2), in their designed order. */
export const treeResponses = (tree: TreeRows, postId: string) =>
  (tree?.edges ?? [])
    .map(edge => edge.node)
    .filter(isPostNode)
    .filter(row => row.parentPost?.id === postId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

/**
 * One post's responses from the page's space tree (no request of their own): `responses` is undefined until the tree
 * has arrived, `complete` once its last page has, `notServed` while the server does not serve the tree read yet.
 */
export const usePostResponses = (space: string | undefined, postId: string | undefined) => {
  const { tree, notServed } = useSpaceTree(space);
  return {
    responses: tree && postId ? treeResponses(tree, postId) : undefined,
    complete: Boolean(tree && !tree.pageInfo.hasNextPage),
    notServed,
  };
};

/** The space's direct subspaces from its tree, in the tree's signed child order (FC-S2). */
export const treeSubspaces = (tree: TreeRows) => (tree?.edges ?? []).map(edge => edge.node).filter(isSubspaceNode);

/** A continuation page appended to the stored list (subtree has no cache merge; useSpaceExplorer appends the same way). */
export const appendPage = <C extends { edges: readonly unknown[] }>(previous: C | null | undefined, next: C): C => ({
  ...next,
  edges: [...(previous?.edges ?? []), ...next.edges],
});

type StageRef = { id: string; sortOrder: number };

/** Stages in their designed order, sortOrder then id (021 FR-006). */
export const orderedStages = <S extends StageRef>(stages: readonly S[] | null | undefined): S[] =>
  [...(stages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
