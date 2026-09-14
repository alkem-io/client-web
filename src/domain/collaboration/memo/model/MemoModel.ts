import type { AuthorizationPrivilege, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';

export interface MemoModel {
  id: string;
  signatures?: Array<{ id: string; document?: { id: string } | null }>;
  contentUpdatePolicy?: ContentUpdatePolicy;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
  markdown?: string;
  createdBy?: {
    id: string;
    profile?: {
      displayName: string;
      url: string;
      avatar?: { id: string; uri: string };
    };
  };
}
