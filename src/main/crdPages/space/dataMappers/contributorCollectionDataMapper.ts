import type { ContributorCollectionByTypeQuery } from '@/core/apollo/generated/graphql-schema';
import type { ContributorCardData } from '@/crd/components/callout/ContributorCollection/ContributorCard';
import { contributorTypeFromServer } from '@/main/crdPages/space/callout/contributorCollectionMapper';

type ContributorItem = NonNullable<
  ContributorCollectionByTypeQuery['lookup']['callout']
>['framing']['contributors'][number];

/**
 * Maps a server `ContributorCollectionItem` to the plain CRD `ContributorCardData`
 * (feature 008, T005). Mirrors the existing member-card shape; location carries
 * the precise coordinates only when `hasValidCoordinates` is true, so the map
 * plots exactly the locatable subset and the rest fall into "no location data".
 */
export function mapContributorItemToCard(item: ContributorItem): ContributorCardData {
  const city = item.location?.city ?? undefined;
  const country = item.location?.country ?? undefined;
  const locationLabel = [city, country].filter(Boolean).join(', ') || undefined;
  const hasValidCoordinates = item.location?.hasValidCoordinates ?? false;

  return {
    id: item.id,
    type: contributorTypeFromServer(item.type),
    name: item.displayName,
    avatarUrl: item.avatarUrl ?? undefined,
    roleLabel: item.roleLabel ?? undefined,
    href: item.url ?? undefined,
    locationLabel,
    // Coordinates only when valid; city/country alone => no map plot (FR-012).
    latitude: hasValidCoordinates ? (item.location?.latitude ?? undefined) : undefined,
    longitude: hasValidCoordinates ? (item.location?.longitude ?? undefined) : undefined,
    hasValidCoordinates,
  };
}
