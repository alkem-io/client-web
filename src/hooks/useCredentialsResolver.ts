import { useTranslation } from 'react-i18next';
import { AuthorizationCredential } from '../types/graphql-schema';

// When the enum is updated on the server this one must be udpated too!
// The reason is that the graphql enum does not expose internal values,
// because of inconsistence in the API how data is returned and
// and what input data is expected
export enum AuthorizationCredentialBackEnd {
  GlobalAdmin = 'global-admin', // able to do everything, god mode
  GlobalAdminChallenges = 'global-admin-challenges', // able to create challenges / ecoverses / opportunities
  GlobalAdminCommunity = 'global-admin-community', // able to manage the top level community, including assigning credentials
  GlobalRegistered = 'global-registered', // credential issued to all registered users
  EcoverseAdmin = 'ecoverse-admin',
  EcoverseMember = 'ecoverse-member',
  ChallengeAdmin = 'challenge-admin',
  ChallengeMember = 'challenge-member',
  OpportunityMember = 'opportunity-member',
  OrganisationAdmin = 'organisation-admin', // Able to administer an organisation
  OrganisationMember = 'organisation-member', // Able to be a part of an organisation
  UserGroupMember = 'user-group-member', // Able to be a part of an user group
  UserSelfManagement = 'user-self', // able to update a user
}

export interface CredentialResolver {
  toAuthenticationCredentials: (value: string) => AuthorizationCredential;
  toRoleName: (value: AuthorizationCredential) => string;
  toRoleOrder: (value: AuthorizationCredential) => number;
}

export const useCredentialsResolver = (): CredentialResolver => {
  const { t } = useTranslation();

  const toAuthenticationCredentials = (value: string) => {
    return Object.keys(AuthorizationCredentialBackEnd).find(
      k => AuthorizationCredentialBackEnd[k] === value
    ) as AuthorizationCredential;
  };

  const toRoleName = (value: AuthorizationCredential) => {
    // In case of an typescript error:
    // Most common case is inconsistency between the backend and the forntened.
    // check if the `AuthorizationCredential` was updated and add/remove missing items
    // in the translation file.
    return t(`common.enums.authorization-credentials.${value}.name` as const);
  };

  const toRoleOrder = (value: AuthorizationCredential) => {
    // In case of an typescript error:
    // Most common case is inconsistency between the backend and the forntened.
    // check if the `AuthorizationCredential` was updated and add/remove missing items
    // in the translation file.
    return t(`common.enums.authorization-credentials.${value}.order` as const);
  };

  return { toAuthenticationCredentials, toRoleName, toRoleOrder };
};
