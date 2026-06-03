import {
  AuthorizationPrivilege,
  type InnovationHubHomeInnovationHubFragment,
  InnovationHubType,
} from '@/core/apollo/generated/graphql-schema';
import type { InnovationHubHomeData } from '@/crd/components/innovationHub/InnovationHubHome';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { SpaceWithParent } from '@/main/crdPages/spaces/SpaceExplorerPage';
import { mapSpacesToCardDataList } from '@/main/crdPages/spaces/spaceCardDataMapper';
import { buildMainDomainUrl, buildSettingsUrl, URL_SPACE_EXPLORER } from '@/main/routing/urlBuilders';

export type MapInnovationHubToHomeDataInput = {
  hub: InnovationHubHomeInnovationHubFragment;
  canonicalDomain: string;
};

/**
 * Maps the hub's stable "header" data (banner, name, tagline, description, links). It does
 * NOT depend on the Spaces query — so its result stays referentially stable while Spaces
 * load, letting the banner/header subtree skip re-rendering (only the Spaces section
 * updates when Spaces arrive). The Spaces themselves are mapped by `mapInnovationHubSpaces`.
 */
export const mapInnovationHubToHomeData = ({
  hub,
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
    // Use `nameID` — the route is `/hub/:innovationHubNameId` and the server's
    // URL resolver expects nameID. `subdomain` is only for the hostname.
    settingsUrl: canEdit ? buildSettingsUrl(`/hub/${hub.nameID}`) : undefined,
    // Always points off the current host (subdomain or otherwise) to the canonical
    // platform Spaces explorer. `buildMainDomainUrl` tolerates `locations.domain`
    // being either a bare host (`alkemio.org`) or a full URL (`http://localhost:3000`).
    allSpacesUrl: buildMainDomainUrl(URL_SPACE_EXPLORER, canonicalDomain),
  };
};

/**
 * Maps the ordered Spaces list shown on the hub home — exactly the hub's configured
 * Spaces, never the whole platform ("explore Spaces"). Kept separate from the header
 * mapper so it can recompute (and re-render only the Spaces section) as the Spaces query
 * resolves, without touching the stable header.
 *
 * - `visibility` hub: the caller fetched Spaces matching the hub's `spaceVisibilityFilter`,
 *   so those results ARE the hub's Spaces — show them all.
 *
 * - `list` hub: show only the curated `spaceListFilter`, in the admin's order, by
 *   intersecting with the (all-visibilities) `DashboardSpaces` data. A curated Space is
 *   kept regardless of its own visibility; only Spaces genuinely absent from the platform
 *   results (deleted / inaccessible) are dropped. An empty list shows nothing.
 */
export const mapInnovationHubSpaces = (
  hub: InnovationHubHomeInnovationHubFragment,
  dashboardSpaces: readonly SpaceWithParent[] | undefined,
  authenticated: boolean
): SpaceCardData[] => {
  if (hub.type === InnovationHubType.Visibility) {
    return mapSpacesToCardDataList(dashboardSpaces as SpaceWithParent[] | undefined, authenticated);
  }
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
