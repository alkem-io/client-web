import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';
import { getInitials } from '@/crd/lib/getInitials';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { HubSettingsHeaderData } from '@/main/crdPages/innovationHub/CrdInnovationHubSettingsPage.types';

export const mapInnovationHubToSettingsHeader = (hub: InnovationHubSettingsFragment): HubSettingsHeaderData => ({
  name: hub.profile.displayName,
  tagline: hub.profile.tagline ?? '',
  bannerImageUrl: hub.profile.visual?.uri || undefined,
  thumbnailColor: pickColorFromId(hub.id),
  initials: getInitials(hub.profile.displayName),
});
