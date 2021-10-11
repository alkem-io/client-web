import { useTranslation } from 'react-i18next';
import TranslationKey from '../../types/TranslationKey';
import { Agent, AuthorizationCredential, User } from '../../models/graphql-schema';

const ownerRoles = [AuthorizationCredential.OrganizationOwner];

const adminRoles = [
  AuthorizationCredential.OrganizationAdmin,
  AuthorizationCredential.EcoverseAdmin,
  AuthorizationCredential.ChallengeAdmin,
  AuthorizationCredential.OpportunityAdmin,
];

const memberRoles = [
  AuthorizationCredential.OrganizationMember,
  AuthorizationCredential.EcoverseMember,
  AuthorizationCredential.ChallengeMember,
  AuthorizationCredential.OpportunityMember,
];

const OWNER_TRANSLATION_KEY = 'common.owner';
const ADMIN_TRANSLATION_KEY = 'common.admin';
const MEMBER_TRANSLATION_KEY = 'common.member';

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
      const roleInfo = getUserCardRoleInfo(resourceId, x.agent);

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

const getUserCardRoleInfo = (
  resourceId: string,
  userAgent?: Agent
): { key: TranslationKey; sortOrder: number } | undefined => {
  if (!userAgent) {
    return undefined;
  }

  const rolesForResource = (userAgent?.credentials || []).filter(x => x.resourceID === resourceId).map(x => x.type);

  const isOwner = ownerRoles.some(x => rolesForResource.indexOf(x) !== -1);
  const isAdmin = adminRoles.some(x => rolesForResource.indexOf(x) !== -1);
  const isMember = memberRoles.some(x => rolesForResource.indexOf(x) !== -1);

  return (
    (isOwner && { key: OWNER_TRANSLATION_KEY, sortOrder: OWNER_SORT_ORDER }) ||
    (isAdmin && { key: ADMIN_TRANSLATION_KEY, sortOrder: ADMIN_SORT_ORDER }) ||
    (isMember && { key: MEMBER_TRANSLATION_KEY, sortOrder: MEMBER_SORT_ORDER }) ||
    undefined
  );
};
