import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthorizationCredential } from '../core/apollo/generated/graphql-schema';

export interface CredentialResolver {
  toRoleName: (value: AuthorizationCredential) => string;
  toRoleOrder: (value: AuthorizationCredential) => number;
  isHidden: (value: AuthorizationCredential) => boolean;
}

export const useCredentialsResolver = (): CredentialResolver => {
  const { t } = useTranslation();

  const toRoleName = useCallback(
    (value: AuthorizationCredential) => {
      // In case of a typescript error:
      // Most common case is inconsistency between the backend and the frontend.
      // check if the `AuthorizationCredential` was updated and add/remove missing items
      // in the translation file.
      return t(`common.enums.authorization-credentials.${value}.name` as const);
    },
    [t]
  );

  const toRoleOrder = useCallback(
    (value: AuthorizationCredential) => {
      // In case of a typescript error:
      // Most common case is inconsistency between the backend and the frontend.
      // check if the `AuthorizationCredential` was updated and add/remove missing items
      // in the translation file.
      return Number(t(`common.enums.authorization-credentials.${value}.order` as const));
    },
    [t]
  );

  const isHidden = useCallback(
    (value: AuthorizationCredential) => {
      return Boolean(t(`common.enums.authorization-credentials.${value}.hidden` as const));
    },
    [t]
  );

  return useMemo(() => ({ toRoleName, toRoleOrder, isHidden }), [toRoleName, toRoleOrder, isHidden]);
};
