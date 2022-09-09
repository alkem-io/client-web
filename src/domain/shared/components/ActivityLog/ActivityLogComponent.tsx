import React, { ComponentType, FC, useMemo } from 'react';
import { Box } from '@mui/material';
import { ActivityEventType } from '../../../../models/graphql-schema';
import { ActivityLog } from './ActivityLog';
import { ActivityLogCalloutPublishedView, ActivityLogCanvasCreatedView, ActivityLogViewProps } from './views';
import { useActivityToViewModel } from './hooks';

export interface ActivityLogComponentProps {
  activityLog: ActivityLog[] | undefined;
}

export const ActivityLogComponent: FC<ActivityLogComponentProps> = ({ activityLog }) => {
  const { getActivityViewModel } = useActivityToViewModel(activityLog ?? []);

  activityLog = activityLog?.filter(x => x.type === ActivityEventType.CalloutPublished || x.type === ActivityEventType.CanvasCreated)

  const display = useMemo(() => (
    <>
      {activityLog?.map(
        activity => <ActivityViewChooser
          key={activity.id}
          type={activity.type}
          { ...getActivityViewModel(activity) }
        />
      )}
    </>
  ),
  [activityLog]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme => theme.spacing(2) }}>
      {display ?? <LoadingView />}
    </Box>
  );
};

const LoadingView = () => {
  return ( // todo put loading comp here
    <>
      {'loading item'}
      {'loading item'}
      {'loading item'}
    </>
  );
};

interface ActivityViewChooserProps extends ActivityLogViewProps {
  type: ActivityEventType,
}

const ActivityViewChooser = ({ type, ...rest } : ActivityViewChooserProps ): React.ReactElement<ActivityLogViewProps> | null => {
  const lookup: Record<ActivityEventType, ComponentType<ActivityLogViewProps> | null> = {
    [ActivityEventType.CalloutPublished]: ActivityLogCalloutPublishedView,
    [ActivityEventType.CanvasCreated]: ActivityLogCanvasCreatedView,
    // todo impl others
    [ActivityEventType.CardComment]: null,
    [ActivityEventType.CardCreated]: null,
    [ActivityEventType.DiscussionComment]: null,
    [ActivityEventType.MemberJoined]: null,
  };

  const ActivityView = lookup[type];
  // todo uncomment
  // if (!ActivityView) {
  //   throw new Error(`Unable to choose view for activity type: ${type}`);
  // }

  if (!ActivityView) {
    return null;
  }

  return <ActivityView { ...rest } />
};
