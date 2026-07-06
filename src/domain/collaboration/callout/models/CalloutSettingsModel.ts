import type {
  CalloutAllowedActors,
  CalloutContributionType,
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
