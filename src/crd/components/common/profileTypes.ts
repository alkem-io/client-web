export type TagsetGroup = {
  key: string;
  name: string;
  tags: string[];
};

export type ReferenceLink = {
  id: string;
  name: string;
  uri: string;
  description: string | null;
};

export type VirtualContributorCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  type: string;
  href: string;
};

export type SimpleResourceCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  href: string;
  avatarImageUrl: string | null;
};
