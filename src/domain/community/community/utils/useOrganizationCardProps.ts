import { useMemo } from 'react';
import { OrganizationCardFragment, OrganizationVerificationEnum } from '@core/apollo/generated/graphql-schema';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { buildOrganizationUrl } from '../../../../main/routing/urlBuilders';
import { Identifiable } from '@core/utils/Identifiable';
import { MetricType } from '../../../platform/metrics/MetricType';
import { OrganizationCardProps } from '../CommunityContributors/ContributingOrganizations';

export const toOrganizationCardProps = (org: OrganizationCardFragment): OrganizationCardProps & Identifiable => {
  return {
    id: org.id,
    name: org.profile.displayName,
    avatar: org.profile.visual?.uri,
    city: org.profile.location?.city,
    country: org.profile.location?.country,
    associatesCount: getMetricCount(org.metrics ?? [], MetricType.Associate),
    verified: org.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
    url: buildOrganizationUrl(org.nameID),
  };
};

const useOrganizationCardProps = (
  organizations: OrganizationCardFragment[] | undefined
): (OrganizationCardProps & Identifiable)[] | undefined => {
  return useMemo(() => organizations?.map(org => toOrganizationCardProps(org)), [organizations]);
};

export default useOrganizationCardProps;
