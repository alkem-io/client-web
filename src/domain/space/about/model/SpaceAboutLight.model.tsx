export type SpaceAboutLightModel = {
  id: string;
  profile: {
    id: string;
    displayName: string;
    tagline?: string;
    url: string;
    tagset?: {
      tags: string[];
    };
    avatar?: {
      id: string;
      uri: string;
      name: string;
    };
    cardBanner?: {
      id: string;
      uri: string;
      name: string;
    };
  };
};
