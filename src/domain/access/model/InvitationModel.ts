import type { ActorType } from '@/core/apollo/generated/graphql-schema';

export type InvitationModel = {
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: string[];
  contributorType: ActorType;
  actor: {
    id: string;
    profile?: {
      id: string;
      displayName: string;
      email?: string;
      url: string;
    };
  };
};
