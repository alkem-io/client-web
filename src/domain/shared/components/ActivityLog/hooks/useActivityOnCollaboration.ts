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
  const activities: ActivityLogResultType[] | undefined = useMemo<ActivityLogResultType[] | undefined>(() => {
    if (!activityLogData) {
      return undefined;
    }

    return [...activityLogData.activityLogOnCollaboration]
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, LATEST_ACTIVITIES_COUNT);
  }, [activityLogData]);
  return {
    activities: activities || [],
    loading: false,
  };
};
