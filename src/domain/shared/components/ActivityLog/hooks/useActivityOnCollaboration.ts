import { useEffect, useMemo } from 'react';
import { ActivityLogResultType } from '../ActivityComponent';
import { ActivityCreatedDocument, useActivityLogOnCollaborationQuery } from '../../../../../hooks/generated/graphql';
import { LATEST_ACTIVITIES_COUNT } from '../../../../../models/constants/common.constants';
import createUseSubscriptionToSubEntityHook from '../../../subscriptions/useSubscriptionToSubEntity';
import {
  ActivityCreatedSubscription,
  ActivityCreatedSubscriptionVariables,
  ActivityLogOnCollaborationFragment,
} from '../../../../../models/graphql-schema';

const useActivityOnCollaborationSubscription = createUseSubscriptionToSubEntityHook<
  Array<ActivityLogOnCollaborationFragment>,
  ActivityCreatedSubscription,
  ActivityCreatedSubscriptionVariables
>({
  subscriptionDocument: ActivityCreatedDocument,
  updateSubEntity: (subEntity, { activityCreated }) => {
    if (!subEntity) {
      return;
    }

    subEntity.push(activityCreated.activity);
  },
});

interface ActivityOnCollaborationReturnType {
  activities: ActivityLogResultType[] | undefined;
  loading: boolean;
}

export const useActivityOnCollaboration = (collaborationID: string | undefined): ActivityOnCollaborationReturnType => {
  const { data: activityLogData, loading, subscribeToMore } = useActivityLogOnCollaborationQuery({
    variables: { queryData: { collaborationID: collaborationID! } },
    skip: !collaborationID,
  });

  useActivityOnCollaborationSubscription(
    activityLogData,
    activityLogData => activityLogData?.activityLogOnCollaboration,
    subscribeToMore,
    {
      variables: { collaborationID: collaborationID! },
      skip: !collaborationID
    }
  );

  const activities = useMemo<ActivityLogResultType[] | undefined>(() => {
    if (!activityLogData) {
      return undefined;
    }

    const activityLogResult: ActivityLogResultType[] =
      activityLogData.activityLogOnCollaboration as ActivityLogResultType[];

    const resultSorted = activityLogResult.map(a => a).sort(sortFunction);
    return resultSorted.slice(0, LATEST_ACTIVITIES_COUNT);
  }, [activityLogData]);
  return {
    activities: activities || [],
    loading,
  };
};

const sortFunction = (a: ActivityLogResultType, b: ActivityLogResultType) =>
  new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
