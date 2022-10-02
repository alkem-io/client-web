import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributorsSection from '../../domain/shared/components/DashboardSections/DashboardContributorsSection';
import { useHomePageContributors } from '../../domain/community/community/HomePageContributors';
import SectionHeaderTextWithMetrics from '../../domain/platform/metrics/SectionHeaderTextWithMetrics';
import useServerMetadata from '../../hooks/useServerMetadata';
import getMetricsCount from '../../domain/platform/metrics/utils/getMetricCount';
import { MetricType } from '../../domain/platform/metrics/MetricType';

const ACTIVITY_TYPES: MetricType[] = [MetricType.User, MetricType.Organization];

const ContributorsSection = () => {
  const { t } = useTranslation();

  const { entities, loading: isLoadingContributors } = useHomePageContributors();

  const { metrics, loading: isLoadingActivities } = useServerMetadata();

  const [usersActivity, organizationsActivity] = ACTIVITY_TYPES.map(type => getMetricsCount(metrics, type));

  return (
    <DashboardContributorsSection
      headerText={t('contributors-section.title')}
      subHeaderText={t('contributors-section.subheader')}
      userTitle={
        <SectionHeaderTextWithMetrics
          headerText={t('contributors-section.users-title')}
          activity={usersActivity}
          loading={isLoadingActivities}
        />
      }
      organizationTitle={
        <SectionHeaderTextWithMetrics
          headerText={t('contributors-section.organizations-title')}
          activity={organizationsActivity}
          loading={isLoadingActivities}
        />
      }
      navText={`${t('buttons.see-more')}...`}
      navLink="contributors"
      entities={entities}
      loading={isLoadingContributors}
    />
  );
};

export default ContributorsSection;
