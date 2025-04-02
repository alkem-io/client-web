import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

export type InvitationProvided = {
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: string[];
  contributorType: RoleSetContributorType;
  contributor: {
    id: string;
    profile: {
      id: string;
      displayName: string;
      email?: string;
      url: string;
      avatar?: {
        id: string;
        uri: string;
      };
      location?: {
        city?: string | undefined;
        country?: string | undefined;
      };
    };
  };
};
