export interface SpaceBodyOfKnowledgeModel {
  // TODO: avatar is for subspaces, add cardBanner if we want support of Spaces as BOK
  avatar?: {
    uri: string;
  };
  displayName: string;
  tagline?: string;
  url: string;
}
