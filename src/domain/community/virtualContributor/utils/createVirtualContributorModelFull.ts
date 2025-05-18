import { VirtualContributorModelFull } from '../model/VirtualContributorModelFull';
import { createAiPersonaModelCardModelFromFragment } from './createAiPersonaModelCardModelFromFragment';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createVirtualContributorModelFull(virtualContributor: any): VirtualContributorModelFull {
  return {
    id: virtualContributor?.id ?? '',
    settings: virtualContributor?.settings ?? {},
    aiPersona: {
      id: virtualContributor?.aiPersona?.id ?? '',
      bodyOfKnowledge: virtualContributor?.aiPersona?.bodyOfKnowledge ?? '',
      bodyOfKnowledgeType: virtualContributor?.aiPersona?.bodyOfKnowledgeType ?? undefined,
      bodyOfKnowledgeID: virtualContributor?.aiPersona?.bodyOfKnowledgeID ?? '',
      engine: virtualContributor?.aiPersona?.engine ?? undefined,
      modelCard: createAiPersonaModelCardModelFromFragment(virtualContributor?.aiPersona),
    },
    profile: virtualContributor?.profile ?? { displayName: '', url: '' },
  };
}
