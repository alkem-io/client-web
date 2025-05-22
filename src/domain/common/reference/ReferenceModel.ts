import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export interface ReferenceModel {
  id: string;
  name: string;
  uri: string;
  description?: string;
}

export interface ReferenceModelWithOptionalAuthorization extends ReferenceModel {
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
}
