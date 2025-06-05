import { AiPersonaEngine, AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { AiPersonaModelCardModel } from './AiPersonaModelCardModel';

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
  aiPersona: {
    id: string;
    bodyOfKnowledge?: string;
    bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType;
    bodyOfKnowledgeID?: string;
    engine?: AiPersonaEngine;
    modelCard: AiPersonaModelCardModel;
  };
};
