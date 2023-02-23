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
import { HubVisibility } from '../../../../core/apollo/generated/graphql-schema';
import FilterByTag from '../FilterByTag/FilterByTag';
import FilterButtons from '../FilterByTag/FilterButtons';
import { useTranslation } from 'react-i18next';

interface HubsSectionProps {
  userHubRoles: UserRolesInEntity[] | undefined;
  loading?: boolean;
}

const HubsSection = ({ userHubRoles, loading }: HubsSectionProps) => {
  const { t: tLineBreaks } = useTranslationWithLineBreaks();
  const { t: tRaw } = useTranslation();
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
      isDemoHub: hub.visibility === HubVisibility.Demo,
    };
  };

  const metricItems: MetricItem[] = useMemo(
    () => [
      { name: tLineBreaks('pages.activity.hubs'), isLoading: isLoadingActivities, count: hubCount, color: 'primary' },
      {
        name: tLineBreaks('common.challenges'),
        isLoading: isLoadingActivities,
        count: challengeCount,
        color: 'primary',
      },
      {
        name: tLineBreaks('common.opportunities'),
        isLoading: isLoadingActivities,
        count: opportunityCount,
        color: 'primary',
      },
    ],
    [challengeCount, hubCount, isLoadingActivities, opportunityCount, tLineBreaks]
  );

  const isLoading = loading || areHubsLoading;

  return (
    <FilterByTag items={hubs} valueGetter={hub => ({ id: hub.id, values: hub?.tagset?.tags ?? [] })}>
      {({ items: filteredHubs, value, handleChange }) => (
        <DashboardHubsSection
          headerText={tLineBreaks('pages.home.sections.hub.header')}
          primaryAction={<MetricTooltip metricsItems={metricItems} />}
          hubs={filteredHubs}
          getHubCardProps={getHubCardProps}
        >
          <Box>
            <Caption>{tLineBreaks('pages.home.sections.hub.body')}</Caption>
            <Caption>{tLineBreaks('pages.home.sections.hub.body1')}</Caption>
          </Box>
          <FilterButtons
            value={value}
            config={tRaw('hubs-filter.config', { returnObjects: true })}
            onChange={handleChange}
          />
          {isLoading && <Loading />}
        </DashboardHubsSection>
      )}
    </FilterByTag>
  );
};

export default HubsSection;
