import type {
  CalloutAllowedActors,
  CalloutContributionType,
  CalloutSelectionMode,
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
    /**
     * Manual-vs-automatic selection (features 025/084). Absent/null ⇒ AUTO.
     * Declared here because the Spaces-collection connector reads the mode off
     * the callout it is already given, instead of selecting `settings` in its
     * own query — a partial `settings` write would replace the complete cached
     * copy this callout came from.
     */
    selection?: { mode: CalloutSelectionMode } | null;
  };
  visibility: CalloutVisibility;
}
