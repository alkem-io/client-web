import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

export type CommunityApplication = {
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
      email?: string;
      url: string;
      avatar?: { uri: string; name: string };
      location?: { city?: string; country?: string };
    };
  };
  questions: { id: string; name: string; value: string }[];
};
