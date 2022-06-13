import { useTranslation } from 'react-i18next';
import { Agent } from '../../models/graphql-schema';
import getUserRoleTranslationKey from '../../utils/user-role-name/get-user-role-translation-key';
import {
  ADMIN_TRANSLATION_KEY,
  MEMBER_TRANSLATION_KEY,
  OWNER_TRANSLATION_KEY,
  RoleNameKey,
} from '../../models/constants/translation.contants';
import { sortBy } from 'lodash';

const ROLES_ORDER = [OWNER_TRANSLATION_KEY, ADMIN_TRANSLATION_KEY, MEMBER_TRANSLATION_KEY] as const;

export type WithCardRole<T> = T & { roleName: string };
export type WithCardRoleKey<T> = T & { roleNameKey: RoleNameKey };
type WithCredentials = { agent?: Pick<Agent, 'credentials'> };

/***
 * Hook because it uses translation hook
 * @param data
 * @param resourceId The resource with which the role is associated
 * @returns User extended with a **roleName** field
 */
const useUserCardRoleName = <T extends WithCredentials>(data: T[], resourceId: string) => {
  const { t } = useTranslation();

  return addUserCardRoleNameKey(data, resourceId).map(({ roleNameKey, ...rest }) => ({
    ...rest,
    roleName: roleNameKey && t(roleNameKey),
  }));
};

export default useUserCardRoleName;

export const addUserCardRoleNameKey = <T extends WithCredentials>(
  data: T[],
  resourceId: string
): WithCardRoleKey<T>[] => {
  const withRoleNameKeyAdded = data.map(x => {
    const roleTranslationKey = getUserRoleTranslationKey(resourceId, x?.agent)!;

    return {
      ...x,
      roleNameKey: roleTranslationKey,
    };
  });

  return sortBy(withRoleNameKeyAdded, ({ roleNameKey }) => getSortOrder(roleNameKey));
};

export const getUserCardRoleNameKey = <T extends WithCredentials>(x: T, resourceId: string) =>
  getUserRoleTranslationKey(resourceId, x?.agent);

const getSortOrder = (key: RoleNameKey) => {
  const index = ROLES_ORDER.indexOf(key);
  return index === -1 ? ROLES_ORDER.length : index;
};
