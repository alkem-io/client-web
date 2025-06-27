import {
  CalloutAllowedContributors,
  CalloutContributionType,
  CalloutVisibility,
} from '@/core/apollo/generated/graphql-schema';

export interface CalloutSettingsModelFull {
  contribution: {
    enabled: boolean;
    allowedTypes: CalloutContributionType[];
    canAddContributions: CalloutAllowedContributors;
    commentsEnabled: boolean;
  };
  framing: {
    commentsEnabled: boolean;
  };
  visibility: CalloutVisibility;
}
