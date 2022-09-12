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
  activity: Activity[] | undefined;
}

export const ActivityLogComponent: FC<ActivityLogComponentProps> = ({ activity }) => {
  const { getActivityViewModel } = useActivityToViewModel(activity ?? []);

  const display = useMemo(() => {
    if (!activity) {
      return null;
    }

    return (
      <>
        {activity.map(activity => (
          <ActivityViewChooser key={activity.id} type={activity.type} {...getActivityViewModel(activity)} />
        ))}
      </>
    );
  }, [activity]);

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
    [ActivityEventType.CanvasCreated]: ActivityLogCanvasCreatedView,
    [ActivityEventType.CardComment]: ActivityCardCommentCreatedView,
    [ActivityEventType.CardCreated]: ActivityLogCardCreatedView,
    [ActivityEventType.DiscussionComment]: ActivityLogDiscussionCommentCreatedView,
    [ActivityEventType.MemberJoined]: ActivityLogMemberJoinedView,
  };

  const ActivityView = lookup[type];

  if (!ActivityView) {
    throw new Error(`Unable to choose a view for activity type: ${type}`);
  }

  return <ActivityView {...rest} />;
};
