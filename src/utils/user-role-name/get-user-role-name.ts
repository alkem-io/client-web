import { Agent, AuthorizationCredential } from '../../models/graphql-schema';
import TranslationKey from '../../types/TranslationKey';

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

const getUserRoleName = (
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
export default getUserRoleName;
