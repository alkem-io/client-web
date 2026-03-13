import type { AiPersonaEngine, VirtualContributorBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import type { VirtualContributorModelCard } from './VirtualContributorModelCardModel';

export type VirtualContributorModelFull = {
  id: string;
  profile: {
    displayName: string;
    description?: string;
    avatar?: {
      uri: string;
    };
    location?: {
      city?: string;
      country?: string;
    };
    url: string;
    references?: ReferenceModel[];
  };
  settings?: {
    privacy?: {
      knowledgeBaseContentVisible?: boolean;
    };
  };
  provider?: {
    profile: {
      displayName: string;
      avatar?: {
        uri: string;
      };
      location?: {
        city?: string;
        country?: string;
      };
      url: string;
    };
  };
  bodyOfKnowledgeDescription?: string;
  bodyOfKnowledgeType?: VirtualContributorBodyOfKnowledgeType;
  bodyOfKnowledgeID?: string;
  modelCard: VirtualContributorModelCard;
  aiPersona: {
    id: string;
    engine?: AiPersonaEngine;
  };
};
