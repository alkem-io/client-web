import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import DashboardHubsSection, {
  DashboardHubSectionProps,
} from '../../../shared/components/DashboardSections/DashboardHubsSection';
import { useHubsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import MetricTooltip from '../../../platform/metrics/MetricTooltip';
import useServerMetadata from '../../../platform/metadata/useServerMetadata';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import { keyBy } from 'lodash';
import { UserRolesInEntity } from '../../../community/contributor/user/providers/UserProvider/UserRolesInEntity';
import { Loading } from '../../../../common/components/core';
import { MetricType } from '../../../platform/metrics/MetricType';
import { Caption } from '../../../../core/ui/typography';
import useTranslationWithLineBreaks from '../../../../core/ui/typography/useTranslationWithLineBreaks';

interface HubsSectionProps {
  userHubRoles: UserRolesInEntity[] | undefined;
  loading?: boolean;
}

const HubsSection = ({ userHubRoles, loading }: HubsSectionProps) => {
  const { t } = useTranslationWithLineBreaks();
  const { data: hubsData, loading: areHubsLoading } = useHubsQuery({ fetchPolicy: 'cache-and-network' });

  const hubRolesByHubId = useMemo(() => keyBy(userHubRoles, 'id'), [userHubRoles]);
  const hubs = useMemo(
    () => hubsData?.hubs.filter(({ id }) => !hubRolesByHubId[id]) ?? [],
    [hubsData, hubRolesByHubId]
  );

  const { metrics, loading: isLoadingActivities } = useServerMetadata();

  const [hubCount, challengeCount, opportunityCount] = [
    getMetricCount(metrics, MetricType.Hub),
    getMetricCount(metrics, MetricType.Challenge),
    getMetricCount(metrics, MetricType.Opportunity),
  ];

  const getHubCardProps: DashboardHubSectionProps['getHubCardProps'] = hub => {
    return {
      locked: !hub.authorization?.anonymousReadAccess,
    };
  };

  const metricItems: MetricItem[] = useMemo(
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
    [challengeCount, hubCount, isLoadingActivities, opportunityCount, t]
  );

  const isLoading = loading || areHubsLoading;

  return (
    <DashboardHubsSection
      headerText={t('pages.home.sections.hub.header')}
      primaryAction={<MetricTooltip metricsItems={metricItems} />}
      hubs={hubs}
      getHubCardProps={getHubCardProps}
    >
      <Box>
        <Caption>{t('pages.home.sections.hub.body')}</Caption>
        <Caption>{t('pages.home.sections.hub.body1')}</Caption>
      </Box>
      {isLoading && <Loading />}
    </DashboardHubsSection>
  );
};

export default HubsSection;
