import { useTranslation } from 'react-i18next';
import { Agent } from '../../models/graphql-schema';
import getUserRoleTranslationKey from '../../utils/user-role-name/get-user-role-translation-key';
import {
  ADMIN_TRANSLATION_KEY,
  MEMBER_TRANSLATION_KEY,
  OWNER_TRANSLATION_KEY,
} from '../../models/constants/translation.contants';
import TranslationKey from '../../types/TranslationKey';

const OWNER_SORT_ORDER = 1;
const ADMIN_SORT_ORDER = 2;
const MEMBER_SORT_ORDER = 3;

export type WithCardRole<T> = T & { roleName: string };
export type WithCardRoleKey<T> = T & { roleNameKey: TranslationKey };
type WithCardRoleInfo<T> = WithCardRoleKey<T> & { sortOrder: number };
type WithCredentials = { agent?: Pick<Agent, 'credentials'> };

/***
 * Hook because it uses translation hook
 * @param data
 * @param resourceId The resource with which the role is associated
 * @returns User extended with a **roleName** field
 */
const useUserCardRoleName = <T extends WithCredentials>(data: T[], resourceId: string): WithCardRole<T>[] => {
  const { t } = useTranslation();

  // @ts-ignore
  return getUserCardRoleNameKey(data, resourceId).map(({ roleNameKey, ...rest }) => ({
    ...rest,
    roleName: t(roleNameKey) as string,
  }));
};
export default useUserCardRoleName;

export const getUserCardRoleNameKey = <T extends WithCredentials>(
  data: T[],
  resourceId: string
): WithCardRoleKey<T>[] => {
  return data
    .map(x => {
      const roleTranslationKey = getUserRoleTranslationKey(resourceId, x?.agent);

      return {
        ...x,
        roleNameKey: roleTranslationKey,
        sortOrder: roleTranslationKey && getSortOrder(roleTranslationKey),
      } as WithCardRoleInfo<T>;
    })
    .sort(
      ({ sortOrder: orderA }, { sortOrder: orderB }) =>
        (orderA !== undefined && orderB !== undefined && orderA - orderB) || 0
    )
    .map(x => {
      const { sortOrder, ...userWithCardRoleKey } = x;
      return userWithCardRoleKey as WithCardRoleKey<T>;
    });
};

const getSortOrder = (key: TranslationKey): number => {
  switch (key) {
    case OWNER_TRANSLATION_KEY:
      return OWNER_SORT_ORDER;
    case ADMIN_TRANSLATION_KEY:
      return ADMIN_SORT_ORDER;
    case MEMBER_TRANSLATION_KEY:
      return MEMBER_SORT_ORDER;
    default:
      return -1;
  }
};
