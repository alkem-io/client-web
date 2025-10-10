import { useMemo, useState } from 'react';
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
import { Box, SelectChangeEvent, Skeleton, useTheme } from '@mui/material';
import SeamlessSelect from '@/core/ui/forms/select/SeamlessSelect';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { gutters } from '@/core/ui/grid/utils';
import Gutters from '@/core/ui/grid/Gutters';
import { LatestContributionsProps, ROLE_OPTION_ALL, SPACE_OPTION_ALL } from './LatestContributionsProps';
import Loading from '@/core/ui/loading/Loading';
import { useDashboardContext } from '../DashboardContext';
import { Caption } from '@/core/ui/typography';
import { DashboardDialog } from '../DashboardDialogs/DashboardDialogsProps';
import { useScreenSize } from '@/core/ui/grid/constants';

const SELECTABLE_ROLES = [ActivityFeedRoles.Member, ActivityFeedRoles.Admin, ActivityFeedRoles.Lead] as const;

const LATEST_CONTRIBUTIONS_PAGE_SIZE = 20;

const Loader = ({ ref }) => {
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
};

export interface RoleOption {
  value: ActivityFeedRoles | typeof ROLE_OPTION_ALL;
  label: string;
}

export interface SpaceOption {
  value: string | typeof SPACE_OPTION_ALL;
  label: string;
}

const LatestContributions = ({ limit, spaceMemberships }: LatestContributionsProps) => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();

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

  const spaceOptions = useMemo<SpaceOption[]>(() => {
    const spaces: SpaceOption[] =
      spaceMemberships?.map(space => ({
        value: space.id,
        label: space.about.profile.displayName,
      })) ?? [];

    spaces.unshift({
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

  const roleOptions = useMemo<RoleOption[]>(() => {
    const options: RoleOption[] = SELECTABLE_ROLES.map(role => ({
      value: role,
      label: t(`common.roles.${role}` as const),
    }));

    options.unshift({
      value: ROLE_OPTION_ALL,
      label: t('pages.home.sections.latestContributions.filter.role.all'),
    });

    return options;
  }, [t]);

  const activityFeed = data?.activityFeed?.activityFeed;

  const renderActivities = () =>
    (typeof limit === 'number' ? (activityFeed ?? []).slice(0, limit) : (activityFeed ?? []))?.map(activity => (
      <ActivityViewChooser
        key={activity.id}
        activity={activity as ActivityLogResultType}
        avatarUrl={activity.triggeredBy.profile.avatar?.uri ?? ''}
        avatarAlt={
          activity.triggeredBy.profile.displayName
            ? t('common.avatar-of', { user: activity.triggeredBy.profile.displayName })
            : t('common.avatar')
        }
      />
    ));

  return (
    <>
      <Gutters
        disablePadding
        disableGap
        sx={{ flexGrow: 1, flexShrink: 1, flexBasis: isSmallScreen ? gutters(30) : 0 }}
      >
        <Box display="flex" justifyContent="end" alignItems="center">
          <SeamlessSelect
            value={filter.space}
            options={spaceOptions}
            label={t('pages.home.sections.latestContributions.filter.space.label')}
            onChange={handleSpaceSelect}
            shrink
          />
          <SeamlessSelect
            value={filter.role}
            options={roleOptions}
            label={t('pages.home.sections.latestContributions.filter.role.label')}
            onChange={handleRoleSelect}
          />
        </Box>

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
