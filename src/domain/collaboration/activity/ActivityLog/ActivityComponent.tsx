import React, { FC, useMemo } from 'react';
import {
  ActivityEventType,
  ActivityLogCalendarEventCreatedFragment,
  ActivityLogCalloutDiscussionCommentFragment,
  ActivityLogCalloutLinkCreatedFragment,
  ActivityLogCalloutPostCommentFragment,
  ActivityLogCalloutPostCreatedFragment,
  ActivityLogCalloutPublishedFragment,
  ActivityLogCalloutWhiteboardContentModifiedFragment,
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
  ActivityCalloutWhiteboardActivityView,
  ActivityChallengeCreatedView,
  ActivityDiscussionCommentCreatedView,
  ActivityLoadingView,
  ActivityMemberJoinedView,
  ActivityOpportunityCreatedView,
  ActivityViewProps,
} from './views';
import { buildAuthorFromUser } from '../../../community/user/utils/buildAuthorFromUser';
import { ActivityUpdateSentView } from './views/ActivityUpdateSent';
import { ActivityCalendarEventCreatedView } from './views/ActivityCalendarEventCreatedView';

export type ActivityLogResult<T> = T &
  Omit<ActivityLogEntry, 'parentDisplayName'> & {
    journeyDisplayName: string;
  };

type TypedActivityLogResults = {
  [ActivityEventType.CalloutPublished]: ActivityLogCalloutPublishedFragment;
  [ActivityEventType.CalloutWhiteboardCreated]: ActivityLogCalloutWhiteboardCreatedFragment;
  [ActivityEventType.CalloutWhiteboardContentModified]: ActivityLogCalloutWhiteboardContentModifiedFragment;
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
  limit?: number;
}

export const ActivityComponent: FC<ActivityComponentProps> = ({ activities, limit }) => {
  const display = useMemo(() => {
    if (!activities) {
      return null;
    }

    return (
      <>
        {activities.slice(0, limit).map(activity => {
          return (
            <ActivityViewChooser activity={activity} avatarUrl={activity.triggeredBy.profile.url} key={activity.id} />
          );
        })}
      </>
    );
  }, [activities]);

  return <>{display ?? <ActivityLoadingView rows={3} />}</>;
};

interface ActivityViewChooserProps extends Pick<ActivityViewProps, 'avatarUrl'> {
  activity: ActivityLogResultType;
}

export const ActivityViewChooser = ({ activity, ...rest }: ActivityViewChooserProps) => {
  switch (activity.type) {
    case ActivityEventType.CalloutPublished:
      return <ActivityCalloutPublishedView {...activity} {...rest} />;
    case ActivityEventType.CalloutWhiteboardCreated:
    case ActivityEventType.CalloutWhiteboardContentModified:
      // we use the same view for whiteboard created and whiteboard content modified events
      return <ActivityCalloutWhiteboardActivityView {...activity} {...rest} />;
    case ActivityEventType.CalloutPostComment:
      return <ActivityCalloutPostCommentCreatedView {...activity} {...rest} />;
    case ActivityEventType.CalloutPostCreated:
      return <ActivityCalloutPostCreatedView {...activity} {...rest} />;
    case ActivityEventType.CalloutLinkCreated:
      return <ActivityCalloutLinkCreatedView {...activity} {...rest} />;
    case ActivityEventType.DiscussionComment:
      return <ActivityDiscussionCommentCreatedView {...activity} {...rest} />;
    case ActivityEventType.MemberJoined:
      const userAuthor = buildAuthorFromUser(activity.user);
      return <ActivityMemberJoinedView member={userAuthor} {...activity} {...rest} />;
    case ActivityEventType.ChallengeCreated:
      return <ActivityChallengeCreatedView {...activity} {...rest} />;
    case ActivityEventType.OpportunityCreated:
      return <ActivityOpportunityCreatedView {...activity} {...rest} />;
    case ActivityEventType.CalendarEventCreated:
      return <ActivityCalendarEventCreatedView {...activity} {...rest} />;
    case ActivityEventType.UpdateSent:
      return <ActivityUpdateSentView {...activity} {...rest} journeyUrl="" />; // TODO provide journeyUrl  https://app.zenhub.com/workspaces/alkemio-development-5ecb98b262ebd9f4aec4194c/issues/gh/alkem-io/server/3741
  }
  throw new Error(`Unable to choose a view for activity type: ${activity['type']}`);
};
