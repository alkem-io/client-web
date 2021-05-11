import { AuthorizationCredential } from '../types/graphql-schema';

const AuthorizationCredentialBackEnd = {
  'global-admins': AuthorizationCredential.GlobalAdmin,
  'global-admin-challenges': AuthorizationCredential.GlobalAdminChallenges,
  'global-community-admins': AuthorizationCredential.GlobalAdminCommunity,
  'global-registered': AuthorizationCredential.GlobalRegistered,
  'community-member': AuthorizationCredential.CommunityMember,
  'organisation-member': AuthorizationCredential.OrganisationMember,
  'user-group-member': AuthorizationCredential.UserGroupMember,
};

export const credentialsResolver = (value: string): AuthorizationCredential => {
  return AuthorizationCredentialBackEnd[value];
};
