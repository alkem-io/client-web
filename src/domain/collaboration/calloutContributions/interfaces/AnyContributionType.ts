import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';

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
      profile?: { displayName: string };
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
  memo?: {
    id: string;
    createdDate: Date;
    createdBy?: {
      id: string;
      profile?: { displayName: string };
    };
    profile: {
      id: string;
      url: string;
      displayName: string;
    };
    markdown?: string;
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
      profile?: { displayName: string };
    };
    authorization?: {
      myPrivileges?: Array<AuthorizationPrivilege>;
    };
    comments: { id: string; messagesCount: number };
  };
  collaboraDocument?: {
    id: string;
    documentType: string;
    createdDate: Date;
    createdBy?: {
      id: string;
      profile?: { displayName: string };
    };
    profile?: {
      id: string;
      url: string;
      displayName: string;
    };
  };
};
