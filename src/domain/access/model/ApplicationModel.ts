import type { ActorType } from '@/core/apollo/generated/graphql-schema';

export type ApplicationModel = {
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: Array<string>;
  contributorType: ActorType;
  actor: {
    id: string;
    profile?: {
      displayName: string;
      email?: string;
      url: string;
    };
  };
  questions?: Array<{ id: string; name: string; value: string }>;
  user?: { id: string; email: string } | null;
};
