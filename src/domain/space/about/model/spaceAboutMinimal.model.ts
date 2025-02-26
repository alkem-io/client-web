export type SpaceAboutMinimalModel = {
  id: string;
  profile: {
    id: string;
    displayName: string;
    tagline?: string;
    url: string;
  };
};
