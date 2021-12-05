import { Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Activities, ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import Section, { SectionSpacer } from '../../components/core/Section/Section';
import SectionHeader from '../../components/core/Section/SectionHeader';
import { useGlobalActivityQuery } from '../../hooks/generated/graphql';
import getActivityCount from '../../utils/get-activity-count';

const QuickStatsSection = () => {
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
      { name: t('pages.activity.ecoverses'), isLoading: isActivityLoading, digit: ecoverseCount, color: 'neutral' },
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
        color: 'positive',
      },
      {
        name: t('pages.activity.organizations'),
        isLoading: isActivityLoading,
        digit: orgCount,
        color: 'positive',
      },
    ],
    [globalActivity, isActivityLoading]
  );

  return (
    <Section>
      <SectionHeader text={t('pages.activity.title', { blockName: 'All' })} />
      <Typography variant="body1">{t('pages.activity.summary', { blockName: 'Alkemio' })}</Typography>
      <SectionSpacer />
      <Activities items={summary} asList={false} />
    </Section>
  );
};

export default QuickStatsSection;
