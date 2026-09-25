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
     * Present only on SPACES callouts; absent/null ⇒ COMPACT. Read this
     * only through `cardVariantFromServer` — never compare the enum directly, so an
     * unrecognised future value falls back safely instead of leaking through unchecked.
     */
    spaces?: { cardVariant: SpaceCollectionCardVariant } | null;
  };
  visibility: CalloutVisibility;
}
