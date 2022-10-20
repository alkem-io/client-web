import React, { ComponentType, FC, useMemo } from 'react';
import { Box, styled } from '@mui/material';
import { Activity, ActivityEventType } from '../../../../models/graphql-schema';
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
import { useActivityToViewModel } from './hooks';

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

export interface ActivityLogComponentProps {
  activities: Activity[] | undefined;
}

export const ActivityComponent: FC<ActivityLogComponentProps> = ({ activities = [] }) => {
  const { getActivityViewModel, loading } = useActivityToViewModel(activities);

  const display = useMemo(() => {
    if (!activities || loading) {
      return null;
    }

    return (
      <>
        {activities.map(activity => (
          <ActivityViewChooser key={activity.id} type={activity.type} {...getActivityViewModel(activity)} />
        ))}
      </>
    );
  }, [activities, getActivityViewModel, loading]);

  return <Root>{display ?? <ActivityLoadingView rows={LATEST_ACTIVITIES_COUNT} />}</Root>;
};

interface ActivityViewChooserProps extends ActivityViewProps {
  type: ActivityEventType;
}

const ActivityViewChooser = ({ type, ...rest }: ActivityViewChooserProps): React.ReactElement<ActivityViewProps> => {
  const lookup: Record<ActivityEventType, ComponentType<ActivityViewProps>> = {
    [ActivityEventType.CalloutPublished]: ActivityCalloutPublishedView,
    [ActivityEventType.CanvasCreated]: ActivityCanvasCreatedView,
    [ActivityEventType.CardComment]: ActivityCardCommentCreatedView,
    [ActivityEventType.CardCreated]: ActivityCardCreatedView,
    [ActivityEventType.DiscussionComment]: ActivityDiscussionCommentCreatedView,
    [ActivityEventType.MemberJoined]: ActivityMemberJoinedView,
    [ActivityEventType.ChallengeCreated]: ActivityChallengeCreatedView,
    [ActivityEventType.OpportunityCreated]: ActivityOpportunityCreatedView,
  };

  const ActivityView = lookup[type];

  if (ActivityView === undefined) {
    throw new Error(`Unable to choose a view for activity type: ${type}`);
  }

  return <ActivityView {...rest} />;
};
