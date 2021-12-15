import { useTranslation } from 'react-i18next';
import { User } from '../../models/graphql-schema';
import getUserRoleTranslationKey from '../../utils/user-role-name/get-user-role-translation-key';
import {
  ADMIN_TRANSLATION_KEY,
  MEMBER_TRANSLATION_KEY,
  OWNER_TRANSLATION_KEY,
} from '../../models/constants/translation.contants';

const OWNER_SORT_ORDER = 1;
const ADMIN_SORT_ORDER = 2;
const MEMBER_SORT_ORDER = 3;

export type UserWithCardRole = User & { roleName: string };
type UserWithCardRoleInfo = UserWithCardRole & { sortOrder: number };

/***
 * @param users
 * @param resourceId The resource with which the role is associated
 * @returns User extended with a **roleName** field
 */
const useUserCardRoleName = (users: User[], resourceId: string): UserWithCardRole[] => {
  const { t } = useTranslation();

  return users
    .map(x => {
      const roleTranslationKey = getUserRoleTranslationKey(resourceId, x?.agent);

      return {
        ...x,
        roleName: roleTranslationKey && t(roleTranslationKey),
        sortOrder: roleTranslationKey && getSortOrder(roleTranslationKey),
      } as UserWithCardRoleInfo;
    })
    .sort(
      ({ sortOrder: orderA }, { sortOrder: orderB }) =>
        (orderA !== undefined && orderB !== undefined && orderA - orderB) || 0
    )
    .map(x => {
      const { sortOrder, ...userWithCardRole } = x;
      return userWithCardRole;
    });
};
export default useUserCardRoleName;

const getSortOrder = (key: string): number => {
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
