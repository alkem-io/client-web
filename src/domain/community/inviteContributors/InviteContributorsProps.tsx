import type {
  ActorType,
  AiPersonaEngine,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export interface InviteContributorsDialogProps {
  type: ActorType;
  filterContributors?: (contributor: Identifiable) => boolean;
  open: boolean;
  onClose: () => void;
  onlyFromParentCommunity?: boolean;
}

export interface ContributorProps extends Identifiable {
  email?: string;
  profile?: {
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
