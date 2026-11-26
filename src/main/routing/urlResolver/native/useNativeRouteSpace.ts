import { useContext } from 'react';
import { type NativeRouteResolutionQuery, ResolveState } from '@/core/apollo/generated-v2/graphql-schema';
import { UrlResolverContext } from '../UrlResolverProvider';

type Resolution = NativeRouteResolutionQuery['resolve'];
export type RouteAncestor = Extract<Resolution['ancestors'][number], { __typename: 'Space' }>;
type RouteNode = NonNullable<Resolution['node']>;
type RouteSpaceNode = Extract<RouteNode, { __typename: 'Space' }>;
export type RoutePost = Extract<RouteNode, { __typename: 'Post' }>;

/**
 * 021 D1: the resolution UrlResolverProvider holds for this pathname, from its context, so it changes in the same render
 * as the provider's ids (a cache watcher of its own lagged one render, and the page's first request went out without
 * the URL's post, then was cancelled and re-sent; QA E1): the owning space's page inputs (the node when it is a space,
 * else `resolve.space`), the returned root-first ancestors and the post the URL names, and whether the viewer may read
 * the resolved node (a FORBIDDEN space resolves to its face only, whose page reads nothing beyond its Space document).
 * No request of its own.
 */
export function useNativeRouteSpace() {
  const { resolution } = useContext(UrlResolverContext);
  const node = resolution?.node;
  const space = node?.entityType === 'space' ? (node as RouteSpaceNode) : (resolution?.space ?? undefined);
  const ancestors = (resolution?.ancestors ?? []).filter(
    (ancestor): ancestor is RouteAncestor => ancestor.entityType === 'space'
  );
  return {
    space,
    ancestors,
    root: ancestors.find(ancestor => ancestor.depth === 0),
    post: node?.entityType === 'post' ? (node as RoutePost) : undefined,
    readable: resolution?.state !== ResolveState.Forbidden,
  };
}
