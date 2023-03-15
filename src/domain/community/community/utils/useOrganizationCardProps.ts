import {
  OrganizationCardFragment,
  OrganizationVerificationEnum,
} from '../../../../core/apollo/generated/graphql-schema';
import { OrganizationCardProps } from '../../../../common/components/composite/common/cards/Organization/OrganizationCard';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { getUserCardRoleNameKey } from '../../contributor/user/hooks/useUserCardRoleName';
import { useUserContext } from '../../contributor/user';
import { buildOrganizationUrl } from '../../../../common/utils/urlBuilders';
import { Identifiable } from '../../../shared/types/Identifiable';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { TFunction } from 'i18next';
import { UserMetadata } from '../../contributor/user/hooks/useUserMetadataWrapper';
import { MetricType } from '../../../platform/metrics/MetricType';

export const toOrganizationCardProps = (
  org: OrganizationCardFragment,
  user: UserMetadata['user'],
  t: TFunction
): OrganizationCardProps & Identifiable => {
  const roleName = getUserCardRoleNameKey(user, org.id);

  return {
    id: org.id,
    name: org.displayName,
    avatar: org.profile.avatar?.uri,
    description: org.profile.description,
    role: roleName && t(roleName),
    associatesCount: getMetricCount(org.metrics ?? [], MetricType.Associate),
    verified: org.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
    url: buildOrganizationUrl(org.nameID),
  };
};

const useOrganizationCardProps = (
  organizations: OrganizationCardFragment[] | undefined
): (OrganizationCardProps & Identifiable)[] | undefined => {
  const { t } = useTranslation();

  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  return useMemo(
    () => user && organizations?.map(org => toOrganizationCardProps(org, user, t)),
    [user, organizations, t]
  );
};

export default useOrganizationCardProps;
