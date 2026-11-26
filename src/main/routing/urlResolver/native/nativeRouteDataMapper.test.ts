import { describe, expect, test } from 'vitest';
import { SpaceLevel, UrlType } from '@/core/apollo/generated/graphql-schema';
import { type NativeRouteResolutionQuery, ResolveState, SpaceKind } from '@/core/apollo/generated-v2/graphql-schema';
import { nativeClosestAncestor, nativeRouteData } from './nativeRouteDataMapper';

const inputs = (depth: number) => ({ depth, url: null, settings: null, stages: [] });
const face = { displayName: 'Space' };
const resolution = (depth = 0): NativeRouteResolutionQuery['resolve'] => ({
  state: ResolveState.Ok,
  matchedPrefix: '/root',
  remainder: [],
  node: {
    __typename: 'Space',
    entityType: 'space',
    id: depth ? 'child' : 'root',
    kind: SpaceKind.Space,
    ...inputs(depth),
  },
  space: { entityType: 'space', id: depth ? 'child' : 'root', kind: SpaceKind.Space, ...inputs(depth) },
  ancestors: depth
    ? [{ __typename: 'Space', entityType: 'space', id: 'root', depth: 0, kind: SpaceKind.Space, about: face }]
    : [],
  homepage: null,
  closestReadable: null,
});

describe('legacy route context from native resolution', () => {
  test('keeps returned parent and root IDs without turning unrelated ancestors into spaces', () => {
    const data = resolution(1);
    data.ancestors.unshift({ __typename: 'Organization', entityType: 'organization', id: 'physical-owner' });
    expect(nativeRouteData(data)).toMatchObject({
      type: UrlType.Space,
      spaceId: 'child',
      levelZeroSpaceId: 'root',
      spaceLevel: SpaceLevel.L1,
      parentSpaceId: 'root',
      spaceHierarchyPath: ['root', 'child'],
    });
    expect(nativeRouteData(data).collaborationId).toBeUndefined();
    expect(nativeRouteData(data).calloutsSetId).toBeUndefined();
  });
  test('retains every returned level beyond three without inventing parent IDs', () => {
    const data = resolution(5);
    data.ancestors = Array.from({ length: 5 }, (_, depth) => ({
      __typename: 'Space',
      entityType: 'space',
      id: `level-${depth}`,
      depth,
      kind: SpaceKind.Space,
      about: face,
    }));
    expect(nativeRouteData(data)).toMatchObject({
      spaceId: 'child',
      parentSpaceId: 'level-4',
      levelZeroSpaceId: 'level-0',
      spaceHierarchyPath: ['level-0', 'level-1', 'level-2', 'level-3', 'level-4', 'child'],
    });
  });
  test('uses the actual resolved target instead of its nearest readable space', () => {
    const data = resolution(1);
    data.space = { entityType: 'space', id: 'root', kind: SpaceKind.Space, ...inputs(0) };
    expect(nativeRouteData(data).spaceId).toBe('child');
  });
  test('does not turn a resolved Post into its containing Space route', () => {
    const data = {
      ...resolution(),
      node: { __typename: 'Post' as const, entityType: 'post', id: 'post', contentKind: 'text' },
    };
    expect(nativeRouteData(data)).toMatchObject({ type: undefined, spaceId: 'root', postId: 'post' });
  });
  test('does not invent a root when the declared hierarchy is incomplete', () => {
    expect(nativeRouteData({ ...resolution(1), ancestors: [] })).toMatchObject({
      spaceId: 'child',
      levelZeroSpaceId: undefined,
      spaceHierarchyPath: undefined,
    });
  });
  test('preserves the served actor face and has no stale space context on a profile route', () => {
    expect(
      nativeRouteData({ ...resolution(), node: { __typename: 'User', entityType: 'user', id: 'u' }, space: null })
    ).toMatchObject({
      type: UrlType.User,
      userId: 'u',
      spaceId: undefined,
      levelZeroSpaceId: undefined,
    });
  });
  test('uses the actual virtual-contributor entity type carried by GraphQL Agent', () => {
    expect(
      nativeRouteData({
        ...resolution(),
        node: { __typename: 'Agent', entityType: 'virtual_contributor', id: 'vc' },
        space: null,
      })
    ).toMatchObject({
      type: UrlType.VirtualContributor,
      vcId: 'vc',
      spaceId: undefined,
    });
  });
  test('closest-ancestor navigation requires its actual returned URL', () => {
    expect(
      nativeClosestAncestor({
        ...resolution(),
        closestReadable: { __typename: 'Space', entityType: 'space', id: 'root', url: null },
      })
    ).toBeUndefined();
    expect(
      nativeClosestAncestor({
        ...resolution(),
        closestReadable: { __typename: 'Space', entityType: 'space', id: 'root', url: '/root' },
      })
    ).toEqual({
      type: UrlType.Space,
      url: '/root',
      space: { id: 'root' },
    });
  });
});
