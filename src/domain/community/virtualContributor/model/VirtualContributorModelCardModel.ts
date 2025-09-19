import {
  VirtualContributorModelCardEntry,
  VirtualContributorModelCardEntryFlagName,
} from '@/core/apollo/generated/graphql-schema';

type ModelCardEntryFlag = {
  name: VirtualContributorModelCardEntryFlagName;
  enabled: boolean;
};

type ModelCardSpaceUsageEntry = {
  modelCardEntry: VirtualContributorModelCardEntry;
  flags: ModelCardEntryFlag[];
};

type ModelCardAiEngine = {
  isExternal: boolean;
  hostingLocation: string;
  isUsingOpenWeightsModel: boolean;
  isInteractionDataUsedForTraining: boolean | null; // null means unknown
  canAccessWebWhenAnswering: boolean;
  areAnswersRestrictedToBodyOfKnowledge: string;
  additionalTechnicalDetails: string;
  // And one more to simplify migration but that should go later
  isAssistant: boolean;
};

type ModelCardMonitoring = {
  isUsageMonitoredByAlkemio: boolean;
};

export type VirtualContributorModelCard = {
  spaceUsage: ModelCardSpaceUsageEntry[];
  aiEngine: ModelCardAiEngine;
  monitoring: ModelCardMonitoring;
};

export const EMPTY_MODEL_CARD: VirtualContributorModelCard = {
  spaceUsage: [
    {
      modelCardEntry: VirtualContributorModelCardEntry.SpaceCapabilities,
      flags: [
        { name: VirtualContributorModelCardEntryFlagName.SpaceCapabilityTagging, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceCapabilityCreateContent, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceCapabilityCommunityManagement, enabled: false },
      ],
    },
    {
      modelCardEntry: VirtualContributorModelCardEntry.SpaceDataAccess,
      flags: [
        { name: VirtualContributorModelCardEntryFlagName.SpaceDataAccessAbout, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceDataAccessContent, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceDataAccessSubspaces, enabled: false },
      ],
    },
    {
      modelCardEntry: VirtualContributorModelCardEntry.SpaceRoleRequired,
      flags: [
        { name: VirtualContributorModelCardEntryFlagName.SpaceRoleMember, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceRoleAdmin, enabled: false },
      ],
    },
  ],
  aiEngine: {
    isExternal: false,
    hostingLocation: 'unkown',
    areAnswersRestrictedToBodyOfKnowledge: 'unknown',
    isUsingOpenWeightsModel: false,
    isInteractionDataUsedForTraining: null,
    canAccessWebWhenAnswering: false,
    additionalTechnicalDetails: '',
    isAssistant: false,
  },
  monitoring: {
    isUsageMonitoredByAlkemio: true,
  },
};
