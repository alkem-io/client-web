import { VirtualContributorWithModelCardFragment, AiPersonaEngine } from '@/core/apollo/generated/graphql-schema';
import { VirtualContributorModelCard, EMPTY_MODEL_CARD } from '../model/VirtualContributorModelCardModel';

export function createAiPersonaModelCardModelFromFragment(
  vcData: VirtualContributorWithModelCardFragment | undefined
): VirtualContributorModelCard {
  const engine = vcData?.aiPersona?.engine;
  const modelCardData = vcData?.modelCard;
  if (!modelCardData || !engine) return EMPTY_MODEL_CARD;
  return {
    spaceUsage: modelCardData.spaceUsage ?? EMPTY_MODEL_CARD.spaceUsage,
    aiEngine: {
      isExternal: modelCardData.aiEngine?.isExternal ?? EMPTY_MODEL_CARD.aiEngine.isExternal,
      hostingLocation: modelCardData.aiEngine?.hostingLocation ?? EMPTY_MODEL_CARD.aiEngine.hostingLocation,
      isUsingOpenWeightsModel:
        modelCardData.aiEngine?.isUsingOpenWeightsModel ?? EMPTY_MODEL_CARD.aiEngine.isUsingOpenWeightsModel,
      isInteractionDataUsedForTraining:
        modelCardData.aiEngine?.isInteractionDataUsedForTraining ??
        EMPTY_MODEL_CARD.aiEngine.isInteractionDataUsedForTraining,
      canAccessWebWhenAnswering:
        modelCardData.aiEngine?.canAccessWebWhenAnswering ?? EMPTY_MODEL_CARD.aiEngine.canAccessWebWhenAnswering,
      areAnswersRestrictedToBodyOfKnowledge:
        modelCardData.aiEngine?.areAnswersRestrictedToBodyOfKnowledge ??
        EMPTY_MODEL_CARD.aiEngine.areAnswersRestrictedToBodyOfKnowledge,
      additionalTechnicalDetails:
        modelCardData.aiEngine?.additionalTechnicalDetails ?? EMPTY_MODEL_CARD.aiEngine.additionalTechnicalDetails,
      isAssistant: engine === AiPersonaEngine.OpenaiAssistant,
    },
    monitoring: {
      isUsageMonitoredByAlkemio:
        modelCardData.monitoring?.isUsageMonitoredByAlkemio ?? EMPTY_MODEL_CARD.monitoring.isUsageMonitoredByAlkemio,
    },
  };
}
