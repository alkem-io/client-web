export type SpaceAboutLightModel = {
  profile: {
    displayName: string;
    tagline?: string;
    url: string;
    description?: string;
    tagset?: {
      tags: string[];
    };
    avatar?: {
      uri: string;
    };
    cardBanner?: {
      uri: string;
    };
  };
};
