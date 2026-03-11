import {
  CalloutAllowedActors,
  type CalloutContributionType,
  CalloutVisibility,
} from '@/core/apollo/generated/graphql-schema';

export interface CalloutSettingsModelFull {
  contribution: {
    enabled: boolean;
    allowedTypes: CalloutContributionType[];
    canAddContributions: CalloutAllowedActors;
    commentsEnabled: boolean;
  };
  framing: {
    commentsEnabled: boolean;
  };
  visibility: CalloutVisibility;
}

export const DefaultCalloutSettings = {
  contribution: {
    enabled: true,
    allowedTypes: [],
    canAddContributions: CalloutAllowedActors.Members,
    commentsEnabled: true,
  },
  framing: {
    commentsEnabled: true,
  },
  visibility: CalloutVisibility.Published,
};
