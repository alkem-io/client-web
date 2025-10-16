export type LinkDetails = {
  id?: string;
  uri: string;
  profile: {
    displayName: string;
    description?: string;
  };
};
