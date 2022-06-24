import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography/Typography';
import DashboardHubSection from '../../../components/composite/common/sections/DashboardHubSection';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { useUserContext } from '../../../hooks';
import { useHubsQuery } from '../../../hooks/generated/graphql';
import ActivityTooltip from '../../activity/ActivityTooltip';
import useServerMetadata from '../../../hooks/useServerMetadata';
import getActivityCount from '../../activity/utils/getActivityCount';
import { ActivityItem } from '../../../components/composite/common/ActivityPanel/Activities';

const HubSection = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { data: hubsData, loading } = useHubsQuery({ fetchPolicy: 'cache-and-network' });
  const hubs = useMemo(() => hubsData?.hubs || [], [hubsData]);

  const { activity, loading: isLoadingActivities } = useServerMetadata();

  const [hubCount, challengeCount, opportunityCount] = [
    getActivityCount(activity, 'hubs'),
    getActivityCount(activity, 'challenges'),
    getActivityCount(activity, 'opportunities'),
  ];

  const activityItems: ActivityItem[] = useMemo(
    () => [
      { name: t('pages.activity.hubs'), isLoading: isLoadingActivities, count: hubCount, color: 'primary' },
      {
        name: t('common.challenges'),
        isLoading: isLoadingActivities,
        count: challengeCount,
        color: 'primary',
      },
      {
        name: t('common.opportunities'),
        isLoading: isLoadingActivities,
        count: opportunityCount,
        color: 'primary',
      },
    ],
    [activity, loading]
  );

  return (
    <DashboardHubSection
      headerText={t('pages.home.sections.hub.header')}
      subHeaderText={t('pages.home.sections.hub.subheader')}
      primaryAction={<ActivityTooltip activityItems={activityItems} />}
      entities={{
        hubs: hubs,
        user,
      }}
      options={{
        itemBasis: '25%',
      }}
      loading={{ hubs: loading }}
    >
      <Typography variant="body1">{t('pages.home.sections.hub.body')}</Typography>
      <SectionSpacer />
    </DashboardHubSection>
  );
};

export default HubSection;
