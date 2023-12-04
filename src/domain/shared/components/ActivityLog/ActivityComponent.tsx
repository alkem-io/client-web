import React, { FC, useMemo } from 'react';
import { SxProps } from '@mui/material';
import {
  ActivityEventType,
  ActivityLogCalendarEventCreatedFragment,
  ActivityLogCalloutDiscussionCommentFragment,
  ActivityLogCalloutLinkCreatedFragment,
  ActivityLogCalloutPostCommentFragment,
  ActivityLogCalloutPostCreatedFragment,
  ActivityLogCalloutPublishedFragment,
  ActivityLogCalloutWhiteboardCreatedFragment,
  ActivityLogChallengeCreatedFragment,
  ActivityLogEntry,
  ActivityLogMemberJoinedFragment,
  ActivityLogOpportunityCreatedFragment,
  ActivityLogUpdateSentFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import {
  ActivityCalloutLinkCreatedView,
  ActivityCalloutPostCommentCreatedView,
  ActivityCalloutPostCreatedView,
  ActivityCalloutPublishedView,
  ActivityCalloutWhiteboardCreatedView,
  ActivityChallengeCreatedView,
  ActivityDiscussionCommentCreatedView,
  ActivityLoadingView,
  ActivityMemberJoinedView,
  ActivityOpportunityCreatedView,
  ActivityViewProps,
} from './views';
import { getJourneyLocationKey, JourneyLocation } from '../../../../main/routing/urlBuilders';
import { buildAuthorFromUser } from '../../../community/user/utils/buildAuthorFromUser';
import { ActivityUpdateSentView } from './views/ActivityUpdateSent';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { ActivityCalendarEventCreatedView } from './views/ActivityCalendarEventCreatedView';
import { Theme } from '@mui/material/styles';
import Gutters from '../../../../core/ui/grid/Gutters';

const styles = {
  '& a': {
    textDecoration: 'none',
    color: 'inherit',
  },
  '& a:hover': {
    textDecoration: 'underline',
  },
};

export type ActivityLogResult<T> = T & Omit<ActivityLogEntry, 'parentDisplayName'> & { journeyDisplayName: string };

export type ActivityLogResultType = ActivityLogResult<
  | ActivityLogMemberJoinedFragment
  | ActivityLogCalloutWhiteboardCreatedFragment
  | ActivityLogCalloutPostCreatedFragment
  | ActivityLogCalloutLinkCreatedFragment
  | ActivityLogCalloutPostCommentFragment
  | ActivityLogCalloutDiscussionCommentFragment
  | ActivityLogCalloutPublishedFragment
  | ActivityLogChallengeCreatedFragment
  | ActivityLogOpportunityCreatedFragment
  | ActivityLogUpdateSentFragment
  | ActivityLogCalendarEventCreatedFragment
>;

export interface ActivityLogComponentProps {
  activities: ActivityLogResultType[] | undefined;
  journeyLocation: JourneyLocation | undefined;
  limit?: number;
  sx?: SxProps<Theme>;
}

const getActivityOriginJourneyTypeName = (
  activity: ActivityLogResultType,
  journeyLocation: JourneyLocation
): JourneyTypeName | undefined => {
  if (!activity.child) {
    return undefined;
  }
  if (journeyLocation.challengeNameId) {
    return 'opportunity';
  }
  return 'challenge';
};

export const ActivityComponent: FC<ActivityLogComponentProps> = ({ activities, journeyLocation, limit, sx }) => {
  const display = useMemo(() => {
    if (!activities || !journeyLocation) {
      return null;
    }

    return (
      <>
        {activities.slice(0, limit).map(activity => {
          const activityOriginJourneyTypeName = getActivityOriginJourneyTypeName(activity, journeyLocation);
          const activityOriginJourneyLocation = activityOriginJourneyTypeName
            ? {
                ...journeyLocation,
                [getJourneyLocationKey(activityOriginJourneyTypeName)]: activity.parentNameID,
              }
            : journeyLocation;

          return (
            <ActivityViewChooser
              activity={activity}
              journeyTypeName={activityOriginJourneyTypeName}
              journeyLocation={activityOriginJourneyLocation}
              key={activity.id}
            />
          );
        })}
      </>
    );
  }, [activities, journeyLocation]);

  return (
    <Gutters disablePadding sx={{ ...styles, ...sx }}>
      {display ?? <ActivityLoadingView rows={3} />}
    </Gutters>
  );
};

interface ActivityViewChooserProps extends Pick<ActivityViewProps, 'journeyTypeName' | 'journeyLocation'> {
  activity: ActivityLogResultType;
}

export const ActivityViewChooser = ({
  activity,
  ...rest
}: ActivityViewChooserProps): React.ReactElement<ActivityViewProps> => {
  const author = buildAuthorFromUser(activity.triggeredBy);
  switch (activity.type) {
    case ActivityEventType.CalloutPublished:
      const activityCalloutPublished = activity as ActivityLogResult<ActivityLogCalloutPublishedFragment>;
      const calloutType = `${activityCalloutPublished.callout.type}`.toLowerCase();
      return (
        <ActivityCalloutPublishedView
          callout={activityCalloutPublished.callout}
          author={author}
          calloutType={calloutType}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.CalloutWhiteboardCreated:
      const activityCalloutWhiteboardCreated =
        activity as ActivityLogResult<ActivityLogCalloutWhiteboardCreatedFragment>;
      return (
        <ActivityCalloutWhiteboardCreatedView
          callout={activityCalloutWhiteboardCreated.callout}
          whiteboard={activityCalloutWhiteboardCreated.whiteboard}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.CalloutPostComment:
      const activityCalloutCardComment = activity as ActivityLogResult<ActivityLogCalloutPostCommentFragment>;
      return (
        <ActivityCalloutPostCommentCreatedView
          callout={activityCalloutCardComment.callout}
          card={activityCalloutCardComment.post}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.CalloutPostCreated:
      const activityCalloutPostCreated = activity as ActivityLogResult<ActivityLogCalloutPostCreatedFragment>;
      return (
        <ActivityCalloutPostCreatedView
          callout={activityCalloutPostCreated.callout}
          post={activityCalloutPostCreated.post}
          author={author}
          postType={activityCalloutPostCreated.post.type}
          postDescription={activityCalloutPostCreated.post.profile.description!}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.CalloutLinkCreated:
      const activityCalloutLinkCreated = activity as ActivityLogResult<ActivityLogCalloutLinkCreatedFragment>;
      return (
        <ActivityCalloutLinkCreatedView
          callout={activityCalloutLinkCreated.callout}
          author={author}
          linkName={activityCalloutLinkCreated.reference.name}
          linkDescription={activityCalloutLinkCreated.reference.description!}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.DiscussionComment:
      const activityCalloutDiscussionComment =
        activity as ActivityLogResult<ActivityLogCalloutDiscussionCommentFragment>;
      return (
        <ActivityDiscussionCommentCreatedView
          callout={activityCalloutDiscussionComment.callout}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.MemberJoined:
      const activityMemberJoined = activity as ActivityLogResult<ActivityLogMemberJoinedFragment>;
      const userAuthor = buildAuthorFromUser(activityMemberJoined.user);
      return (
        <ActivityMemberJoinedView
          member={userAuthor}
          communityType={activityMemberJoined.communityType}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.ChallengeCreated:
      const activityChallengeCreated = activity as ActivityLogResult<ActivityLogChallengeCreatedFragment>;
      return (
        <ActivityChallengeCreatedView
          challenge={activityChallengeCreated.challenge}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.OpportunityCreated:
      const activityOpportunityCreated = activity as ActivityLogResult<ActivityLogOpportunityCreatedFragment>;
      return (
        <ActivityOpportunityCreatedView
          opportunity={activityOpportunityCreated.opportunity}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.CalendarEventCreated:
      const activityCalendarEventCreated = activity as ActivityLogResult<ActivityLogCalendarEventCreatedFragment>;
      return (
        <ActivityCalendarEventCreatedView
          calendarEvent={activityCalendarEventCreated.calendarEvent}
          calendarEventDescription={activityCalendarEventCreated.calendarEvent.profile.description || ''}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.UpdateSent:
      const activityUpdateSent = activity as ActivityLogResult<ActivityLogUpdateSentFragment>;
      return <ActivityUpdateSentView message={activityUpdateSent.message} author={author} {...activity} {...rest} />;
  }
  throw new Error(`Unable to choose a view for activity type: ${activity.type}`);
};
