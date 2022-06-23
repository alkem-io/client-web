import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import DashboardActivitySection from '../../components/composite/common/sections/DashboardActivitySection';
import { SectionProps } from '../../domain/shared/components/Section/Section';
import getActivityCount from '../../utils/get-activity-count';
import useServerMetadata from '../../hooks/useServerMetadata';

const AlkemioActivitySection: FC<{
  classes?: SectionProps['classes'];
}> = ({ classes }) => {
  const { t } = useTranslation();

  const { activity, loading } = useServerMetadata();

  const [hubCount, challengeCount, opportunityCount, userCount, orgCount] = [
    getActivityCount(activity, 'hubs') || 0,
    getActivityCount(activity, 'challenges') || 0,
    getActivityCount(activity, 'opportunities') || 0,
    getActivityCount(activity, 'users') || 0,
    getActivityCount(activity, 'organizations') || 0,
  ];
  const summary: ActivityItem[] = useMemo(
    () => [
      { name: t('pages.activity.hubs'), isLoading: loading, count: hubCount, color: 'primary' },
      {
        name: t('common.challenges'),
        isLoading: loading,
        count: challengeCount,
        color: 'primary',
      },
      {
        name: t('common.opportunities'),
        isLoading: loading,
        count: opportunityCount,
        color: 'primary',
      },
      {
        name: t('common.users'),
        isLoading: loading,
        count: userCount,
        color: 'primary',
      },
      {
        name: t('common.organizations'),
        isLoading: loading,
        count: orgCount,
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
