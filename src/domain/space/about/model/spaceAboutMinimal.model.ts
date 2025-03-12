export type SpaceAboutMinimalModel = {
  id: string;
  profile: {
    id: string;
    displayName: string;
    tagline?: string | undefined;
  };
};

export type SpaceAboutMinimalUrlModel = {
  id: string;
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
