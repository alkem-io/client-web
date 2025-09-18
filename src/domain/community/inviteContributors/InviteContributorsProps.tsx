import {
  AiPersonaEngine,
  RoleSetContributorType,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export interface InviteContributorsDialogProps {
  type: RoleSetContributorType;
  filterContributors?: (contributor: Identifiable) => boolean;
  open: boolean;
  onClose: () => void;
  onlyFromParentCommunity?: boolean;
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
  bodyOfKnowledgeDescription?: string;
  bodyOfKnowledgeType?: VirtualContributorBodyOfKnowledgeType;
  bodyOfKnowledgeID?: string;
  aiPersona?: {
    engine?: AiPersonaEngine;
  };
}
