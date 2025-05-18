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
};

type ModelCardMonitoring = {
  isUsageMonitoredByAlkemio: boolean;
};

export type AiPersonaModelCard = {
  spaceUsage: ModelCardSpaceUsageEntry[];
  aiEngine: ModelCardAiEngine;
  monitoring: ModelCardMonitoring;
};
