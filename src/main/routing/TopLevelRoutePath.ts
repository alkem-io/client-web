export enum TopLevelRoutePath {
  Admin = 'admin',
  User = 'user',
  VirtualContributor = 'vc',
  Organization = 'organization',
  InnovationLibrary = 'innovation-library',
  InnovationPacks = 'innovation-packs',
  InnovationHubs = 'innovation-hubs',
  CreateSpace = 'create-space',
  Home = 'home',
  Spaces = 'spaces',
  Contributors = 'contributors',
  Forum = 'forum',
  About = 'about',
  Profile = 'profile',
  Restricted = 'restricted',
  Docs = 'docs',
  Documentation = 'documentation',
  Contact = 'contact',
  _Landing = 'landing', // Legacy route that redirects to Welcome site
  _Identity = 'identity', // Legacy route that's not used anymore but is decided to be reserved
}

export const reservedTopLevelRoutePaths = Object.values(TopLevelRoutePath) as string[]; // Don't need excessive typing here for easier testing with .includes()
