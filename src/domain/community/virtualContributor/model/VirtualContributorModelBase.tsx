import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export type VirtualContributorModelBase = {
  id: string;
  profile: {
    displayName: string;
    url: string;
    tagsets?: TagsetModel[];
    location?: {
      city?: string;
      country?: string;
    };
    avatar?: {
      uri: string;
    } | null;
  };
};
