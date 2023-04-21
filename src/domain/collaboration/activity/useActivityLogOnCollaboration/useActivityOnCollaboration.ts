import { useMemo } from 'react';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog/ActivityComponent';
import {
  ActivityCreatedDocument,
  useActivityLogOnCollaborationQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { LATEST_ACTIVITIES_COUNT } from '../../../shared/components/ActivityLog/constants';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import {
  ActivityCreatedSubscription,
  ActivityCreatedSubscriptionVariables,
  ActivityEventType,
  ActivityLogOnCollaborationFragment,
} from '../../../../core/apollo/generated/graphql-schema';

const useActivityOnCollaborationSubscription = (collaborationID: string, types?: ActivityEventType[]) =>
  createUseSubscriptionToSubEntityHook<
    Array<ActivityLogOnCollaborationFragment>,
    ActivityCreatedSubscription,
    ActivityCreatedSubscriptionVariables
  >({
    subscriptionDocument: ActivityCreatedDocument,
    getSubscriptionVariables: () => ({ input: { collaborationID, types } }),
    updateSubEntity: (subEntity, { activityCreated }) => {
      if (!subEntity) {
        return;
      }

      subEntity.unshift(activityCreated.activity);
      subEntity.splice(LATEST_ACTIVITIES_COUNT, 1);
    },
  });

interface ActivityOnCollaborationReturnType {
  activities: ActivityLogResultType[] | undefined;
  loading: boolean;
}

const useActivityOnCollaboration = (
  collaborationID: string | undefined,
  options: { types?: ActivityEventType[]; skipCondition?: boolean }
): ActivityOnCollaborationReturnType => {
  const { types, skipCondition } = options;
  const {
    data: activityLogData,
    loading,
    subscribeToMore,
  } = useActivityLogOnCollaborationQuery({
    variables: { queryData: { collaborationID: collaborationID!, limit: LATEST_ACTIVITIES_COUNT, types } },
    skip: !collaborationID || skipCondition,
    fetchPolicy: 'cache-and-network',
  });

  useActivityOnCollaborationSubscription(collaborationID!, types)(
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

export default useActivityOnCollaboration;
