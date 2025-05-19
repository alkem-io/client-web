import {
  AiPersonaBodyOfKnowledgeType,
  AiPersonaEngine,
  RoleSetContributorType,
} from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { Reference, Tagset } from '@/domain/common/profile/Profile';

export interface InviteContributorsDialogProps {
  type: RoleSetContributorType;
  filterContributors?: (contributor: Identifiable) => boolean;
  open: boolean;
  onClose: () => void;
}

export interface ContributorProps extends Identifiable {
  email?: string;
  profile: {
    displayName: string;
    description?: string;
    avatar?: {
      uri: string;
    };
    tagsets?: Tagset[];
    location?: {
      city?: string;
      country?: string;
    };
    url: string;
    references?: Reference[];
  };
  aiPersona?: {
    bodyOfKnowledge?: string;
    bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType;
    bodyOfKnowledgeID?: string;
    engine?: AiPersonaEngine;
  };
}
