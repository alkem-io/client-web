import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';
import { SpaceLevel, UrlType } from '@/core/apollo/generated/graphql-schema';
import { type NativeRouteResolutionQuery, SpaceKind } from '@/core/apollo/generated-v2/graphql-schema';
import type { UrlResolverContextValue } from '../UrlResolverProvider';

type Resolution = NativeRouteResolutionQuery['resolve'];
type RouteSpace = Extract<Resolution['ancestors'][number], { __typename: 'Space' }>;
const level = (depth: number | undefined) =>
  depth === 0 ? SpaceLevel.L0 : depth === 1 ? SpaceLevel.L1 : depth === 2 ? SpaceLevel.L2 : undefined;

// fed85 UrlResolverProvider:282–360: hierarchy and entity carriers come from
// resolution, never from parsing a URL or inventing retired collaboration IDs.
export function nativeRouteData(resolution: Resolution): Partial<UrlResolverContextValue> {
  const node = resolution.node;
  const space =
    node?.entityType === 'space' && (node as RouteSpace).kind === SpaceKind.Space
      ? (node as RouteSpace)
      : resolution.space?.kind === SpaceKind.Space
        ? resolution.space
        : undefined;
  const spaces: Array<Pick<RouteSpace, 'id' | 'depth' | 'kind'>> = resolution.ancestors.filter(
    (value): value is RouteSpace => value.entityType === 'space' && (value as RouteSpace).kind === SpaceKind.Space
  );
  if (space) spaces.push(space);
  const hierarchy = [...new Map(spaces.map(value => [value.id, value])).values()].sort((a, b) => a.depth - b.depth);
  const path = hierarchy.every((value, index) => value.depth === index) ? hierarchy.map(value => value.id) : undefined;
  const type =
    node?.entityType === 'user'
      ? UrlType.User
      : node?.entityType === 'organization'
        ? UrlType.Organization
        : node?.entityType === 'virtual_contributor'
          ? UrlType.VirtualContributor
          : node?.entityType === 'space' && (node as RouteSpace).kind === SpaceKind.Pack
            ? UrlType.InnovationPacks
            : node?.entityType === 'space' && (node as RouteSpace).kind === SpaceKind.Homepage
              ? UrlType.InnovationHub
              : node?.entityType === 'space' && (node as RouteSpace).kind === SpaceKind.Space
                ? UrlType.Space
                : undefined;
  return {
    type,
    spaceId: space?.id,
    spaceLevel: level(space?.depth),
    spaceHierarchyPath: path,
    levelZeroSpaceId: path?.[0],
    parentSpaceId: space ? hierarchy.find(value => value.depth === space.depth - 1)?.id : undefined,
    userId: node?.entityType === 'user' ? node.id : undefined,
    organizationId: node?.entityType === 'organization' ? node.id : undefined,
    vcId: node?.entityType === 'virtual_contributor' ? node.id : undefined,
    innovationPackId:
      node?.entityType === 'space' && (node as RouteSpace).kind === SpaceKind.Pack ? node.id : undefined,
    innovationHubId: resolution.homepage?.id,
    postId: node?.entityType === 'post' ? node.id : undefined,
    templateId: node?.entityType === 'template' ? node.id : undefined,
  };
}

export function nativeClosestAncestor(resolution: Resolution): ClosestAncestor | undefined {
  const ancestor = resolution.closestReadable;
  const space =
    ancestor?.entityType === 'space'
      ? (ancestor as Extract<NonNullable<Resolution['closestReadable']>, { __typename: 'Space' }>)
      : undefined;
  return space?.url ? { url: space.url, type: UrlType.Space, space: { id: space.id } } : undefined;
}
