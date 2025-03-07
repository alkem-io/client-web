import { useTranslation } from 'react-i18next';
import ScrollerWithGradient from '@/core/ui/overflow/ScrollerWithGradient';
import { useLatestContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import {
  ActivityLogResultType,
  ActivityViewChooser,
} from '@/domain/collaboration/activity/ActivityLog/ActivityComponent';
import {
  ActivityEventType,
  ActivityFeedRoles,
  LatestContributionsQuery,
  LatestContributionsQueryVariables,
} from '@/core/apollo/generated/graphql-schema';
import { Box, SelectChangeEvent, Skeleton, Theme, useMediaQuery, useTheme } from '@mui/material';
import React, { forwardRef, useMemo, useState } from 'react';
import SeamlessSelect from '@/core/ui/forms/select/SeamlessSelect';
import { SelectOption } from '@mui/base';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { gutters } from '@/core/ui/grid/utils';
import Gutters from '@/core/ui/grid/Gutters';
import { LatestContributionsProps, ROLE_OPTION_ALL, SPACE_OPTION_ALL } from './LatestContributionsProps';
import Loading from '@/core/ui/loading/Loading';
import { useDashboardContext } from '../DashboardContext';
import { Caption } from '@/core/ui/typography';
import { DashboardDialog } from '../DashboardDialogs/DashboardDialogsProps';

const SELECTABLE_ROLES = [ActivityFeedRoles.Member, ActivityFeedRoles.Admin, ActivityFeedRoles.Lead] as const;

const LATEST_CONTRIBUTIONS_PAGE_SIZE = 20;

const Loader = forwardRef((props, ref) => {
  const theme = useTheme();

  return (
    <BadgeCardView
      ref={ref}
      visual={<Skeleton variant="rectangular" width={gutters(2)(theme)} height={gutters(2)(theme)} />}
    >
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
    </BadgeCardView>
  );
});

const LatestContributions = ({ limit, spaceMemberships }: LatestContributionsProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const [filter, setFilter] = useState<{
    space: string;
    role: ActivityFeedRoles | typeof ROLE_OPTION_ALL;
  }>({
    space: SPACE_OPTION_ALL,
    role: ROLE_OPTION_ALL,
  });

  const { isOpen, setIsOpen } = useDashboardContext();

  const handleRoleSelect = (event: SelectChangeEvent<unknown>) =>
    setFilter(prevState => ({
      ...prevState,
      role: event.target.value as ActivityFeedRoles | typeof ROLE_OPTION_ALL,
    }));

  const handleSpaceSelect = (event: SelectChangeEvent<unknown>) =>
    setFilter(prevState => ({
      ...prevState,
      space: event.target.value as string | typeof SPACE_OPTION_ALL,
    }));

  const spaceOptions = useMemo(() => {
    const spaces: Partial<SelectOption<string | typeof SPACE_OPTION_ALL>>[] =
      spaceMemberships?.map(space => ({
        value: space.id,
        label: space.about.profile.displayName,
      })) ?? [];

    spaces?.unshift({
      value: SPACE_OPTION_ALL,
      label: t('pages.home.sections.latestContributions.filter.space.all'),
    });

    return spaces;
  }, [spaceMemberships, t]);

  const { data, hasMore, loading, fetchMore } = usePaginatedQuery<
    LatestContributionsQuery,
    LatestContributionsQueryVariables
  >({
    useQuery: useLatestContributionsQuery,
    getPageInfo: data => data.activityFeed.pageInfo,
    pageSize: LATEST_CONTRIBUTIONS_PAGE_SIZE,
    variables: {
      filter: {
        spaceIds: filter.space === SPACE_OPTION_ALL ? undefined : [filter.space],
        roles: filter.role === ROLE_OPTION_ALL ? undefined : [filter.role],
        excludeTypes: [ActivityEventType.CalloutWhiteboardContentModified],
      },
    },
  });

  const loader = useLazyLoading(Loader, { hasMore, loading, fetchMore });

  const roleOptions = useMemo(() => {
    const options: Partial<SelectOption<ActivityFeedRoles | typeof ROLE_OPTION_ALL>>[] = SELECTABLE_ROLES.map(role => ({
      value: role,
      label: t(`common.roles.${role}` as const),
    }));

    options.unshift({
      value: ROLE_OPTION_ALL,
      label: t('pages.home.sections.latestContributions.filter.role.all'),
    });

    return options;
  }, [t]);

  const renderFilters = () => (
    <Box display="flex" justifyContent="end" alignItems="center">
      <SeamlessSelect
        value={filter.space}
        options={spaceOptions}
        label={t('pages.home.sections.latestContributions.filter.space.label')}
        onChange={handleSpaceSelect}
      />
      <SeamlessSelect
        value={filter.role}
        options={roleOptions}
        label={t('pages.home.sections.latestContributions.filter.role.label')}
        onChange={handleRoleSelect}
      />
    </Box>
  );

  const activityFeed = data?.activityFeed?.activityFeed;

  const renderActivities = () =>
    (typeof limit === 'number' ? (activityFeed ?? []).slice(0, limit) : activityFeed ?? [])?.map(activity => (
      <ActivityViewChooser
        key={activity.id}
        activity={activity as ActivityLogResultType}
        avatarUrl={activity.triggeredBy.profile.avatar?.uri}
      />
    ));

  return (
    <>
      <Gutters disablePadding disableGap sx={{ flexGrow: 1, flexShrink: 1, flexBasis: isMobile ? gutters(30) : 0 }}>
        {renderFilters()}

        {!data && loading ? (
          <Loading />
        ) : (
          <ScrollerWithGradient>
            <Box padding={gutters(0.5)}>
              {renderActivities()}

              {isOpen && typeof limit !== 'number' && loader}
            </Box>
          </ScrollerWithGradient>
        )}
      </Gutters>

      {typeof limit === 'number' && activityFeed && activityFeed?.length > limit && (
        <Caption
          sx={{ marginLeft: 'auto', cursor: 'pointer' }}
          onClick={() => setIsOpen(DashboardDialog.MySpaceActivity)}
        >
          {t('common.show-more')}
        </Caption>
      )}
    </>
  );
};

export default LatestContributions;
