import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';

export type HubAboutFormValues = {
  subdomain: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  bannerImageUrl?: string;
};

export const mapInnovationHubToAboutValues = (hub: InnovationHubSettingsFragment): HubAboutFormValues => ({
  subdomain: hub.subdomain,
  name: hub.profile.displayName,
  tagline: hub.profile.tagline ?? '',
  description: hub.profile.description ?? '',
  tags: hub.profile.tagset?.tags ?? [],
  bannerImageUrl: hub.profile.visual?.uri || undefined,
});
