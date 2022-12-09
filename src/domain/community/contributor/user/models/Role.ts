import { AuthorizationCredential } from '../../../../../core/apollo/generated/graphql-schema';

export interface Role {
  code: string;
  type: AuthorizationCredential;
  name: string;
  order: number;
  resourceId: string;
  hidden: boolean;
}
