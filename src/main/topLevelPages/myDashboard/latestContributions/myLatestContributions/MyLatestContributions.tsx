import { Box, type SelectChangeEvent } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLatestContributionsGroupedQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  ActivityEventType,
  type ActivityLogCalloutWhiteboardContentModifiedFragment,
  type ActivityLogCalloutWhiteboardCreatedFragment,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import SeamlessSelect from '@/core/ui/forms/select/SeamlessSelect';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import ScrollerWithGradient from '@/core/ui/overflow/ScrollerWithGradient';
import { Caption, CaptionSmall } from '@/core/ui/typography/components';
import {
  type ActivityLogResultType,
  ActivityViewChooser,
} from '@/domain/collaboration/activity/ActivityLog/ActivityComponent';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { useDashboardContext } from '../../DashboardContext';
import { DashboardDialog } from '../../DashboardDialogs/DashboardDialogsProps';
import type { SpaceOption } from '../LatestContributions';
import { type LatestContributionsProps, SPACE_OPTION_ALL } from '../LatestContributionsProps';

const MY_LATEST_CONTRIBUTIONS_COUNT = 20;

const ACTIVITY_TYPES = [
  // Callout-related activities only
  ActivityEventType.CalloutPublished,
  ActivityEventType.CalloutPostCreated,
  ActivityEventType.CalloutPostComment,
  ActivityEventType.CalloutLinkCreated,
  ActivityEventType.CalloutWhiteboardCreated,
  ActivityEventType.CalloutWhiteboardContentModified,
  ActivityEventType.CalloutMemoCreated,
  ActivityEventType.DiscussionComment,
];

const MyLatestContributions = ({ limit, spaceMemberships }: LatestContributionsProps) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<{
    space: string;
  }>({
    space: SPACE_OPTION_ALL,
  });

  const { setIsOpen } = useDashboardContext();

  const handleSpaceSelect = (event: SelectChangeEvent<unknown>) =>
    setFilter({
      space: event.target.value as string | typeof SPACE_OPTION_ALL,
    });

  const { data, loading } = useLatestContributionsGroupedQuery({
    variables: {
      filter: {
        myActivity: true,
        types: ACTIVITY_TYPES,
        limit: MY_LATEST_CONTRIBUTIONS_COUNT,
        spaceIds: filter.space === SPACE_OPTION_ALL ? undefined : [filter.space],
      },
    },
  });

  const activities = (() => {
    // Filter out whiteboard created activities if we have an content modified activity for the same whiteboard
    const updatedWhiteboards: Record<string, true> = {};
    const filteredActivities = data?.activityFeedGrouped.filter(activity => {
      if (activity.type === ActivityEventType.CalloutWhiteboardContentModified) {
        updatedWhiteboards[(activity as ActivityLogCalloutWhiteboardContentModifiedFragment).whiteboard.id] = true;
      }
      if (activity.type !== ActivityEventType.CalloutWhiteboardCreated) {
        return true;
      }
      return !updatedWhiteboards[(activity as ActivityLogCalloutWhiteboardCreatedFragment).whiteboard.id];
    });

    return filteredActivities?.slice(0, MY_LATEST_CONTRIBUTIONS_COUNT);
  })();

  const spaceOptions = (() => {
    const spaces: SpaceOption[] =
      spaceMemberships?.map(space => ({
        value: space.id,
        label: space.about.profile.displayName,
      })) ?? [];

    spaces?.unshift({
      value: SPACE_OPTION_ALL,
      label: t('pages.home.sections.latestContributions.filter.space.all'),
    });

    return spaces;
  })();

  const renderActivities = () => {
    if (hasActivity) {
      return (typeof limit === 'number' ? (activities ?? []).slice(0, limit) : (activities ?? [])).map(activity => (
        <ActivityViewChooser
          key={activity.id}
          activity={activity as ActivityLogResultType}
          avatarUrl={
            // Use || instead of ?? here, because uri can be an empty string
            activity.space?.about.profile.avatar?.uri ||
            activity.space?.about.profile.cardBanner?.uri ||
            getDefaultSpaceVisualUrl(VisualType.Avatar, activity.space?.id)
          }
          avatarAlt={
            activity.space?.about.profile.displayName
              ? t('common.avatar-of', { user: activity.space?.about.profile.displayName })
              : t('common.avatar')
          }
        />
      ));
    }
  };

  const hasActivity = activities && activities.length > 0;
  const isAllSpacesSelected = filter.space === SPACE_OPTION_ALL;

  return (
    <>
      <Gutters disableGap={true} disablePadding={true}>
        <Box display="flex" justifyContent="end" alignItems="center">
          <SeamlessSelect
            value={filter.space}
            options={spaceOptions}
            label={t('pages.home.sections.latestContributions.filter.space.label')}
            onChange={handleSpaceSelect}
          />
        </Box>
        {loading ? (
          <Loading />
        ) : (
          <ScrollerWithGradient>
            <Box padding={gutters(0.5)}>
              {renderActivities()}

              {!hasActivity && isAllSpacesSelected && (
                <CaptionSmall padding={gutters()}>
                  {t('pages.home.sections.myLatestContributions.noContributions')}
                </CaptionSmall>
              )}
            </Box>
          </ScrollerWithGradient>
        )}
      </Gutters>

      {typeof limit === 'number' && activities && activities?.length > limit && (
        <Caption sx={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setIsOpen(DashboardDialog.MyActivity)}>
          {t('common.show-more')}
        </Caption>
      )}
    </>
  );
};

export default MyLatestContributions;
