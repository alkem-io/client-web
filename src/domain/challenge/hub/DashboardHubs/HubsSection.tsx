import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography/Typography';
import DashboardHubsSection, {
  DashboardHubSectionProps,
} from '../../../shared/components/DashboardSections/DashboardHubsSection';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import { useUserContext } from '../../../../hooks';
import { useHubsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import MetricTooltip from '../../../platform/metrics/MetricTooltip';
import useServerMetadata from '../../../platform/metadata/useServerMetadata';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import { EntityContributionCardLabel } from '../../../../common/components/composite/common/cards/ContributionCard/EntityContributionCard';
import { keyBy } from 'lodash';
import { UserRolesInEntity } from '../../../community/contributor/user/providers/UserProvider/UserRolesInEntity';
import { Loading } from '../../../../common/components/core';
import { MetricType } from '../../../platform/metrics/MetricType';

interface HubsSectionProps {
  userHubRoles: UserRolesInEntity[] | undefined;
  loading?: boolean;
}

const HubsSection = ({ userHubRoles, loading }: HubsSectionProps) => {
  const { t } = useTranslation();
  const { user } = useUserContext();
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

  const isMember = (hubId: string) => user?.ofHub(hubId) ?? false;

  const getHubCardLabel: DashboardHubSectionProps['getHubCardLabel'] = hub => {
    if (isMember(hub.id)) {
      return EntityContributionCardLabel.Member;
    }
    if (!hub.authorization?.anonymousReadAccess) {
      return EntityContributionCardLabel.Anonymous;
    }
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
      subHeaderText={t('pages.home.sections.hub.subheader')}
      primaryAction={<MetricTooltip metricsItems={metricItems} />}
      hubs={hubs}
      getHubCardLabel={getHubCardLabel}
    >
      <Typography variant="body1">{t('pages.home.sections.hub.body')}</Typography>
      <Typography variant="body1">{t('pages.home.sections.hub.body1')}</Typography>
      <SectionSpacer />
      {isLoading && <Loading />}
    </DashboardHubsSection>
  );
};

export default HubsSection;
