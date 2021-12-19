import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import DashboardActivitySection from '../../components/composite/common/sections/DashboardActivitySection';
import { SectionProps } from '../../components/core/Section/Section';
import { useGlobalActivityQuery } from '../../hooks/generated/graphql';
import getActivityCount from '../../utils/get-activity-count';

const AlkemioActivitySection: FC<{
  classes?: SectionProps['classes'];
}> = ({ classes }) => {
  const { t } = useTranslation();

  const { data: activity, loading: isActivityLoading } = useGlobalActivityQuery({ fetchPolicy: 'no-cache' });
  const globalActivity = activity?.metadata?.activity || [];
  const [ecoverseCount, challengeCount, opportunityCount, userCount, orgCount] = [
    getActivityCount(globalActivity, 'ecoverses') || 0,
    getActivityCount(globalActivity, 'challenges') || 0,
    getActivityCount(globalActivity, 'opportunities') || 0,
    getActivityCount(globalActivity, 'users') || 0,
    getActivityCount(globalActivity, 'organizations') || 0,
  ];
  const summary: ActivityItem[] = useMemo(
    () => [
      { name: t('pages.activity.hubs'), isLoading: isActivityLoading, digit: ecoverseCount, color: 'primary' },
      {
        name: t('pages.activity.challenges'),
        isLoading: isActivityLoading,
        digit: challengeCount,
        color: 'primary',
      },
      {
        name: t('pages.activity.opportunities'),
        isLoading: isActivityLoading,
        digit: opportunityCount,
        color: 'primary',
      },
      {
        name: t('pages.activity.users'),
        isLoading: isActivityLoading,
        digit: userCount,
        color: 'primary',
      },
      {
        name: t('pages.activity.organizations'),
        isLoading: isActivityLoading,
        digit: orgCount,
        color: 'primary',
      },
    ],
    [globalActivity, isActivityLoading]
  );

  return (
    <DashboardActivitySection
      headerText={t('pages.activity.title', { blockName: 'Platform' })}
      bodyText={t('pages.activity.summary', { blockName: 'Alkemio Hub' })}
      activities={summary}
      classes={classes}
    />
  );
};

export default AlkemioActivitySection;
