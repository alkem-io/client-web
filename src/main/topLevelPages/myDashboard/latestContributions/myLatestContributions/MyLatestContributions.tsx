import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ScrollerWithGradient from '@/core/ui/overflow/ScrollerWithGradient';
import { useLatestContributionsGroupedQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  ActivityEventType,
  ActivityLogCalloutWhiteboardContentModifiedFragment,
  ActivityLogCalloutWhiteboardCreatedFragment,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import { Box, SelectChangeEvent } from '@mui/material';
import {
  ActivityLogResultType,
  ActivityViewChooser,
} from '@/domain/collaboration/activity/ActivityLog/ActivityComponent';
import { Caption, CaptionSmall } from '@/core/ui/typography/components';
import { defaultVisualUrls } from '@/domain/journey/defaultVisuals/defaultVisualUrls';
import { LatestContributionsProps, SPACE_OPTION_ALL } from '../LatestContributionsProps';
import { SelectOption } from '@mui/base';
import SeamlessSelect from '@/core/ui/forms/select/SeamlessSelect';
import Loading from '@/core/ui/loading/Loading';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { useDashboardContext } from '../../DashboardContext';
import { DashboardDialog } from '../../DashboardDialogs/DashboardDialogsProps';

const MY_LATEST_CONTRIBUTIONS_COUNT = 10;

const ACTIVITY_TYPES = [
  // Callout-related activities only
  ActivityEventType.CalloutPublished,
  ActivityEventType.CalloutPostCreated,
  ActivityEventType.CalloutPostComment,
  ActivityEventType.CalloutLinkCreated,
  ActivityEventType.CalloutWhiteboardCreated,
  ActivityEventType.CalloutWhiteboardContentModified,
  ActivityEventType.DiscussionComment,
];

const MyLatestContributions = ({ spaceMemberships }: LatestContributionsProps) => {
  const { t } = useTranslation();

  const [filter, setFilter] = useState<{ space: string }>({ space: SPACE_OPTION_ALL });

  const { isOpen, setIsOpen } = useDashboardContext();

  const handleSpaceSelect = (event: SelectChangeEvent<unknown>) =>
    setFilter({ space: event.target.value as string | typeof SPACE_OPTION_ALL });

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

  const activities = useMemo(() => {
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
  }, [data?.activityFeedGrouped]);

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

  const renderActivities = useCallback(
    (limit?: number) => (
      <>
        {activities?.map((activity, idx) =>
          !limit || idx < limit ? (
            <ActivityViewChooser
              key={activity.id}
              activity={activity as ActivityLogResultType}
              avatarUrl={activity.space?.profile.avatar?.uri || defaultVisualUrls[VisualType.Avatar]}
            />
          ) : null
        )}
      </>
    ),
    [activities]
  );

  const handleOpenActivitiesDialog = useCallback(
    (dialogType: DashboardDialog) => () => setIsOpen(dialogType),
    [setIsOpen]
  );

  const hasActivity = activities && activities.length > 0;
  const isAllSpacesSelected = filter.space === SPACE_OPTION_ALL;

  const showMore = typeof data?.activityFeedGrouped?.length === 'number' && data?.activityFeedGrouped.length > 10;

  return (
    <>
      <Gutters disableGap disablePadding>
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
            <Gutters disableGap disablePadding padding={gutters(0.5)}>
              {hasActivity && renderActivities(isOpen ? undefined : MY_LATEST_CONTRIBUTIONS_COUNT)}

              {!hasActivity && isAllSpacesSelected && (
                <CaptionSmall padding={gutters()}>
                  {t('pages.home.sections.myLatestContributions.noContributions')}
                </CaptionSmall>
              )}
            </Gutters>
          </ScrollerWithGradient>
        )}
      </Gutters>

      {!isOpen && showMore && (
        <Caption
          sx={{ marginLeft: 'auto', cursor: 'pointer' }}
          onClick={handleOpenActivitiesDialog(DashboardDialog.MyActivity)}
        >
          {t('common.show-more')}
        </Caption>
      )}
    </>
  );
};

export default MyLatestContributions;
