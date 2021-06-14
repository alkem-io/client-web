import { useTranslation } from 'react-i18next';
import { AuthorizationCredential } from '../types/graphql-schema';

export interface CredentialResolver {
  toRoleName: (value: AuthorizationCredential) => string;
  toRoleOrder: (value: AuthorizationCredential) => number;
}

export const useCredentialsResolver = (): CredentialResolver => {
  const { t } = useTranslation();

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

  return { toRoleName, toRoleOrder };
};
