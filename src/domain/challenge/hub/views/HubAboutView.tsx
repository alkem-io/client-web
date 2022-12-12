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
import EntityDashboardContributorsSection
  from '../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import { useHub } from '../HubContext/useHub';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import { MetricType } from '../../../platform/metrics/MetricType';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { useTranslation } from 'react-i18next';

interface HubAboutViewProps {
  name?: string;
  tagline?: string;
  tags?: string[];
  vision?: string;
  background?: string;
  impact?: string;
  who?: string;
  communityReadAccess: boolean | undefined;
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
  name = '', tagline = '', tags = [], vision = '',
  background = '',  impact = '', who = '',
  communityReadAccess = false,
  hostOrganization, leadUsers,
  memberUsers, memberUsersCount, memberOrganizations, memberOrganizationsCount,
  references, metrics,
  loading, error
}) => {
  const { t } = useTranslation();
  const { hubNameId, communityId } = useHub();

  const leadOrganizations = useMemo(
    () => hostOrganization ? [hostOrganization] : undefined,
    [hostOrganization]
  );

  const metricsItems: MetricItem[] = useMemo(() => {
    return [
      {
        name: t('common.challenges'),
        type: MetricType.Challenge,
        count: getMetricCount(metrics, MetricType.Challenge),
        color: 'neutral',
      },
      {
        name: t('common.opportunities'),
        count: getMetricCount(metrics, MetricType.Opportunity),
        color: 'primary',
      },
      {
        name: t('common.members'),
        count: getMetricCount(metrics, MetricType.Member),
        color: 'neutralMedium',
      },
    ];
  }, [metrics, t]);

  return (
    <AboutSection
      infoBlockTitle={name}
      infoBlockText={tagline}
      tags={tags}
      vision={vision}
      background={background}
      impact={impact}
      who={who}
      communityReadAccess={communityReadAccess}
      loading={loading}
      error={error}
      isHub
      leadOrganizations={leadOrganizations}
      leadUsers={leadUsers}
      memberUsers={memberUsers}
      memberUsersCount={memberUsersCount}
      memberOrganizations={memberOrganizations}
      memberOrganizationsCount={memberOrganizationsCount}
      hubNameId={hubNameId}
      communityId={communityId}
      references={references}
      metricsItems={metricsItems}
    />
  );
};
