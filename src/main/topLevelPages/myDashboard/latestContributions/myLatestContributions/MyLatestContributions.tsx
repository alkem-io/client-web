import { useMemo, useState } from 'react';
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
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useDashboardContext } from '../../DashboardContext';

const MY_LATEST_CONTRIBUTIONS_COUNT = 20;
const VISIBLE_LATEST_CONTRIBUTIONS_COUNT = 10;

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<{ space: string }>({ space: SPACE_OPTION_ALL });

  const { activityEnabled } = useDashboardContext();

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

  const renderFilters = () => (
    <Box display="flex" justifyContent="end" alignItems="center">
      <SeamlessSelect
        value={filter.space}
        options={spaceOptions}
        label={t('pages.home.sections.latestContributions.filter.space.label')}
        onChange={handleSpaceSelect}
      />
    </Box>
  );

  const hasActivity = activities && activities.length > 0;
  const isAllSpacesSelected = filter.space === SPACE_OPTION_ALL;

  const showMore = typeof data?.activityFeedGrouped?.length === 'number' && data?.activityFeedGrouped.length > 10;

  return (
    <>
      {activityEnabled ? (
        <Gutters disableGap disablePadding>
          {renderFilters()}

          <ScrollerWithGradient>
            <Gutters disableGap disablePadding padding={gutters(0.5)}>
              {activities?.slice(0, VISIBLE_LATEST_CONTRIBUTIONS_COUNT).map(activity => (
                <ActivityViewChooser
                  key={activity.id}
                  activity={activity as ActivityLogResultType}
                  avatarUrl={activity.space?.profile.avatar?.uri || defaultVisualUrls[VisualType.Avatar]}
                />
              ))}

              {!hasActivity && isAllSpacesSelected && (
                <CaptionSmall padding={gutters()}>
                  {t('pages.home.sections.myLatestContributions.noContributions')}
                </CaptionSmall>
              )}
            </Gutters>
          </ScrollerWithGradient>
        </Gutters>
      ) : (
        <Gutters disableGap disablePadding>
          {renderFilters()}

          {loading ? (
            <Loading />
          ) : (
            <ScrollerWithGradient>
              <Gutters disableGap disablePadding padding={gutters(0.5)}>
                {activities?.map(activity => (
                  <ActivityViewChooser
                    key={activity.id}
                    activity={activity as ActivityLogResultType}
                    avatarUrl={activity.space?.profile.avatar?.uri || defaultVisualUrls[VisualType.Avatar]}
                  />
                ))}

                {!hasActivity && isAllSpacesSelected && (
                  <CaptionSmall padding={gutters()}>
                    {t('pages.home.sections.myLatestContributions.noContributions')}
                  </CaptionSmall>
                )}
              </Gutters>
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
          title={t('pages.home.sections.myLatestContributions.title')}
          onClose={() => setIsDialogOpen(false)}
        />

        <Gutters disableGap disablePadding padding={gutters(1.5)}>
          {renderFilters()}

          {loading ? (
            <Loading />
          ) : (
            <ScrollerWithGradient>
              <Gutters disableGap disablePadding padding={gutters(0.5)}>
                {activities?.map(activity => (
                  <ActivityViewChooser
                    key={activity.id}
                    activity={activity as ActivityLogResultType}
                    avatarUrl={activity.space?.profile.avatar?.uri || defaultVisualUrls[VisualType.Avatar]}
                  />
                ))}

                {!hasActivity && isAllSpacesSelected && (
                  <CaptionSmall padding={gutters()}>
                    {t('pages.home.sections.myLatestContributions.noContributions')}
                  </CaptionSmall>
                )}
              </Gutters>
            </ScrollerWithGradient>
          )}
        </Gutters>
      </DialogWithGrid>
    </>
  );
};

export default MyLatestContributions;
