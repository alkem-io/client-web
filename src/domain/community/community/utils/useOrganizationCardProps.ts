import { useMemo } from 'react';
import {
  OrganizationCardFragment,
  OrganizationVerificationEnum,
} from '../../../../core/apollo/generated/graphql-schema';
import { OrganizationCardProps } from '../../../../common/components/composite/common/cards/Organization/OrganizationCard';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { buildOrganizationUrl } from '../../../../common/utils/urlBuilders';
import { Identifiable } from '../../../shared/types/Identifiable';
import { MetricType } from '../../../platform/metrics/MetricType';

export const toOrganizationCardProps = (org: OrganizationCardFragment): OrganizationCardProps & Identifiable => {
  return {
    id: org.id,
    name: org.profile.displayName,
    avatar: org.profile.visual?.uri,
    description: org.profile.description,
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
