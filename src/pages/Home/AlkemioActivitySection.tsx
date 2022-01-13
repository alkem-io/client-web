import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import DashboardActivitySection from '../../components/composite/common/sections/DashboardActivitySection';
import { SectionProps } from '../../components/core/Section/Section';
import getActivityCount from '../../utils/get-activity-count';
import useServerMetadata from '../../hooks/useServerMetadata';

const AlkemioActivitySection: FC<{
  classes?: SectionProps['classes'];
}> = ({ classes }) => {
  const { t } = useTranslation();

  const { activity, loading } = useServerMetadata();

  const [ecoverseCount, challengeCount, opportunityCount, userCount, orgCount] = [
    getActivityCount(activity, 'ecoverses') || 0,
    getActivityCount(activity, 'challenges') || 0,
    getActivityCount(activity, 'opportunities') || 0,
    getActivityCount(activity, 'users') || 0,
    getActivityCount(activity, 'organizations') || 0,
  ];
  const summary: ActivityItem[] = useMemo(
    () => [
      { name: t('pages.activity.hubs'), isLoading: loading, digit: ecoverseCount, color: 'primary' },
      {
        name: t('pages.activity.challenges'),
        isLoading: loading,
        digit: challengeCount,
        color: 'primary',
      },
      {
        name: t('pages.activity.opportunities'),
        isLoading: loading,
        digit: opportunityCount,
        color: 'primary',
      },
      {
        name: t('pages.activity.users'),
        isLoading: loading,
        digit: userCount,
        color: 'primary',
      },
      {
        name: t('pages.activity.organizations'),
        isLoading: loading,
        digit: orgCount,
        color: 'primary',
      },
    ],
    [activity, loading]
  );

  return (
    <DashboardActivitySection
      headerText={t('pages.activity.title', { blockName: 'Platform' })}
      bodyText="" //
      activities={summary}
      classes={classes}
    />
  );
};

export default AlkemioActivitySection;
