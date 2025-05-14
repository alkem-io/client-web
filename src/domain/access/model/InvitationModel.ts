import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

export type InvitationModel = {
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
    };
  };
};
