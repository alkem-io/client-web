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
  contributor?: {
    id: string;
    profile: {
      displayName: string;
    };
  };
};
