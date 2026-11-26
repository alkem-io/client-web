import type { PostCardFragment, ResponseCardFragment } from '@/core/apollo/generated-v2/graphql-schema';

/** D2 fixtures (021 data-model.md PostCard / ResponseCard), complete for cache writes. */
export const nativeActor = (id = 'user-1', displayName = 'Ada') => ({
  __typename: 'User' as const,
  id,
  actorType: 'user',
  url: `/user/${id}`,
  about: {
    __typename: 'About' as const,
    displayName,
    avatar: { __typename: 'FileRef' as const, alt: null, file: { __typename: 'File' as const, url: `/avatar/${id}` } },
  },
});

export const nativeResponse = (id: string, overrides: Partial<ResponseCardFragment> = {}): ResponseCardFragment => ({
  __typename: 'Post',
  id,
  url: `/response/${id}`,
  contentKind: 'text',
  createdAt: '2026-01-02T00:00:00.000Z',
  tags: ['tag'],
  sortOrder: 0,
  stage: null,
  about: { __typename: 'About', displayName: `Response ${id}`, description: 'Body' },
  links: [],
  author: nativeActor(),
  room: { __typename: 'Room', id: `room-${id}`, messageCount: 2 },
  can: { __typename: 'PostCan', update: false, delete: false, moveTask: false },
  content: null,
  ...overrides,
});

export const nativePost = (id: string, overrides: Partial<PostCardFragment> = {}): PostCardFragment => ({
  __typename: 'Post',
  id,
  url: `/space/collaboration/${id}`,
  handle: id,
  sortOrder: 0,
  postStatus: 'PUBLISHED',
  contentKind: 'text',
  createdAt: '2026-01-01T00:00:00.000Z',
  publishedAt: '2026-01-01T00:00:00.000Z',
  tags: ['alpha'],
  commentsEnabled: true,
  responseKind: null,
  responsePolicy: null,
  responseDefaults: null,
  responseCount: 0,
  stage: null,
  about: { __typename: 'About', displayName: `Post ${id}`, description: 'Description' },
  links: [],
  author: nativeActor(),
  publishedBy: nativeActor('user-2', 'Ben'),
  room: null,
  can: {
    __typename: 'PostCan',
    read: true,
    update: false,
    delete: false,
    respond: false,
    comment: false,
    move: false,
    moveTask: false,
    manageColumns: false,
  },
  content: null,
  parentPost: null,
  ...overrides,
});

/** A response, task or form response row of the page tree (depth 2): a post whose parent is `parentId`. */
export const nativeResponseRow = (parentId: string, id: string, overrides: Partial<PostCardFragment> = {}) =>
  nativePost(id, {
    url: `/response/${id}`,
    about: { __typename: 'About', displayName: `Response ${id}`, description: 'Body' },
    parentPost: { __typename: 'Post', id: parentId },
    ...overrides,
  });

/** The page's space tree (SpacePage `tree`, TreeContinuation): the space's posts and their response rows. */
export const treeOf = (rows: PostCardFragment[], hasNextPage = false, endCursor: string | null = null) => ({
  __typename: 'NodeConnection' as const,
  edges: rows.map(node => ({
    __typename: 'NodeEdge' as const,
    cursor: `cursor-${node.id}`,
    node: { ...node, entityType: 'post' },
  })),
  pageInfo: { __typename: 'PageInfo' as const, hasNextPage, endCursor },
  totalCount: rows.length,
});
