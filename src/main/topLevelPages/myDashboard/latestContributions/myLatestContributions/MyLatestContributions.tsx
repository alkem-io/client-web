import { useMemo } from 'react';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import ScrollerWithGradient from '../../../../../core/ui/overflow/ScrollerWithGradient';
import { useLatestContributionsGroupedQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import {
  ActivityEventType,
  ActivityLogCalloutWhiteboardContentModifiedFragment,
  ActivityLogCalloutWhiteboardCreatedFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import { Box } from '@mui/material';
import {
  ActivityLogResultType,
  ActivityViewChooser,
} from '../../../../../domain/collaboration/activity/ActivityLog/ActivityComponent';
import { CaptionSmall } from '../../../../../core/ui/typography/components';
import defaultJourneyAvatar from '../../../../../domain/journey/defaultVisuals/Avatar.jpg';

const MY_LATEST_CONTRIBUTIONS_COUNT = 4;

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

const MyLatestContributions = () => {
  const { t } = useTranslation();

  const { data } = useLatestContributionsGroupedQuery({
    variables: {
      filter: {
        myActivity: true,
        types: ACTIVITY_TYPES,
        limit: MY_LATEST_CONTRIBUTIONS_COUNT + 3, // Fetch 3 extra in case that last 8 events are whiteboard creation and modification
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

  return (
    <PageContentBlock columns={4}>
      <PageContentBlockHeader title={t('pages.home.sections.myLatestContributions.title')} />
      <ScrollerWithGradient>
        <Box padding={1}>
          {activities && activities.length > 0 ? (
            activities.map(activity => {
              return (
                <ActivityViewChooser
                  key={activity.id}
                  activity={activity as ActivityLogResultType}
                  avatarUrl={activity.space?.profile.avatar?.uri || defaultJourneyAvatar}
                />
              );
            })
          ) : (
            <CaptionSmall padding={1}>{t('pages.home.sections.myLatestContributions.noContributions')}</CaptionSmall>
          )}
        </Box>
      </ScrollerWithGradient>
    </PageContentBlock>
  );
};

export default MyLatestContributions;
