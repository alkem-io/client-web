import React, { FC, useMemo } from 'react';
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
import { buildJourneyUrl, getJourneyLocationKey, JourneyLocation } from '../../../../main/routing/urlBuilders';
import { buildAuthorFromUser } from '../../../community/user/utils/buildAuthorFromUser';
import { ActivityUpdateSentView } from './views/ActivityUpdateSent';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { ActivityCalendarEventCreatedView } from './views/ActivityCalendarEventCreatedView';
import ActivityViewFooter from './views/ActivityViewFooter';

export type ActivityLogResult<T> = T &
  Omit<ActivityLogEntry, 'parentDisplayName'> & {
    journeyDisplayName: string;
  };

type TypedActivityLogResults = {
  [ActivityEventType.CalloutPublished]: ActivityLogCalloutPublishedFragment;
  [ActivityEventType.CalloutWhiteboardCreated]: ActivityLogCalloutWhiteboardCreatedFragment;
  [ActivityEventType.CalloutPostCreated]: ActivityLogCalloutPostCreatedFragment;
  [ActivityEventType.CalloutLinkCreated]: ActivityLogCalloutLinkCreatedFragment;
  [ActivityEventType.CalloutPostComment]: ActivityLogCalloutPostCommentFragment;
  [ActivityEventType.DiscussionComment]: ActivityLogCalloutDiscussionCommentFragment;
  [ActivityEventType.MemberJoined]: ActivityLogMemberJoinedFragment;
  [ActivityEventType.ChallengeCreated]: ActivityLogChallengeCreatedFragment;
  [ActivityEventType.OpportunityCreated]: ActivityLogOpportunityCreatedFragment;
  [ActivityEventType.UpdateSent]: ActivityLogUpdateSentFragment;
  [ActivityEventType.CalendarEventCreated]: ActivityLogCalendarEventCreatedFragment;
};

type TypedActivityLogResultWithType = {
  [Type in keyof TypedActivityLogResults]: ActivityLogResult<TypedActivityLogResults[Type]> & { type: Type };
};

export type ActivityLogResultType = TypedActivityLogResultWithType[keyof TypedActivityLogResultWithType];

export interface ActivityComponentProps {
  activities: ActivityLogResultType[] | undefined;
  journeyLocation: JourneyLocation | undefined;
  limit?: number;
  footerComponent?: ActivityViewProps['footerComponent'];
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

export const ActivityComponent: FC<ActivityComponentProps> = ({
  activities,
  journeyLocation,
  limit,
  footerComponent = ActivityViewFooter,
}) => {
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
          const activityOriginJourneyUrl = buildJourneyUrl(activityOriginJourneyLocation);

          return (
            <ActivityViewChooser
              activity={activity}
              journeyUrl={activityOriginJourneyUrl}
              key={activity.id}
              footerComponent={footerComponent}
            />
          );
        })}
      </>
    );
  }, [activities, journeyLocation]);

  return <>{display ?? <ActivityLoadingView rows={3} />}</>;
};

interface ActivityViewChooserProps extends Pick<ActivityViewProps, 'journeyUrl' | 'footerComponent'> {
  activity: ActivityLogResultType;
}

export const ActivityViewChooser = ({ activity, ...rest }: ActivityViewChooserProps) => {
  const author = buildAuthorFromUser(activity.triggeredBy);
  switch (activity.type) {
    case ActivityEventType.CalloutPublished:
      return <ActivityCalloutPublishedView author={author} {...activity} {...rest} />;
    case ActivityEventType.CalloutWhiteboardCreated:
      return <ActivityCalloutWhiteboardCreatedView author={author} {...activity} {...rest} />;
    case ActivityEventType.CalloutPostComment:
      return <ActivityCalloutPostCommentCreatedView author={author} {...activity} {...rest} />;
    case ActivityEventType.CalloutPostCreated:
      return <ActivityCalloutPostCreatedView author={author} {...activity} {...rest} />;
    case ActivityEventType.CalloutLinkCreated:
      return <ActivityCalloutLinkCreatedView author={author} {...activity} {...rest} />;
    case ActivityEventType.DiscussionComment:
      return <ActivityDiscussionCommentCreatedView author={author} {...activity} {...rest} />;
    case ActivityEventType.MemberJoined:
      const userAuthor = buildAuthorFromUser(activity.user);
      return <ActivityMemberJoinedView member={userAuthor} author={author} {...activity} {...rest} />;
    case ActivityEventType.ChallengeCreated:
      return <ActivityChallengeCreatedView author={author} {...activity} {...rest} />;
    case ActivityEventType.OpportunityCreated:
      return <ActivityOpportunityCreatedView author={author} {...activity} {...rest} />;
    case ActivityEventType.CalendarEventCreated:
      return <ActivityCalendarEventCreatedView author={author} {...activity} {...rest} />;
    case ActivityEventType.UpdateSent:
      return <ActivityUpdateSentView author={author} {...activity} {...rest} />;
  }
  throw new Error(`Unable to choose a view for activity type: ${activity['type']}`);
};
