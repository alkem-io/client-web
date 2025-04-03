import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

export type CommunityInvitation = {
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: Array<string>;
  contributorType: RoleSetContributorType;
  contributor: {
    id: string;
    profile: {
      displayName: string;
      url: string;
      avatar?: { uri: string };
      location?: { city?: string; country?: string };
    };
  };
};
