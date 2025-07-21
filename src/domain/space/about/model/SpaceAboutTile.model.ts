export type SpaceAboutTileModel = {
  profile: {
    displayName: string;
    avatar?: {
      uri: string;
      alternativeText?: string;
    };
    cardBanner?: {
      uri: string;
      alternativeText?: string;
    };
    url: string;
  };
  isContentPublic?: boolean;
};
