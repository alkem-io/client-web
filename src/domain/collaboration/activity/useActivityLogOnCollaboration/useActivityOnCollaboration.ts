import { useMemo } from 'react';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog/ActivityComponent';
import {
  ActivityCreatedDocument,
  useActivityLogOnCollaborationQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import createUseSubscriptionToSubEntityHook from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';
import {
  ActivityCreatedSubscription,
  ActivityCreatedSubscriptionVariables,
  ActivityEventType,
  ActivityLogOnCollaborationFragment,
} from '../../../../core/apollo/generated/graphql-schema';

const useActivityOnCollaborationSubscription = (
  collaborationID: string,
  { includeChild, types }: { types?: ActivityEventType[]; includeChild?: boolean }
) =>
  createUseSubscriptionToSubEntityHook<
    Array<ActivityLogOnCollaborationFragment>,
    ActivityCreatedSubscription,
    ActivityCreatedSubscriptionVariables
  >({
    subscriptionDocument: ActivityCreatedDocument,
    getSubscriptionVariables: () => ({ input: { collaborationID, types, includeChild } }),
    updateSubEntity: (subEntity, { activityCreated }) => {
      if (!subEntity) {
        return;
      }

      subEntity.unshift(activityCreated.activity);
    },
  });

interface ActivityOnCollaborationReturnType {
  activities: ActivityLogResultType[] | undefined;
  loading: boolean;
}

interface UseActivityOnCollaborationOptions {
  types?: ActivityEventType[];
  includeChild?: boolean;
  limit: number;
  skip?: boolean;
}

const useActivityOnCollaboration = (
  collaborationID: string | undefined,
  options: UseActivityOnCollaborationOptions
): ActivityOnCollaborationReturnType => {
  const { types, skip, limit, includeChild = true } = options;

  const {
    data: activityLogData,
    loading,
    subscribeToMore,
  } = useActivityLogOnCollaborationQuery({
    variables: {
      queryData: {
        collaborationID: collaborationID!,
        limit,
        includeChild: true,
        types,
      },
    },
    skip: !collaborationID || skip,
    fetchPolicy: 'cache-and-network',
  });

  useActivityOnCollaborationSubscription(collaborationID!, { types, includeChild })(
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
