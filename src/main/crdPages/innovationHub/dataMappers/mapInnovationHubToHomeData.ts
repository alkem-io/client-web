import {
  AuthorizationPrivilege,
  type InnovationHubHomeInnovationHubFragment,
} from '@/core/apollo/generated/graphql-schema';
import type { InnovationHubHomeData } from '@/crd/components/innovationHub/InnovationHubHome';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { SpaceWithParent } from '@/main/crdPages/spaces/SpaceExplorerPage';
import { mapSpacesToCardDataList } from '@/main/crdPages/spaces/spaceCardDataMapper';
import { buildMainDomainUrl, buildSettingsUrl, URL_SPACE_EXPLORER } from '@/main/routing/urlBuilders';

/**
 * Builds the curated, ordered Spaces list shown on the hub home: intersects the hub's
 * `spaceListFilter` (id list, from the home fragment) with the rich `DashboardSpaces`
 * shape, preserving the admin's configured order. Spaces present in `spaceListFilter`
 * but absent from `dashboardSpaces` (e.g. unpublished / out-of-visibility) are dropped.
 */
const buildCuratedSpaces = (
  hub: InnovationHubHomeInnovationHubFragment,
  dashboardSpaces: readonly SpaceWithParent[] | undefined,
  authenticated: boolean
) => {
  const filterIds = hub.spaceListFilter?.map(s => s.id) ?? [];
  if (filterIds.length === 0 || !dashboardSpaces) {
    return [];
  }
  const byId = new Map(dashboardSpaces.map(space => [space.id, space]));
  const ordered: SpaceWithParent[] = [];
  for (const id of filterIds) {
    const space = byId.get(id);
    if (space) {
      ordered.push(space);
    }
  }
  return mapSpacesToCardDataList(ordered, authenticated);
};

export type MapInnovationHubToHomeDataInput = {
  hub: InnovationHubHomeInnovationHubFragment;
  dashboardSpaces: readonly SpaceWithParent[] | undefined;
  authenticated: boolean;
  canonicalDomain: string;
};

export const mapInnovationHubToHomeData = ({
  hub,
  dashboardSpaces,
  authenticated,
  canonicalDomain,
}: MapInnovationHubToHomeDataInput): InnovationHubHomeData => {
  const canEdit = hub.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

  return {
    name: hub.profile.displayName,
    tagline: hub.profile.tagline ?? '',
    description: hub.profile.description ?? '',
    bannerImageUrl: hub.profile.banner?.uri || undefined,
    bannerColor: pickColorFromId(hub.id),
    bannerAlt: hub.profile.banner?.alternativeText ?? hub.profile.displayName,
    settingsUrl: canEdit ? buildSettingsUrl(`/hub/${hub.nameID}`) : undefined,
    spaces: buildCuratedSpaces(hub, dashboardSpaces, authenticated),
    // Always points off the current host (subdomain or otherwise) to the canonical
    // platform Spaces explorer. `buildMainDomainUrl` tolerates `locations.domain`
    // being either a bare host (`alkemio.org`) or a full URL (`http://localhost:3000`).
    allSpacesUrl: buildMainDomainUrl(URL_SPACE_EXPLORER, canonicalDomain),
  };
};
