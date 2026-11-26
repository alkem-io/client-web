import { createContext, type ReactNode, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { NotAuthorizedError, NotFoundError } from '@/core/40XErrorHandler/40XErrors';
import type { SpaceLevel, UrlType } from '@/core/apollo/generated/graphql-schema';
import { useNativeRouteResolutionQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { type NativeRouteResolutionQuery, ResolveState } from '@/core/apollo/generated-v2/graphql-schema';
import { AUTH_REQUIRED_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { AuthenticationContext } from '@/core/auth/authentication/context/AuthenticationProvider';
import { ROUTE_USER_ME } from '@/domain/platform/routes/constants';
import { buildReturnUrlParam } from '../urlBuilders';
import { nativeClosestAncestor, nativeRouteData } from './native/nativeRouteDataMapper';

export type SpaceHierarchyPath = string[];

export type UrlResolverContextValue = {
  providerPresent: boolean;
  resolutionComplete: boolean;
  type: UrlType | undefined;
  // Space:
  /**
   * The current Space or Subspace Id, no matter the level
   */
  spaceId: string | undefined;
  spaceLevel: SpaceLevel | undefined;
  levelZeroSpaceId: string | undefined;
  /**
   * Actual root-first hierarchy at any depth
   */
  spaceHierarchyPath: SpaceHierarchyPath | undefined;
  /**
   * The parent space id of the current space
   */
  parentSpaceId: string | undefined;

  // Collaboration:
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
  calloutId: string | undefined;
  contributionId: string | undefined;
  postId: string | undefined;
  whiteboardId: string | undefined;

  // Calendar:
  calendarId: string | undefined;
  calendarEventId: string | undefined;

  // Contributors:
  organizationId: string | undefined;
  userId: string | undefined;
  vcId: string | undefined;

  // Forum:
  discussionId: string | undefined;

  // Templates
  innovationPackId: string | undefined;
  templatesSetId: string | undefined;
  templateId: string | undefined;

  // Innovation Hubs
  innovationHubId: string | undefined;

  remainder: string[];
  loading: boolean;
  /**
   * The provider's own route resolution (D1): its readers see it in the same render as the ids above, never a cache
   * watcher of their own one render behind (useNativeRouteSpace; QA E1).
   */
  resolution?: NativeRouteResolutionQuery['resolve'];
};

const emptyResult: UrlResolverContextValue = {
  providerPresent: false,
  resolutionComplete: false,
  type: undefined,
  spaceId: undefined,
  spaceLevel: undefined,
  levelZeroSpaceId: undefined,
  spaceHierarchyPath: [],
  parentSpaceId: undefined,
  collaborationId: undefined,
  calloutsSetId: undefined,
  calloutId: undefined,
  contributionId: undefined,
  postId: undefined,
  whiteboardId: undefined,
  calendarId: undefined,
  calendarEventId: undefined,
  organizationId: undefined,
  userId: undefined,
  vcId: undefined,
  discussionId: undefined,
  innovationPackId: undefined,
  templatesSetId: undefined,
  templateId: undefined,
  innovationHubId: undefined,
  remainder: [],
  loading: true,
};

const providerEmptyResult: UrlResolverContextValue = {
  ...emptyResult,
  providerPresent: true,
};

const UrlResolverContext = createContext<UrlResolverContextValue>(emptyResult);

const UrlResolverProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useContext(AuthenticationContext);
  const location = useLocation();
  const skip = location.pathname === ROUTE_USER_ME || location.pathname.startsWith(`${ROUTE_USER_ME}/`);
  const url = new URL(location.pathname, globalThis.location.origin).href;
  const { data, error, loading } = useNativeRouteResolutionQuery({ variables: { url }, skip });
  const resolution = !skip && !loading ? data?.resolve : undefined;

  if (!skip && error) throw error;
  // Legacy (71f8 UrlResolverProvider:170-176) resolved a space a signed-in viewer may see but not read, and its protected
  // routes sent them to its About (CrdSpaceProtectedRoutes). The native resolve answers such a space FORBIDDEN with the
  // space itself, so it resolves the same way; anything else FORBIDDEN stays not authorized.
  const faceOnlySpace =
    isAuthenticated &&
    resolution?.state === ResolveState.Forbidden &&
    resolution.node?.entityType === 'space' &&
    Boolean(resolution.space);
  if (resolution?.state === ResolveState.NotFound || (resolution?.state === ResolveState.Forbidden && !faceOnlySpace)) {
    const params = !isAuthenticated
      ? {
          redirectUrl: `${AUTH_REQUIRED_PATH}${buildReturnUrlParam(location.pathname + location.search + location.hash)}`,
        }
      : { closestAncestor: nativeClosestAncestor(resolution) };
    if (resolution.state === ResolveState.NotFound) throw new NotFoundError(params);
    throw new NotAuthorizedError(params);
  }

  const value: UrlResolverContextValue = {
    ...providerEmptyResult,
    ...(resolution?.state === ResolveState.Ok || faceOnlySpace ? nativeRouteData(resolution) : {}),
    remainder: resolution?.remainder ?? [],
    resolution,
    resolutionComplete: skip || !loading,
    loading: !skip && loading,
  };
  return <UrlResolverContext value={value}>{children}</UrlResolverContext>;
};

export { UrlResolverProvider, UrlResolverContext };
