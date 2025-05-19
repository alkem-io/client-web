import {
  AiPersonaBodyOfKnowledgeType,
  AiPersonaEngine,
  RoleSetContributorType,
} from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export interface InviteContributorsDialogProps {
  type: RoleSetContributorType;
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
    tagsets?: TagsetModel[];
    location?: {
      city?: string;
      country?: string;
    };
    url: string;
    references?: ReferenceModel[];
  };
  aiPersona?: {
    bodyOfKnowledge?: string;
    bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType;
    bodyOfKnowledgeID?: string;
    engine?: AiPersonaEngine;
  };
}
