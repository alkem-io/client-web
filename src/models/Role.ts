import { AuthorizationCredential } from './graphql-schema';

export interface Role {
  code: string;
  type: AuthorizationCredential;
  name: string;
  order: number;
  resourceId: string;
  hidden: boolean;
}
