import { Agent, AuthorizationCredential } from '../../models/graphql-schema';
import TranslationKey from '../../types/TranslationKey';
import {
  ADMIN_TRANSLATION_KEY,
  MEMBER_TRANSLATION_KEY,
  OWNER_TRANSLATION_KEY,
} from '../../models/constants/translation.contants';

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

const getUserRoleTranslationKey = (resourceId: string, userAgent?: Agent): TranslationKey | undefined => {
  if (!userAgent) {
    return undefined;
  }

  const rolesForResource = (userAgent?.credentials || []).filter(x => x.resourceID === resourceId).map(x => x.type);

  const isOwner = ownerRoles.some(x => rolesForResource.indexOf(x) !== -1);
  const isAdmin = adminRoles.some(x => rolesForResource.indexOf(x) !== -1);
  const isMember = memberRoles.some(x => rolesForResource.indexOf(x) !== -1);

  return (
    (isOwner && OWNER_TRANSLATION_KEY) ||
    (isAdmin && ADMIN_TRANSLATION_KEY) ||
    (isMember && MEMBER_TRANSLATION_KEY) ||
    undefined
  );
};
export default getUserRoleTranslationKey;
