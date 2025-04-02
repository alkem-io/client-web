import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

export type ApplicationProvided = {
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
      avatar?: {
        id: string;
        uri: string;
        name: string;
      };
      location?: {
        id: string;
        city?: string | undefined;
        country?: string | undefined;
      };
    };
  };
  questions: {
    id: string;
    name: string;
    value: string;
  }[];
};
