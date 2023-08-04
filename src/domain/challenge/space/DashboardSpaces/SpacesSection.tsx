import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import DashboardSpacesSection, {
  DashboardSpaceSectionProps,
} from '../../../shared/components/DashboardSections/DashboardSpacesSection';
import { useSpacesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import MetricTooltip from '../../../platform/metrics/MetricTooltip';
import useServerMetadata from '../../../platform/metadata/useServerMetadata';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricItem } from '../../../platform/metrics/views/Metrics';
import { keyBy } from 'lodash';
import { UserRolesInEntity } from '../../../community/contributor/user/providers/UserProvider/UserRolesInEntity';
import { Loading } from '../../../../common/components/core';
import { MetricType } from '../../../platform/metrics/MetricType';
import { Caption } from '../../../../core/ui/typography';
import useTranslationWithLineBreaks from '../../../../core/ui/typography/useTranslationWithLineBreaks';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import FilterByTag from '../FilterByTag/FilterByTag';
import FilterButtons from '../FilterByTag/FilterButtons';
import { useTranslation } from 'react-i18next';

interface SpacesSectionProps {
  userSpaceRoles: UserRolesInEntity[] | undefined;
  loading?: boolean;
}

const SpacesSection = ({ userSpaceRoles, loading }: SpacesSectionProps) => {
  const { t: tLineBreaks } = useTranslationWithLineBreaks();
  const { t: tRaw } = useTranslation();
  const { data: spacesData, loading: areSpacesLoading } = useSpacesQuery({ fetchPolicy: 'cache-and-network' });

  const spaceRolesBySpaceId = useMemo(() => keyBy(userSpaceRoles, 'id'), [userSpaceRoles]);
  const spaces = useMemo(
    () => spacesData?.spaces.filter(({ id }) => !spaceRolesBySpaceId[id]) ?? [],
    [spacesData, spaceRolesBySpaceId]
  );

  const { metrics, loading: isLoadingActivities } = useServerMetadata();

  const [spaceCount, challengeCount, opportunityCount] = [
    getMetricCount(metrics, MetricType.Space),
    getMetricCount(metrics, MetricType.Challenge),
    getMetricCount(metrics, MetricType.Opportunity),
  ];

  const getSpaceCardProps: DashboardSpaceSectionProps['getSpaceCardProps'] = space => {
    return {
      locked: !space.authorization?.anonymousReadAccess,
      isDemoSpace: space.visibility === SpaceVisibility.Demo,
    };
  };

  const metricItems: MetricItem[] = useMemo(
    () => [
      {
        name: tLineBreaks('pages.activity.spaces'),
        isLoading: isLoadingActivities,
        count: spaceCount,
        color: 'primary',
      },
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
    [challengeCount, spaceCount, isLoadingActivities, opportunityCount, tLineBreaks]
  );

  const isLoading = loading || areSpacesLoading;

  return (
    <FilterByTag items={spaces} valueGetter={space => ({ id: space.id, values: space?.profile.tagset?.tags ?? [] })}>
      {({ items: filteredSpaces, value, handleChange }) => (
        <DashboardSpacesSection
          headerText={tLineBreaks('pages.home.sections.space.header')}
          primaryAction={<MetricTooltip metricsItems={metricItems} />}
          spaces={filteredSpaces}
          getSpaceCardProps={getSpaceCardProps}
        >
          <Box>
            <Caption>{tLineBreaks('pages.home.sections.space.body')}</Caption>
            <Caption>{tLineBreaks('pages.home.sections.space.body1')}</Caption>
          </Box>
          <FilterButtons
            value={value}
            config={tRaw('spaces-filter.config', { returnObjects: true })}
            onChange={handleChange}
          />
          {isLoading && <Loading />}
        </DashboardSpacesSection>
      )}
    </FilterByTag>
  );
};

export default SpacesSection;
