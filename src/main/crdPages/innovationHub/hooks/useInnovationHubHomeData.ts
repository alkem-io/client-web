import { useTranslation } from 'react-i18next';
import { useDashboardSpacesQuery, useInnovationHubByIdQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  type InnovationHubHomeInnovationHubFragment,
  InnovationHubType,
  SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import type { VirtualContributorCardItem } from '@/crd/components/common/profileTypes';
import type { InnovationHubHomeData } from '@/crd/components/innovationHub/InnovationHubHome';
import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import type { SpaceWithParent } from '@/main/crdPages/spaces/SpaceExplorerPage';
import {
  mapInnovationHubPacks,
  mapInnovationHubSpaces,
  mapInnovationHubToHomeData,
  mapInnovationHubVirtualContributors,
} from '../dataMappers/mapInnovationHubToHomeData';

export type UseInnovationHubHomeDataInput =
  | { kind: 'byId'; id: string }
  | { kind: 'bySubdomain'; hub: InnovationHubHomeInnovationHubFragment | undefined };

export type UseInnovationHubHomeDataResult = {
  /** Stable hub "header" data (banner, name, links) — unchanged while Spaces load. */
  data: InnovationHubHomeData | undefined;
  /** The hub's Spaces — recomputed independently as the Spaces query resolves. */
  spaces: SpaceCardData[];
  /** The hub's curated Innovation Packs — empty when the list is empty or its slice failed to resolve (FR-010). */
  packs: InnovationPackCardData[];
  /** The hub's curated Virtual Contributors — empty when the list is empty or its slice failed to resolve (FR-010). */
  virtualContributors: VirtualContributorCardItem[];
  hub: InnovationHubHomeInnovationHubFragment | undefined;
  loading: boolean;
  /** The Spaces query is in flight (the hub itself has already resolved). */
  spacesLoading: boolean;
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
  // as soon as the hub fragment resolves, and the Spaces section fills in when the
  // Spaces query returns. The whole page never blocks on it.
  //
  // The query's `visibilities` depend on the hub type so we fetch exactly the hub's
  // configured Spaces — never the whole platform ("explore Spaces"):
  // - `visibility` hub: fetch Spaces matching the hub's `spaceVisibilityFilter`; those
  //   ARE the hub's Spaces (the mapper shows them all).
  // - `list` hub: fetch across ALL visibilities so the curated `spaceListFilter` is
  //   resolved to full card data whatever each Space's visibility (the mapper then
  //   intersects down to exactly the curated ids).
  const isVisibilityHub = resolvedHub?.type === InnovationHubType.Visibility;
  const visibilities =
    isVisibilityHub && resolvedHub?.spaceVisibilityFilter
      ? [resolvedHub.spaceVisibilityFilter]
      : [SpaceVisibility.Active, SpaceVisibility.Demo, SpaceVisibility.Inactive, SpaceVisibility.Archived];
  const { data: spacesData, loading: spacesLoading } = useDashboardSpacesQuery({
    variables: { visibilities },
    skip: !resolvedHub,
  });

  const { isAuthenticated } = useCurrentUserContext();
  const { locations } = useConfig();
  const { t } = useTranslation('crd-innovationHub');

  const loading = byIdActive && hubByIdLoading;

  if (!resolvedHub) {
    return { data: undefined, spaces: [], packs: [], virtualContributors: [], hub: undefined, loading, spacesLoading };
  }

  // Header data depends only on the (stable) hub — kept separate from `spaces` so it
  // doesn't get a new reference each time the Spaces query updates, which is what keeps
  // the banner/header subtree from re-rendering when only the Spaces change.
  const data = mapInnovationHubToHomeData({
    hub: resolvedHub,
    canonicalDomain: locations?.domain ?? '',
  });

  // `useDashboardSpacesQuery` returns the full `SpaceCard` fragment shape per
  // `DashboardSpaces.graphql`, which matches `SpaceWithParent` structurally.
  const spaces = mapInnovationHubSpaces(
    resolvedHub,
    spacesData?.spaces as unknown as readonly SpaceWithParent[] | undefined,
    isAuthenticated
  );

  // Curated packs/VCs resolve on the hub fragment itself (stored order, already
  // visibility-filtered by the server). A slice the server could not resolve
  // arrives as null and maps to [] — the section is simply omitted, the rest of
  // the page renders as usual (FR-010).
  const packs = mapInnovationHubPacks(resolvedHub);
  const virtualContributors = mapInnovationHubVirtualContributors(
    resolvedHub,
    t('home.virtualContributorsSection.vcType')
  );

  return { data, spaces, packs, virtualContributors, hub: resolvedHub, loading, spacesLoading };
};
