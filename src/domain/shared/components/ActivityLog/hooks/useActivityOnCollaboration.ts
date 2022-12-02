import { useMemo } from 'react';
import { ActivityLogResultType } from '../ActivityComponent';
import {
  ActivityCreatedDocument,
  useActivityLogOnCollaborationQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { LATEST_ACTIVITIES_COUNT } from '../constants';
import createUseSubscriptionToSubEntityHook from '../../../subscriptions/useSubscriptionToSubEntity';
import {
  ActivityCreatedSubscription,
  ActivityCreatedSubscriptionVariables,
  ActivityLogOnCollaborationFragment,
} from '../../../../../core/apollo/generated/graphql-schema';

const useActivityOnCollaborationSubscription = (collaborationID: string) =>
  createUseSubscriptionToSubEntityHook<
    Array<ActivityLogOnCollaborationFragment>,
    ActivityCreatedSubscription,
    ActivityCreatedSubscriptionVariables
  >({
    subscriptionDocument: ActivityCreatedDocument,
    getSubscriptionVariables: () => ({ collaborationID }),
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
  const {
    data: activityLogData,
    loading,
    subscribeToMore,
  } = useActivityLogOnCollaborationQuery({
    variables: { queryData: { collaborationID: collaborationID!, limit: LATEST_ACTIVITIES_COUNT } },
    skip: !collaborationID,
    fetchPolicy: 'cache-and-network',
  });

  useActivityOnCollaborationSubscription(collaborationID!)(
    activityLogData,
    data => data?.activityLogOnCollaboration,
    subscribeToMore,
    { skip: !collaborationID }
  );

  const activities = useMemo<ActivityLogResultType[] | undefined>(() => {
    if (!activityLogData) {
      return undefined;
    }

    return activityLogData.activityLogOnCollaboration as ActivityLogResultType[];
  }, [activityLogData]);
  return {
    activities,
    loading,
  };
};
