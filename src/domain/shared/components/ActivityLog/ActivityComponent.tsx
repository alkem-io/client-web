import React, { FC, ReactNode, useMemo } from 'react';
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
  ActivityLogUpdateSentFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { LATEST_ACTIVITIES_COUNT } from './constants';
import {
  ActivityCalloutPublishedView,
  ActivityCanvasCreatedView,
  ActivityCardCommentCreatedView,
  ActivityCardCreatedView,
  ActivityChallengeCreatedView,
  ActivityDiscussionCommentCreatedView,
  ActivityLoadingView,
  ActivityMemberJoinedView,
  ActivityOpportunityCreatedView,
  ActivityViewProps,
} from './views';
import { getJourneyLocationKey, JourneyLocation } from '../../../../common/utils/urlBuilders';
import { buildAuthorFromUser } from '../../../../common/utils/buildAuthorFromUser';
import { ActivityUpdateSentView } from './views/ActivityUpdateSent';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';

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
  | ActivityLogUpdateSentFragment
>;

export interface ActivityLogComponentProps {
  activities: ActivityLogResultType[] | undefined;
  journeyLocation: JourneyLocation | undefined;
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

export const ActivityComponent: FC<ActivityLogComponentProps> = ({ activities, journeyLocation }) => {
  const display = useMemo(() => {
    if (!activities || !journeyLocation) {
      return null;
    }

    return (
      <>
        {activities.map(activity => {
          const activityOriginJourneyTypeName = getActivityOriginJourneyTypeName(activity, journeyLocation);
          const ActivityOriginJourneyIcon =
            activityOriginJourneyTypeName && journeyLocation[activityOriginJourneyTypeName];
          const activityOriginJourneyLocation = activityOriginJourneyTypeName
            ? {
                ...journeyLocation,
                [getJourneyLocationKey(activityOriginJourneyTypeName)]: activity.parentNameID,
              }
            : journeyLocation;

          return (
            <ActivityViewChooser
              activity={activity}
              journeyLocation={activityOriginJourneyLocation}
              key={activity.id}
              activityOriginJourneyIcon={
                ActivityOriginJourneyIcon && (
                  <ActivityOriginJourneyIcon sx={{ verticalAlign: 'bottom' }} fontSize="small" />
                )
              }
            />
          );
        })}
      </>
    );
  }, [activities, journeyLocation]);

  return <Root>{display ?? <ActivityLoadingView rows={LATEST_ACTIVITIES_COUNT} />}</Root>;
};

interface ActivityViewChooserProps {
  activity: ActivityLogResultType;
  journeyLocation: JourneyLocation;
  activityOriginJourneyIcon?: ReactNode;
}

const ActivityViewChooser = ({
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
          cardType={activityCalloutCardCreated.card.type}
          cardDescription={activityCalloutCardCreated.card.profile.description!}
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
          community={activityMemberJoined.community}
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
    case ActivityEventType.UpdateSent:
      const activityUpdateSent = activity as ActivityLogResult<ActivityLogUpdateSentFragment>;
      return (
        <ActivityUpdateSentView
          updates={activityUpdateSent.updates}
          message={activityUpdateSent.message}
          author={author}
          {...activity}
          {...rest}
        />
      );
  }
  throw new Error(`Unable to choose a view for activity type: ${activity.type}`);
};
