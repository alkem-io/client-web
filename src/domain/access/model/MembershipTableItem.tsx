import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { MembershipType } from './MembershipType';

export type MembershipTableItem = {
  id: string;
  type: MembershipType;
  contributorType: RoleSetContributorType;
  url: string;
  displayName: string;
  state?: string;
  nextEvents: string[];
  email?: string;
  createdDate: Date | undefined;
  updatedDate?: Date;
  questions: {
    id: string;
    name: string;
    value: string;
  }[];
  contributor?: {
    id: string;
    profile: {
      displayName: string;
      avatar?: {
        uri: string;
      };
      location?: {
        city?: string;
        country?: string;
      };
      url: string;
    };
  };
};
