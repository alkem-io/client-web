import { useDashboardSpacesQuery, useInnovationHubByIdQuery } from '@/core/apollo/generated/apollo-hooks';
import { type InnovationHubHomeInnovationHubFragment, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
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
  //
  // Fetch ALL visibilities (not the default ACTIVE-only): the hub's curated
  // `spaceListFilter` may include DEMO / INACTIVE / ARCHIVED Spaces, and those must
  // still appear on the home. The mapper intersects this list with the curated ids,
  // so only the hub's Spaces are ever shown — the extra visibilities just ensure none
  // are dropped for being non-active.
  const { data: spacesData } = useDashboardSpacesQuery({
    variables: {
      visibilities: [SpaceVisibility.Active, SpaceVisibility.Demo, SpaceVisibility.Inactive, SpaceVisibility.Archived],
    },
  });

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
