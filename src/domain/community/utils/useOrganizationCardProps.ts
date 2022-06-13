import { OrganizationCardFragment, OrganizationVerificationEnum } from '../../../models/graphql-schema';
import { OrganizationCardProps } from '../../../components/composite/common/cards/Organization/OrganizationCard';
import getActivityCount from '../../../utils/get-activity-count';
import { getUserCardRoleNameKey, UserMetadata, useUserContext } from '../../../hooks';
import { buildOrganizationUrl } from '../../../utils/urlBuilders';
import { Identifiable } from '../../shared/types/Identifiable';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { TFunction } from 'i18next';

export const toOrganizationCardProps = (org: OrganizationCardFragment, user: UserMetadata['user'], t: TFunction) => {
  const roleName = getUserCardRoleNameKey(user, org.id);

  return {
    verified: org.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
    information: org.profile.description,
    name: org.displayName,
    avatar: org.profile.avatar?.uri,
    members: getActivityCount(org.activity ?? [], 'members') ?? 0,
    role: roleName && t(roleName),
    url: buildOrganizationUrl(org.nameID),
    id: org.id,
  };
};

const useOrganizationCardProps = (
  organizations: OrganizationCardFragment[] | undefined
): (OrganizationCardProps & Identifiable)[] | undefined => {
  const { t } = useTranslation();

  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  return useMemo(() => user && organizations?.map(org => toOrganizationCardProps(org, user, t)), [user, organizations]);
};

export default useOrganizationCardProps;
