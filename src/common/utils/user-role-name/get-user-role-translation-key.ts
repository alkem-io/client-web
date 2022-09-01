import { Agent, AuthorizationCredential } from '../../../models/graphql-schema';
import {
  ADMIN_TRANSLATION_KEY,
  MEMBER_TRANSLATION_KEY,
  OWNER_TRANSLATION_KEY,
  RoleNameKey,
} from '../../../models/constants/translation.contants';

const ownerRoles = [AuthorizationCredential.OrganizationOwner];

const adminRoles = [
  AuthorizationCredential.OrganizationAdmin,
  AuthorizationCredential.HubAdmin,
  AuthorizationCredential.ChallengeAdmin,
  AuthorizationCredential.OpportunityAdmin,
];

const memberRoles = [
  AuthorizationCredential.OrganizationMember,
  AuthorizationCredential.HubMember,
  AuthorizationCredential.ChallengeMember,
  AuthorizationCredential.OpportunityMember,
];

const isOwner = (rolesForResource: AuthorizationCredential[]) => ownerRoles.some(x => rolesForResource.includes(x));
const isAdmin = (rolesForResource: AuthorizationCredential[]) => adminRoles.some(x => rolesForResource.includes(x));
const isMember = (rolesForResource: AuthorizationCredential[]) => memberRoles.some(x => rolesForResource.includes(x));

const getUserRoleTranslationKey = (
  resourceId: string,
  userAgent?: Pick<Agent, 'credentials'>
): RoleNameKey | undefined => {
  if (!userAgent) {
    return undefined;
  }

  const rolesForResource = (userAgent?.credentials || []).filter(x => x.resourceID === resourceId).map(x => x.type);

  return (
    (isOwner(rolesForResource) && OWNER_TRANSLATION_KEY) ||
    (isAdmin(rolesForResource) && ADMIN_TRANSLATION_KEY) ||
    (isMember(rolesForResource) && MEMBER_TRANSLATION_KEY) ||
    undefined
  );
};
export default getUserRoleTranslationKey;
