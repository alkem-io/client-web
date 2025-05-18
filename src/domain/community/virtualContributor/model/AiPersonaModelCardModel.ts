import { AiPersonaModelCardEntry, AiPersonaModelCardEntryFlagName } from '@/core/apollo/generated/graphql-schema';

type ModelCardEntryFlag = {
  name: AiPersonaModelCardEntryFlagName;
  enabled: boolean;
};

type ModelCardSpaceUsageEntry = {
  modelCardEntry: AiPersonaModelCardEntry;
  flags: ModelCardEntryFlag[];
};

type ModelCardAiEngine = {
  isExternal: boolean;
  hostingLocation: string;
  isUsingOpenWeightsModel: boolean;
  isInteractionDataUsedForTraining: boolean;
  canAccessWebWhenAnswering: boolean;
  areAnswersRestrictedToBodyOfKnowledge: string;
  additionalTechnicalDetails: string;
  // And one more to simplify migration but that should go later
  isAssistant: boolean;
};

type ModelCardMonitoring = {
  isUsageMonitoredByAlkemio: boolean;
};

export type AiPersonaModelCardModel = {
  spaceUsage: ModelCardSpaceUsageEntry[];
  aiEngine: ModelCardAiEngine;
  monitoring: ModelCardMonitoring;
};

export const EMPTY_MODEL_CARD: AiPersonaModelCardModel = {
  spaceUsage: [
    {
      modelCardEntry: AiPersonaModelCardEntry.SpaceCapabilities,
      flags: [
        { name: AiPersonaModelCardEntryFlagName.SpaceCapabilityTagging, enabled: false },
        { name: AiPersonaModelCardEntryFlagName.SpaceCapabilityCreateContent, enabled: false },
        { name: AiPersonaModelCardEntryFlagName.SpaceCapabilityCommunityManagement, enabled: false },
      ],
    },
    {
      modelCardEntry: AiPersonaModelCardEntry.SpaceDataAccess,
      flags: [
        { name: AiPersonaModelCardEntryFlagName.SpaceDataAccessAbout, enabled: false },
        { name: AiPersonaModelCardEntryFlagName.SpaceDataAccessContent, enabled: false },
        { name: AiPersonaModelCardEntryFlagName.SpaceDataAccessSubspaces, enabled: false },
      ],
    },
    {
      modelCardEntry: AiPersonaModelCardEntry.SpaceRoleRequired,
      flags: [
        { name: AiPersonaModelCardEntryFlagName.SpaceRoleMember, enabled: false },
        { name: AiPersonaModelCardEntryFlagName.SpaceRoleAdmin, enabled: false },
      ],
    },
  ],
  aiEngine: {
    isExternal: false,
    hostingLocation: 'unkown',
    areAnswersRestrictedToBodyOfKnowledge: 'unknown',
    isUsingOpenWeightsModel: false,
    isInteractionDataUsedForTraining: false,
    canAccessWebWhenAnswering: false,
    additionalTechnicalDetails: '',
    isAssistant: false,
  },
  monitoring: {
    isUsageMonitoredByAlkemio: true,
  },
};
