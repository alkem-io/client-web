import { type InnovationHubSpaceFragment, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';

export type SpaceVisibilityVariant = 'active' | 'demo' | 'inactive' | 'archived' | 'unknown';

export type HubSpacesTableRow = {
  id: string;
  name: string;
  visibility: SpaceVisibilityVariant;
  visibilityLabel: string;
  hostAccount: string;
  spaceUrl: string;
};

export const normalizeSpaceVisibility = (value: SpaceVisibility | undefined | null): SpaceVisibilityVariant => {
  switch (value) {
    case SpaceVisibility.Active:
      return 'active';
    case SpaceVisibility.Demo:
      return 'demo';
    case SpaceVisibility.Inactive:
      return 'inactive';
    case SpaceVisibility.Archived:
      return 'archived';
    default:
      return 'unknown';
  }
};

type TFunction = (key: string) => string;

export const mapInnovationHubSpaceToTableRow = (space: InnovationHubSpaceFragment, t: TFunction): HubSpacesTableRow => {
  const visibility = normalizeSpaceVisibility(space.visibility);
  return {
    id: space.id,
    name: space.about.profile.displayName,
    visibility,
    visibilityLabel: t(`settings.spaces.visibility.${visibility}`),
    hostAccount: space.about.provider?.profile?.displayName ?? '—',
    spaceUrl: space.about.profile.url,
  };
};
