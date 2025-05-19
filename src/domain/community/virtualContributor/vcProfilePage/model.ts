import { Reference } from '@/domain/common/profile/Profile';
import { AiPersonaEngine, AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';

export type VirtualContributorProfileProps = {
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
    references?: Reference[];
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
  aiPersona?: {
    bodyOfKnowledge?: string;
    bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType;
    bodyOfKnowledgeID?: string;
    engine?: AiPersonaEngine;
  };
};

export type VCProfilePageViewProps = {
  bokProfile?: BasicSpaceProps;
  virtualContributor?: VirtualContributorProfileProps;
  navigateToKnowledgeBase?: boolean;
  openKnowledgeBaseDialog?: boolean;
};

export interface BasicSpaceProps {
  // TODO: avatar is for subspaces, add cardBanner if we want support of Spaces as BOK
  avatar?: {
    uri: string;
  };
  displayName: string;
  tagline?: string;
  url: string;
}
