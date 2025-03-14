export type SpaceAboutMinimalModel = {
  profile: {
    id: string;
    displayName: string;
    tagline?: string | undefined;
  };
};

export type SpaceAboutMinimalUrlModel = {
  profile: {
    id: string;
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
