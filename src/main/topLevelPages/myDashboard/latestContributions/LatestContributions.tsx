import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import ScrollerWithGradient from '../../../../core/ui/overflow/ScrollerWithGradient';
import { useLatestContributionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import usePaginatedQuery from '../../../../domain/shared/pagination/usePaginatedQuery';
import {
  ActivityLogResultType,
  ActivityViewChooser,
} from '../../../../domain/collaboration/activity/ActivityLog/ActivityComponent';
import {
  ActivityFeedRoles,
  LatestContributionsQuery,
  LatestContributionsQueryVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import { Box, SelectChangeEvent, Skeleton, Theme, useMediaQuery, useTheme } from '@mui/material';
import React, { forwardRef, useMemo, useState } from 'react';
import SeamlessSelect from '../../../../core/ui/forms/select/SeamlessSelect';
import { SelectOption } from '@mui/base';
import useLazyLoading from '../../../../domain/shared/pagination/useLazyLoading';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { gutters } from '../../../../core/ui/grid/utils';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { buildAuthorFromUser } from '../../../../domain/community/user/utils/buildAuthorFromUser';

const ROLE_OPTION_ALL = 'ROLE_OPTION_ALL';
const SPACE_OPTION_ALL = 'SPACE_OPTION_ALL';

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

interface LatestContributionsProps {
  spaceMemberships:
    | (Identifiable & {
        profile: {
          displayName: string;
        };
      })[]
    | undefined;
}

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

  return (
    <PageContentBlock sx={{ flexGrow: 1, flexShrink: 1, flexBasis: isMobile ? gutters(30) : 0 }}>
      <PageContentBlockHeader title={t('pages.home.sections.latestContributions.title')} />
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
      <ScrollerWithGradient>
        <Box padding={1}>
          {data?.activityFeed.activityFeed.map(activity => {
            const author = buildAuthorFromUser((activity as ActivityLogResultType).triggeredBy);
            return (
              <ActivityViewChooser
                key={activity.id}
                activity={activity as ActivityLogResultType}
                avatarUrl={author.avatarUrl}
                journeyUrl={activity.journey?.profile.url ?? ''}
              />
            );
          })}
          {loader}
        </Box>
      </ScrollerWithGradient>
    </PageContentBlock>
  );
};

export default LatestContributions;
