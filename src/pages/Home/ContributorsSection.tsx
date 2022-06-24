import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributorsSection from '../../domain/shared/components/DashboardSections/DashboardContributorsSection';
import { useHomePageContributors } from '../../domain/community/HomePageContributors';
import SectionHeaderTextWithActivity from '../../domain/activity/SectionHeaderTextWithActivity';
import useServerMetadata from '../../hooks/useServerMetadata';
import getActivityCount from '../../domain/activity/utils/getActivityCount';
import { ActivityType } from '../../domain/activity/ActivityType';

const ACTIVITY_TYPES: ActivityType[] = [ActivityType.User, ActivityType.Organization];

const ContributorsSection = () => {
  const { t } = useTranslation();

  const { entities, loading: isLoadingContributors } = useHomePageContributors();

  const { activity, loading: isLoadingActivities } = useServerMetadata();

  const [usersActivity, organizationsActivity] = ACTIVITY_TYPES.map(type => getActivityCount(activity, type));

  return (
    <DashboardContributorsSection
      headerText={t('contributors-section.title')}
      subHeaderText={t('contributors-section.subheader')}
      userTitle={
        <SectionHeaderTextWithActivity
          headerText={t('contributors-section.users-title')}
          activity={usersActivity}
          loading={isLoadingActivities}
        />
      }
      organizationTitle={
        <SectionHeaderTextWithActivity
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
