import { useTranslation } from 'react-i18next';
import { User } from '../../models/graphql-schema';
import getUserRoleName from '../../utils/user-role-name/get-user-role-name';

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
      const roleInfo = getUserRoleName(resourceId, x?.agent);

      return {
        ...x,
        roleName: roleInfo && t(roleInfo.key),
        sortOrder: roleInfo && roleInfo.sortOrder,
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
