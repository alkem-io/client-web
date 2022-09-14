import React, { ComponentType, FC, useMemo } from 'react';
import { Box } from '@mui/material';
import { Activity, ActivityEventType } from '../../../../models/graphql-schema';
import { LATEST_ACTIVITIES_COUNT } from '../../../../models/constants';
import {
  ActivityCardCommentCreatedView,
  ActivityLogCalloutPublishedView,
  ActivityLogCanvasCreatedView,
  ActivityLogCardCreatedView,
  ActivityLogDiscussionCommentCreatedView,
  ActivityLogLoadingView,
  ActivityLogMemberJoinedView,
  ActivityLogViewProps,
} from './views';
import { useActivityToViewModel } from './hooks';

export interface ActivityLogComponentProps {
  activities: Activity[] | undefined;
}

export const ActivityLogComponent: FC<ActivityLogComponentProps> = ({ activities }) => {
  const { getActivityViewModel, loading } = useActivityToViewModel(activities ?? []);

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
  }, [activities, getActivityViewModel]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme => theme.spacing(2) }}>
      {display ?? <ActivityLogLoadingView rows={LATEST_ACTIVITIES_COUNT} />}
    </Box>
  );
};

interface ActivityViewChooserProps extends ActivityLogViewProps {
  type: ActivityEventType;
}

const ActivityViewChooser = ({ type, ...rest }: ActivityViewChooserProps): React.ReactElement<ActivityLogViewProps> => {
  const lookup: Record<ActivityEventType, ComponentType<ActivityLogViewProps> | null> = {
    [ActivityEventType.CalloutPublished]: ActivityLogCalloutPublishedView,
    [ActivityEventType.CalloutCanvasCreated]: ActivityLogCanvasCreatedView,
    [ActivityEventType.CardComment]: ActivityCardCommentCreatedView,
    [ActivityEventType.CalloutCardCreated]: ActivityLogCardCreatedView,
    [ActivityEventType.DiscussionComment]: ActivityLogDiscussionCommentCreatedView,
    [ActivityEventType.MemberJoined]: ActivityLogMemberJoinedView,
  };

  const ActivityView = lookup[type];

  if (!ActivityView) {
    throw new Error(`Unable to choose a view for activity type: ${type}`);
  }

  return <ActivityView {...rest} />;
};
