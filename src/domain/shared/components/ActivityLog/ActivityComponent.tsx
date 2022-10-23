import React, { FC, useMemo } from 'react';
import { Box, styled } from '@mui/material';
import {
  ActivityEventType,
  ActivityLogCalloutCanvasCreatedFragment,
  ActivityLogCalloutCardCommentFragment,
  ActivityLogCalloutCardCreatedFragment,
  ActivityLogCalloutDiscussionCommentFragment,
  ActivityLogCalloutPublishedFragment,
  ActivityLogChallengeCreatedFragment,
  ActivityLogEntry,
  ActivityLogMemberJoinedFragment,
  ActivityLogOpportunityCreatedFragment,
} from '../../../../models/graphql-schema';
import { LATEST_ACTIVITIES_COUNT } from '../../../../models/constants';
import {
  ActivityCardCommentCreatedView,
  ActivityCalloutPublishedView,
  ActivityCanvasCreatedView,
  ActivityCardCreatedView,
  ActivityDiscussionCommentCreatedView,
  ActivityLoadingView,
  ActivityMemberJoinedView,
  ActivityChallengeCreatedView,
  ActivityOpportunityCreatedView,
  ActivityViewProps,
} from './views';
import { Author } from '../AuthorAvatar/models/author';
import { buildUserProfileUrl, JourneyLocation } from '../../../../common/utils/urlBuilders';

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  '& a': {
    textDecoration: 'none',
    color: 'inherit',
  },
  '& a:hover': {
    textDecoration: 'underline',
  },
}));

export type ActivityLogResult<T> = T & ActivityLogEntry;

export type ActivityLogResultType = ActivityLogResult<
  | ActivityLogMemberJoinedFragment
  | ActivityLogCalloutCanvasCreatedFragment
  | ActivityLogCalloutCardCreatedFragment
  | ActivityLogCalloutCardCommentFragment
  | ActivityLogCalloutDiscussionCommentFragment
  | ActivityLogCalloutPublishedFragment
  | ActivityLogChallengeCreatedFragment
  | ActivityLogOpportunityCreatedFragment
>;

export interface ActivityLogComponentProps {
  activities: ActivityLogResultType[] | undefined;
  journeyLocation: JourneyLocation;
}

export const ActivityComponent: FC<ActivityLogComponentProps> = ({ activities = [], journeyLocation }) => {
  const display = useMemo(() => {
    return (
      <>
        {activities.map(activity => (
          <ActivityViewChooser activity={activity} journeyLocation={journeyLocation} />
        ))}
      </>
    );
  }, [activities, journeyLocation]);

  return <Root>{display ?? <ActivityLoadingView rows={LATEST_ACTIVITIES_COUNT} />}</Root>;
};

interface ActivityViewChooserProps {
  activity: ActivityLogResultType;
  journeyLocation: JourneyLocation;
}

const ActivityViewChooser = ({
  activity,
  ...rest
}: ActivityViewChooserProps): React.ReactElement<ActivityViewProps> => {
  const author = buildAuthorFromUser(activity.triggeredBy);
  switch (activity.type) {
    case ActivityEventType.CalloutPublished:
      const activityCalloutPublished = activity as ActivityLogResult<ActivityLogCalloutPublishedFragment>;
      return (
        <ActivityCalloutPublishedView
          callout={activityCalloutPublished.callout}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.CanvasCreated:
      const activityCalloutCanvasCreated = activity as ActivityLogResult<ActivityLogCalloutCanvasCreatedFragment>;
      return (
        <ActivityCanvasCreatedView
          callout={activityCalloutCanvasCreated.callout}
          canvas={activityCalloutCanvasCreated.canvas}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.CardComment:
      const activityCalloutCardComment = activity as ActivityLogResult<ActivityLogCalloutCardCommentFragment>;
      return (
        <ActivityCardCommentCreatedView
          callout={activityCalloutCardComment.callout}
          card={activityCalloutCardComment.card}
          author={author}
          {...activity}
          {...rest}
        />
      );
    case ActivityEventType.CardCreated:
      const activityCalloutCardCreated = activity as ActivityLogResult<ActivityLogCalloutCardCreatedFragment>;
      return (
        <ActivityCardCreatedView
          callout={activityCalloutCardCreated.callout}
          card={activityCalloutCardCreated.card}
          author={author}
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
          user2={userAuthor}
          community={activityMemberJoined.community}
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
  }
  throw new Error(`Unable to choose a view for activity type: ${activity.type}`);
};

const buildAuthorFromUser = (user: any): Author => {
  const avatarURL = user.profile.avatar.uri;
  const url = buildUserProfileUrl(user.nameID);
  const tags: string[] = [];
  for (const tagset of user.profile.tagsets) {
    tags.push(tagset.tags);
  }
  const result: Author = {
    id: user.id,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: avatarURL,
    url: url,
    tags: tags,
    city: user.profile.location.city,
    country: user.profile.location.country,
  };
  return result;
};
