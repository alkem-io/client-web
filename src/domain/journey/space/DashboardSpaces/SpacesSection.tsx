import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import DashboardSpacesSection, {
  DashboardSpaceSectionProps,
} from '../../../shared/components/DashboardSections/DashboardSpacesSection';
import { useDashboardSpacesPaginatedQuery } from '../../../../core/apollo/generated/apollo-hooks';
import MetricTooltip from '../../../platform/metrics/MetricTooltip';
import useServerMetadata from '../../../platform/metadata/useServerMetadata';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricItem } from '../../../platform/metrics/views/Metrics';
import Loading from '../../../../core/ui/loading/Loading';
import { MetricType } from '../../../platform/metrics/MetricType';
import { Caption } from '../../../../core/ui/typography';
import useTranslationWithLineBreaks from '../../../../core/ui/typography/useTranslationWithLineBreaks';
import {
  CommunityMembershipStatus,
  DashboardSpacesPaginatedQuery,
  DashboardSpacesPaginatedQueryVariables,
  SpaceVisibility,
} from '../../../../core/apollo/generated/graphql-schema';
import FilterByTag from '../FilterByTag/FilterByTag';
import FilterButtons from '../FilterByTag/FilterButtons';
import { useTranslation } from 'react-i18next';
import useLazyLoading from '../../../shared/pagination/useLazyLoading';
import usePaginatedQuery from '../../../shared/pagination/usePaginatedQuery';

const SPACES_PAGE_SIZE = 10;

const SpacesSection = () => {
  const { t: tLineBreaks } = useTranslationWithLineBreaks();
  const { t: tRaw } = useTranslation();

  const spacesQueryResult = usePaginatedQuery<DashboardSpacesPaginatedQuery, DashboardSpacesPaginatedQueryVariables>({
    useQuery: useDashboardSpacesPaginatedQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
    },
    variables: {
      visibilities: [SpaceVisibility.Active],
    },
    pageSize: SPACES_PAGE_SIZE,
    getPageInfo: result => result.spacesPaginated.pageInfo,
  });

  const spaces = {
    items: spacesQueryResult.data?.spacesPaginated.spaces,
    loading: spacesQueryResult.loading,
    hasMore: spacesQueryResult.hasMore,
    pageSize: spacesQueryResult.pageSize,
    firstPageSize: spacesQueryResult.firstPageSize,
    error: spacesQueryResult.error,
    fetchMore: spacesQueryResult.fetchMore,
  };

  const { metrics, loading: isLoadingActivities } = useServerMetadata();

  const [spaceCount, challengeCount, opportunityCount] = [
    getMetricCount(metrics, MetricType.Space),
    getMetricCount(metrics, MetricType.Challenge),
    getMetricCount(metrics, MetricType.Opportunity),
  ];

  const spacesLoader = useLazyLoading(Box, {
    hasMore: spaces.hasMore || false,
    loading: spaces.loading || false,
    fetchMore: () => spaces.fetchMore(),
  });

  const getSpaceCardProps: DashboardSpaceSectionProps<{
    authorization?: {
      anonymousReadAccess: boolean;
    };
    community?: {
      myMembershipStatus?: CommunityMembershipStatus;
    };
  }>['getSpaceCardProps'] = space => {
    return {
      locked: !space.authorization?.anonymousReadAccess,
      isDemoSpace: space.visibility === SpaceVisibility.Demo,
      member: space.community?.myMembershipStatus === CommunityMembershipStatus.Member,
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

  const spaceItems = useMemo(
    () =>
      (spaces.items ?? []).filter(space => space.community?.myMembershipStatus !== CommunityMembershipStatus.Member) ??
      [],
    [spaces.items?.length]
  );

  return (
    <FilterByTag
      items={spaceItems}
      valueGetter={space => ({ id: space.id, values: space?.profile.tagset?.tags ?? [] })}
    >
      {({ items: filteredSpaces, value, handleChange }) => (
        <DashboardSpacesSection
          headerText={tLineBreaks('pages.home.sections.space.header')}
          primaryAction={<MetricTooltip metricsItems={metricItems} />}
          spaces={filteredSpaces}
          getSpaceCardProps={getSpaceCardProps}
          loader={spacesLoader}
          scrollable
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
          {spaces.loading && <Loading />}
        </DashboardSpacesSection>
      )}
    </FilterByTag>
  );
};

export default SpacesSection;
