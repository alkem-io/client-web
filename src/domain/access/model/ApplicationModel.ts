import { ActorType } from '@/core/apollo/generated/graphql-schema';

export type ApplicationModel = {
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: Array<string>;
  contributorType: ActorType;
  contributor: {
    id: string;
    profile?: {
      displayName: string;
      email?: string;
      url: string;
    };
  };
};
