import { AuthorizationCredential } from '../models/graphql-schema';

export const getCredentialName = (credentialName: AuthorizationCredential) => {
  return credentialName.toLocaleLowerCase();
};
