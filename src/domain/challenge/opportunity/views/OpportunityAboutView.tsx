/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { AboutSection } from '../../common/tabs/AboutSection';
import { MetricType } from '../../../platform/metrics/MetricType';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import { useTranslation } from 'react-i18next';
import {
  AssociatedOrganizationDetailsFragment,
  LifecycleContextTabFragment,
  MetricsItemFragment,
  ReferenceDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../community/community/EntityDashboardContributorsSection/Types';
import { useOpportunity } from '../hooks/useOpportunity';

interface ChallengeAboutViewProps {
  name: string | undefined;
  tagline: string | undefined;
  tags: string[] | undefined;
  vision: string | undefined;
  background: string | undefined;
  impact: string | undefined;
  who: string | undefined;
  communityReadAccess: boolean | undefined;
  leadOrganizations: AssociatedOrganizationDetailsFragment[] | undefined;
  leadUsers: EntityDashboardLeads['leadUsers'];
  memberUsers: EntityDashboardContributors['memberUsers'];
  memberUsersCount: EntityDashboardContributors['memberUsersCount'];
  memberOrganizations: EntityDashboardContributors['memberOrganizations'];
  memberOrganizationsCount: EntityDashboardContributors['memberOrganizationsCount'];
  references: ReferenceDetailsFragment[] | undefined;
  metrics: MetricsItemFragment[] | undefined;
  lifecycle?: LifecycleContextTabFragment;
  loading: boolean | undefined;
  error?: ApolloError;
}

export const OpportunityAboutView: FC<ChallengeAboutViewProps> = ({
  name = '',
  tagline = '',
  tags = [],
  vision = '',
  background = '',
  impact = '',
  who = '',
  communityReadAccess = false,
  leadOrganizations,
  leadUsers,
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
  references,
  metrics,
  lifecycle,
  loading,
  error,
}) => {
  const { t } = useTranslation();
  const { hubNameId, communityId } = useOpportunity();

  const metricsItems: MetricItem[] = useMemo(() => {
    return [
      {
        name: t('common.members'),
        type: MetricType.Member,
        count: getMetricCount(metrics, MetricType.Member),
        color: 'neutralMedium',
      },
      {
        name: t('common.interests'),
        count: getMetricCount(metrics, MetricType.Relation),
        color: 'primary',
      },
    ];
  }, [metrics, t]);

  return (
    <AboutSection
      entityTypeName="opportunity"
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
      lifecycle={lifecycle}
    />
  );
};
