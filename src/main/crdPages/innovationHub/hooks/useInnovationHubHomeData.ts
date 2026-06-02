import { useDashboardSpacesQuery, useInnovationHubByIdQuery } from '@/core/apollo/generated/apollo-hooks';
import type { InnovationHubHomeInnovationHubFragment } from '@/core/apollo/generated/graphql-schema';
import type { InnovationHubHomeData } from '@/crd/components/innovationHub/InnovationHubHome';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import type { SpaceWithParent } from '@/main/crdPages/spaces/SpaceExplorerPage';
import { mapInnovationHubToHomeData } from '../dataMappers/mapInnovationHubToHomeData';

export type UseInnovationHubHomeDataInput =
  | { kind: 'byId'; id: string }
  | { kind: 'bySubdomain'; hub: InnovationHubHomeInnovationHubFragment | undefined };

export type UseInnovationHubHomeDataResult = {
  data: InnovationHubHomeData | undefined;
  hub: InnovationHubHomeInnovationHubFragment | undefined;
  loading: boolean;
};

export const useInnovationHubHomeData = (input: UseInnovationHubHomeDataInput): UseInnovationHubHomeDataResult => {
  // `byId`: resolves the hub via the home fragment query (used by /hub/<slug>).
  // `bySubdomain`: the caller has already resolved the hub through `useInnovationHub()`
  //   (subdomain branch in CrdHomePage), so we skip the duplicate fetch.
  const byIdActive = input.kind === 'byId';
  const { data: hubByIdData, loading: hubByIdLoading } = useInnovationHubByIdQuery({
    variables: { id: byIdActive ? input.id : '' },
    skip: !byIdActive,
  });

  const resolvedHub: InnovationHubHomeInnovationHubFragment | undefined =
    input.kind === 'byId' ? hubByIdData?.platform.innovationHub : input.hub;

  // Spaces are secondary content: the page renders the hub (banner, description)
  // as soon as the hub fragment resolves, and the curated Spaces section fills in
  // when `DashboardSpaces` returns. Mirrors the legacy pages, which never block
  // the whole page on the spaces query.
  const { data: spacesData } = useDashboardSpacesQuery();

  const { isAuthenticated } = useCurrentUserContext();
  const { locations } = useConfig();

  const loading = byIdActive && hubByIdLoading;

  if (!resolvedHub) {
    return { data: undefined, hub: undefined, loading };
  }

  const data = mapInnovationHubToHomeData({
    hub: resolvedHub,
    // `useDashboardSpacesQuery` returns the full `SpaceCard` fragment shape per
    // `DashboardSpaces.graphql`, which matches `SpaceWithParent` structurally.
    dashboardSpaces: spacesData?.spaces as unknown as readonly SpaceWithParent[] | undefined,
    authenticated: isAuthenticated,
    canonicalDomain: locations?.domain ?? '',
  });

  return { data, hub: resolvedHub, loading };
};
