import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';

type ContributorModel = {
  __typename?: string; // 'Organization' | 'User' | 'VirtualContributor';
  id: string;
  profile: {
    id: string;
    displayName: string;
    url: string;
    description?: string;
    avatar?: VisualModel;
    tagsets?: TagsetModel[];
    location?: {
      country?: string;
      city?: string;
    };
  };
  isContactable?: boolean;
};

export type CommentsWithMessagesModel = {
  id: string;
  messagesCount: number;
  authorization?: { myPrivileges?: AuthorizationPrivilege[] };
  messages: {
    id: string;
    message: string;
    timestamp: number;
    threadID?: string;
    reactions: {
      id: string;
      emoji: string;
      sender?: { id: string; profile: { displayName: string } };
    }[];
    sender?: ContributorModel;
  }[];
  vcInteractions: { id: string; threadID: string; virtualContributorID: string }[];
};
