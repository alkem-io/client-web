import { AuthorizationPrivilege, TagsetType } from '@/core/apollo/generated/graphql-schema';

export interface UpdateTagset {
  id: string;
  name?: string;
  tags?: string[];
}

export interface ReferenceWithAuthorization {
  id: string;
  name: string;
  uri: string;
  description?: string;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
}
