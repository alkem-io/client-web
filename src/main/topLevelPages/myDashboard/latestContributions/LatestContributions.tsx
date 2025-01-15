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
import { Caption } from '@/core/ui/typography';
import Loading from '@/core/ui/loading/Loading';
import { useDashboardContext } from '../DashboardContext';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';

const SELECTABLE_ROLES = [ActivityFeedRoles.Member, ActivityFeedRoles.Admin, ActivityFeedRoles.Lead] as const;

const LATEST_CONTRIBUTIONS_PAGE_SIZE = 20;
const VISIBLE_LATEST_CONTRIBUTIONS_COUNT = 10;

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

const LatestContributions = ({ spaceMemberships }: LatestContributionsProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const [filter, setFilter] = useState<{
    space: string;
    role: ActivityFeedRoles | typeof ROLE_OPTION_ALL;
  }>({
    space: SPACE_OPTION_ALL,
    role: ROLE_OPTION_ALL,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { activityEnabled } = useDashboardContext();

  const handleRoleSelect = (event: SelectChangeEvent<unknown>) =>
    setFilter({
      space: SPACE_OPTION_ALL,
      role: event.target.value as ActivityFeedRoles | typeof ROLE_OPTION_ALL,
    });

  const handleSpaceSelect = (event: SelectChangeEvent<unknown>) =>
    setFilter({
      space: event.target.value as string | typeof SPACE_OPTION_ALL,
      role: ROLE_OPTION_ALL,
    });

  const spaceOptions = useMemo(() => {
    const spaces: Partial<SelectOption<string | typeof SPACE_OPTION_ALL>>[] =
      spaceMemberships?.map(space => ({
        value: space.id,
        label: space.profile.displayName,
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
      label: t(`common.enums.communityRole.${role}` as const),
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

  const showMore =
    typeof data?.activityFeed.activityFeed?.length === 'number' && data.activityFeed.activityFeed.length > 10;

  // @@@ WIP ~ #7267 - Изнеси и тук повтарящия се JSX, както направи в МайЛейтестКонтрибуции:110

  return (
    <>
      {activityEnabled ? (
        <Gutters disableGap disablePadding sx={{ flexGrow: 1, flexShrink: 1, flexBasis: isMobile ? gutters(30) : 0 }}>
          {renderFilters()}

          <ScrollerWithGradient>
            <Gutters disableGap disablePadding padding={gutters(0.5)}>
              {data?.activityFeed.activityFeed?.slice(0, VISIBLE_LATEST_CONTRIBUTIONS_COUNT).map(activity => (
                <ActivityViewChooser
                  key={activity.id}
                  activity={activity as ActivityLogResultType}
                  avatarUrl={activity.triggeredBy.profile.avatar?.uri}
                />
              ))}
            </Gutters>
          </ScrollerWithGradient>
        </Gutters>
      ) : (
        <Gutters disablePadding disableGap sx={{ flexGrow: 1, flexShrink: 1, flexBasis: isMobile ? gutters(30) : 0 }}>
          {renderFilters()}

          {!data && loading ? (
            <Loading />
          ) : (
            <ScrollerWithGradient>
              <Box padding={gutters(0.5)}>
                {data?.activityFeed.activityFeed.map(activity => (
                  <ActivityViewChooser
                    key={activity.id}
                    activity={activity as ActivityLogResultType}
                    avatarUrl={activity.triggeredBy.profile.avatar?.uri}
                  />
                ))}

                {loader}
              </Box>
            </ScrollerWithGradient>
          )}
        </Gutters>
      )}

      {activityEnabled && showMore && (
        <Caption sx={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setIsDialogOpen(true)}>
          {t('common.show-more')}
        </Caption>
      )}

      <DialogWithGrid open={isDialogOpen} columns={4} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader
          title={t('pages.home.sections.latestContributions.title')}
          onClose={() => setIsDialogOpen(false)}
        />

        <Gutters disableGap disablePadding sx={{ flexGrow: 1, flexShrink: 1, flexBasis: isMobile ? gutters(30) : 0 }}>
          {renderFilters()}

          {!data && loading ? (
            <Loading />
          ) : (
            <ScrollerWithGradient>
              <Gutters disableGap disablePadding padding={gutters(1.5)}>
                {data?.activityFeed?.activityFeed?.map(activity => (
                  <ActivityViewChooser
                    key={activity.id}
                    activity={activity as ActivityLogResultType}
                    avatarUrl={activity.triggeredBy.profile.avatar?.uri}
                  />
                ))}

                {loader}
              </Gutters>
            </ScrollerWithGradient>
          )}
        </Gutters>
      </DialogWithGrid>
    </>
  );
};

export default LatestContributions;
