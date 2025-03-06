import { useMemo } from 'react';
import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import getMetricCount from '@/domain/platform/metrics/utils/getMetricCount';
import { Identifiable } from '@/core/utils/Identifiable';
import { MetricType } from '@/domain/platform/metrics/MetricType';
import { OrganizationCardProps } from '../RoleSetContributors/ContributingOrganizations';

type OrganizationCardData = {
  id: string;
  profile: {
    displayName: string;
    avatar?: { uri: string };
    location?: { city?: string; country?: string };
    url?: string;
  };
  metrics?: { name: string; value: string }[];
  verification: { status: OrganizationVerificationEnum };
};

export const toOrganizationCardProps = (org: OrganizationCardData): OrganizationCardProps & Identifiable => ({
  id: org.id,
  name: org.profile.displayName,
  avatar: org.profile.avatar?.uri,
  city: org.profile.location?.city,
  country: org.profile.location?.country,
  associatesCount: getMetricCount(org.metrics ?? [], MetricType.Associate),
  verified: org.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
  url: org.profile.url,
});

const useOrganizationCardProps = (
  organizations: OrganizationCardData[] | undefined
): (OrganizationCardProps & Identifiable)[] | undefined => {
  return useMemo(() => organizations?.map(org => toOrganizationCardProps(org)), [organizations]);
};

export default useOrganizationCardProps;
