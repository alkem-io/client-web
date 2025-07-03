import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export interface ReferenceModel {
  id: string;
  ID?: string; // For backward compatibility
  name: string;
  uri: string;
  description?: string;
}

export interface ReferenceModelWithOptionalAuthorization extends ReferenceModel {
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
}

export const EmptyReference: ReferenceModel = {
  id: '',
  name: '',
  uri: '',
  description: '',
};
