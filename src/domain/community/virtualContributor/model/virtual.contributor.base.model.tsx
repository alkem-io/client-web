import { Tagset } from '@/core/apollo/generated/graphql-schema';

export type VirtualContributorModelBase = {
  id: string;
  profile: {
    displayName: string;
    url: string;
    tagsets?: Tagset[];
    location?: {
      city?: string;
      country?: string;
    };
    avatar?: {
      uri: string;
    } | null;
  };
};
