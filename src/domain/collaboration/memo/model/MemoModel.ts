import { AuthorizationPrivilege, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';

export interface MemoModel {
  id: string;
  contentUpdatePolicy?: ContentUpdatePolicy;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
  markdown?: string;
  createdBy?: {
    id: string;
    profile: {
      displayName: string;
      url: string;
      avatar?: { id: string; uri: string };
    };
  };
}
