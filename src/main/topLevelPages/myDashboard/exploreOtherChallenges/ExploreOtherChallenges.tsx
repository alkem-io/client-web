import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import DashboardSpacesSection, {
  DashboardSpaceSectionProps,
} from '../../../../domain/shared/components/DashboardSections/DashboardSpacesSection';
import { useDashboardSpacesPaginatedQuery } from '../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../core/ui/loading/Loading';
import useTranslationWithLineBreaks from '../../../../core/ui/typography/useTranslationWithLineBreaks';
import {
  CommunityMembershipStatus,
  DashboardSpacesPaginatedQuery,
  DashboardSpacesPaginatedQueryVariables,
  SpacePrivacyMode,
  SpaceVisibility,
} from '../../../../core/apollo/generated/graphql-schema';
import FilterByTag from '../../../../domain/journey/space/FilterByTag/FilterByTag';
import FilterButtons from '../../../../domain/journey/space/FilterByTag/FilterButtons';
import { useTranslation } from 'react-i18next';
import useLazyLoading from '../../../../domain/shared/pagination/useLazyLoading';
import usePaginatedQuery from '../../../../domain/shared/pagination/usePaginatedQuery';

const SPACES_PAGE_SIZE = 10;

const ExploreOtherChallenges = () => {
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

  const spacesLoader = useLazyLoading(Box, {
    hasMore: spaces.hasMore || false,
    loading: spaces.loading || false,
    fetchMore: () => spaces.fetchMore(),
  });

  const getSpaceCardProps: DashboardSpaceSectionProps<{
    settings?: {
      privacy?: {
        mode: SpacePrivacyMode;
      };
    };
    community?: {
      roleSet?: {
        myMembershipStatus?: CommunityMembershipStatus;
      };
    };
  }>['getSpaceCardProps'] = space => {
    return {
      locked: space.settings?.privacy?.mode === SpacePrivacyMode.Private,
      member: space.community?.roleSet?.myMembershipStatus === CommunityMembershipStatus.Member,
    };
  };

  const spaceItems = useMemo(
    () =>
      (spaces.items ?? []).filter(
        space => space.community?.roleSet?.myMembershipStatus !== CommunityMembershipStatus.Member
      ) ?? [],
    [spaces.items?.length]
  );

  return (
    <FilterByTag
      items={spaceItems}
      valueGetter={space => ({ id: space.id, values: space?.profile.tagset?.tags ?? [] })}
    >
      {({ items: filteredSpaces, value, handleChange }) => (
        <DashboardSpacesSection
          headerText={tLineBreaks('pages.home.sections.exploreOtherSubspaces.header')}
          spaces={filteredSpaces}
          getSpaceCardProps={getSpaceCardProps}
          loader={spacesLoader}
          scrollable
        >
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

export default ExploreOtherChallenges;
