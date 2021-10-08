import { useTranslation } from 'react-i18next';
import { Agent, AuthorizationCredential } from '../../models/graphql-schema';

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

/***
 * Returns the translated role for the resourceId provided, <i>undefined</i> if no credential is available
 * @param userAgent
 * @param resourceId
 */
const useUserRoleNameForCard = (userAgent: Agent, resourceId: string): string | undefined => {
  const { t } = useTranslation();

  const rolesForResource = (userAgent?.credentials || []).filter(x => x.resourceID === resourceId).map(x => x.type);

  const isOwner = ownerRoles.some(x => rolesForResource.indexOf(x) >= 0);
  const isAdmin = adminRoles.some(x => rolesForResource.indexOf(x) >= 0);
  const isMember = memberRoles.some(x => rolesForResource.indexOf(x) >= 0);

  return (
    (isOwner && t('common.owner')) || (isAdmin && t('common.admin')) || (isMember && t('common.member')) || undefined
  );
};
export default useUserRoleNameForCard;
