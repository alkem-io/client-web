import { useMemo } from 'react';
import { ActivityLogResultType } from '../ActivityComponent';
import { useActivityLogOnCollaborationQuery } from '../../../../../hooks/generated/graphql';
import { LATEST_ACTIVITIES_COUNT } from '../../../../../models/constants/common.constants';

interface ActivityOnCollaborationReturnType {
  activities: ActivityLogResultType[] | undefined;
  loading: boolean;
}

export const useActivityOnCollaboration = (collaborationID: string): ActivityOnCollaborationReturnType => {
  const { data: activityLogData } = useActivityLogOnCollaborationQuery({
    variables: { queryData: { collaborationID: collaborationID! } },
    skip: !collaborationID,
  });
  const activities = useMemo<ActivityLogResultType[] | undefined>(() => {
    if (!activityLogData) {
      return undefined;
    }

    const activityLogResult: ActivityLogResultType[] =
      activityLogData.activityLogOnCollaboration as ActivityLogResultType[];

    const result = activityLogResult
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, LATEST_ACTIVITIES_COUNT);
    return result;
  }, [activityLogData]);
  return {
    activities: activities || [],
    loading: false,
  };
};
