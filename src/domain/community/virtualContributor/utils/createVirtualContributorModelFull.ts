import type { VirtualContributorModelFull } from '../model/VirtualContributorModelFull';
import { createAiPersonaModelCardModelFromFragment } from './createAiPersonaModelCardModelFromFragment';

export function createVirtualContributorModelFull(virtualContributor: any): VirtualContributorModelFull {
  return {
    id: virtualContributor?.id ?? '',
    settings: virtualContributor?.settings ?? {},
    bodyOfKnowledgeDescription: virtualContributor?.bodyOfKnowledgeDescription ?? '',
    bodyOfKnowledgeType: virtualContributor?.bodyOfKnowledgeType ?? undefined,
    bodyOfKnowledgeID: virtualContributor?.bodyOfKnowledgeID ?? '',
    modelCard: createAiPersonaModelCardModelFromFragment(virtualContributor),
    aiPersona: {
      id: virtualContributor?.aiPersona?.id ?? '',
      engine: virtualContributor?.aiPersona?.engine ?? undefined,
      // aiPersonaServiceID: virtualContributor?.aiPersona?.aiPersonaServiceID ?? undefined,
    },
    profile: virtualContributor?.profile ?? { displayName: '', url: '' },
    provider: virtualContributor?.provider ?? undefined,
  };
}
