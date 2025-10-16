import { AuthorizationPrivilege } from '../apollo/generated/graphql-schema';

export interface Authorizable {
  authorization?: { myPrivileges?: AuthorizationPrivilege[] };
}
