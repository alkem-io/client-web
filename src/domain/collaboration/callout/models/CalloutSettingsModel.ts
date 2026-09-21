import type {
  CalloutAllowedActors,
  CalloutContributionType,
  CalloutVisibility,
  SpaceCollectionCardVariant,
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
    /**
     * Present only on SPACES callouts; absent/null ⇒ COMPACT (feature 076). Read this
     * only through `cardVariantFromServer` — never compare the enum directly (spec
     * dissent D-1, risk R-11).
     */
    spaces?: { cardVariant: SpaceCollectionCardVariant } | null;
  };
  visibility: CalloutVisibility;
}
