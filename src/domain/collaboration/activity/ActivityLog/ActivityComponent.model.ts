import {
  ActivityEventType,
  type ActivityLogCalendarEventCreatedFragment,
  type ActivityLogCalloutDiscussionCommentFragment,
  type ActivityLogCalloutLinkCreatedFragment,
  type ActivityLogCalloutMemoCreatedFragment,
  type ActivityLogCalloutPostCommentFragment,
  type ActivityLogCalloutPostCreatedFragment,
  type ActivityLogCalloutPublishedFragment,
  type ActivityLogCalloutWhiteboardContentModifiedFragment,
  type ActivityLogCalloutWhiteboardCreatedFragment,
  type ActivityLogEntry,
  type ActivityLogMemberJoinedFragment,
  type ActivityLogSubspaceCreatedFragment,
  type ActivityLogUpdateSentFragment,
} from '@/core/apollo/generated/graphql-schema';

export type ActivityLogResult<T> = T &
  Omit<ActivityLogEntry, 'parentDisplayName'> & {
    spaceDisplayName: string;
    triggeredBy: {
      profile?: {
        avatar: {
          uri: string;
        };
      };
    };
  };

type TypedActivityLogResults = {
  [ActivityEventType.CalloutPublished]: ActivityLogCalloutPublishedFragment;
  [ActivityEventType.CalloutWhiteboardCreated]: ActivityLogCalloutWhiteboardCreatedFragment;
  [ActivityEventType.CalloutWhiteboardContentModified]: ActivityLogCalloutWhiteboardContentModifiedFragment;
  [ActivityEventType.CalloutMemoCreated]: ActivityLogCalloutMemoCreatedFragment;
  [ActivityEventType.CalloutPostCreated]: ActivityLogCalloutPostCreatedFragment;
  [ActivityEventType.CalloutLinkCreated]: ActivityLogCalloutLinkCreatedFragment;
  [ActivityEventType.CalloutPostComment]: ActivityLogCalloutPostCommentFragment;
  [ActivityEventType.DiscussionComment]: ActivityLogCalloutDiscussionCommentFragment;
  [ActivityEventType.MemberJoined]: ActivityLogMemberJoinedFragment;
  [ActivityEventType.SubspaceCreated]: ActivityLogSubspaceCreatedFragment;
  [ActivityEventType.UpdateSent]: ActivityLogUpdateSentFragment;
  [ActivityEventType.CalendarEventCreated]: ActivityLogCalendarEventCreatedFragment;
};

type TypedActivityLogResultWithType = {
  [Type in keyof TypedActivityLogResults]: ActivityLogResult<TypedActivityLogResults[Type]> & { type: Type };
};

export type ActivityLogResultType = TypedActivityLogResultWithType[keyof TypedActivityLogResultWithType];
