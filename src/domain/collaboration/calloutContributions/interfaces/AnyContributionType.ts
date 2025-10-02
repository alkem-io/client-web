import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export type AnyContribution = Identifiable & {
  link?: {
    id: string;
    uri: string;
    profile: {
      id: string;
      displayName: string;
      description?: string | undefined;
    };
    authorization?: {
      myPrivileges?: Array<AuthorizationPrivilege>;
    };
  };
  whiteboard?: {
    id: string;
    createdDate: Date;
    createdBy?: {
      id: string;
      profile: { displayName: string };
    };
    profile: {
      id: string;
      url: string;
      displayName: string;
      visual?: {
        id: string;
        uri: string;
        name: string;
        alternativeText?: string | undefined;
      };
    };
  };
  post?: {
    id: string;
    createdDate: Date;
    profile: {
      id: string;
      url: string;
      tagset?: TagsetModel;
      displayName: string;
      description?: string | undefined;
    };
    createdBy?: {
      id: string;
      profile: { displayName: string };
    };
    authorization?: {
      myPrivileges?: Array<AuthorizationPrivilege>;
    };
    comments: { id: string; messagesCount: number };
  };
};
