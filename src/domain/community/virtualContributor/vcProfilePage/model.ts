import { AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import { BasicSpaceProps } from '../components/BasicSpaceCard';

export type VirtualContributorProfileProps = {
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
  aiPersona?: {
    bodyOfKnowledge?: string;
    bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType;
    bodyOfKnowledgeID?: string;
  };
};

export type VCProfilePageViewProps = {
  bokProfile?: BasicSpaceProps;
  virtualContributor?: VirtualContributorProfileProps;
};
