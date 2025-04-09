export type SpaceAboutMinimalUrlModel = {
  profile: {
    displayName: string;
    tagline?: string | undefined;
    url: string;
  };
  membership?: {
    roleSetID?: string;
    myPrivileges?: string[];
  };
  provider?: {
    profile: {
      displayName: string;
    };
  };
};
