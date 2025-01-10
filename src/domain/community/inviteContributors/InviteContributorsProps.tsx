import { AiPersonaBodyOfKnowledgeType, RoleSetContributorType, Tagset } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';

export interface InviteContributorDialogProps {
  type: RoleSetContributorType;
  open: boolean;
  onClose: () => void;
}

export interface ContributorProps extends Identifiable {
  nameID?: string;
  email?: string;
  profile?: {
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
    url?: string;
  };
  aiPersona?: {
    bodyOfKnowledge?: string;
    bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType;
    bodyOfKnowledgeID?: string;
  };
}
