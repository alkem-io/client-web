import React, { FC, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { AboutSection } from '../../../../common/components/composite/sections/about/AboutSection';
import {
  AssociatedOrganizationDetailsFragment, MetricsItemFragment,
  ReferenceDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../community/community/EntityDashboardContributorsSection/Types';
import { useHub } from '../HubContext/useHub';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import { MetricType } from '../../../platform/metrics/MetricType';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { useTranslation } from 'react-i18next';

interface HubAboutViewProps {
  name: string | undefined;
  tagline: string | undefined;
  tags: string[] | undefined;
  vision: string | undefined;
  background: string | undefined;
  impact: string | undefined;
  who: string | undefined;
  communityReadAccess: boolean;
  hostOrganization: AssociatedOrganizationDetailsFragment | undefined;
  leadUsers: EntityDashboardLeads['leadUsers'];
  memberUsers: EntityDashboardContributors['memberUsers']
  memberUsersCount: EntityDashboardContributors['memberUsersCount']
  memberOrganizations: EntityDashboardContributors['memberOrganizations']
  memberOrganizationsCount: EntityDashboardContributors['memberOrganizationsCount']
  references: ReferenceDetailsFragment[] | undefined;
  metrics: MetricsItemFragment[] | undefined;
  loading: boolean | undefined;
  error?: ApolloError
}

export const HubAboutView: FC<HubAboutViewProps> = ({
  name = '', tagline = '', ...rest
}) => {
  const { t } = useTranslation();
  const { hubNameId, communityId } = useHub();

  const leadOrganizations = useMemo(
    () => rest.hostOrganization ? [rest.hostOrganization] : undefined,
    [rest.hostOrganization]
  );

  const metricsItems: MetricItem[] = useMemo(() => {
    return [
      {
        name: t('common.challenges'),
        type: MetricType.Challenge,
        count: getMetricCount(rest.metrics, MetricType.Challenge),
        color: 'neutral',
      },
      {
        name: t('common.opportunities'),
        count: getMetricCount(rest.metrics, MetricType.Opportunity),
        color: 'primary',
      },
      {
        name: t('common.members'),
        count: getMetricCount(rest.metrics, MetricType.Member),
        color: 'neutralMedium',
      },
    ];
  }, [rest.metrics, t]);

  return (
    <AboutSection
      entityTypeName="hub"
      isHub
      infoBlockTitle={name}
      infoBlockText={tagline}
      metricsItems={metricsItems}
      leadOrganizations={leadOrganizations}
      hubNameId={hubNameId}
      communityId={communityId}
      {...rest}
    />
  );
};
