import { useMemo } from 'react';
import { ActivityLogResultType } from '../ActivityLog/ActivityComponent';
import { ActivityCreatedDocument, useActivityLogOnCollaborationQuery } from '@/core/apollo/generated/apollo-hooks';
import createUseSubscriptionToSubEntityHook from '@/core/apollo/subscriptions/useSubscriptionToSubEntity';
import {
  ActivityCreatedSubscription,
  ActivityCreatedSubscriptionVariables,
  ActivityEventType,
  ActivityLogOnCollaborationFragment,
} from '@/core/apollo/generated/graphql-schema';

const useActivityOnCollaborationSubscription = (collaborationID: string, { types }: { types?: ActivityEventType[] }) =>
  createUseSubscriptionToSubEntityHook<
    Array<ActivityLogOnCollaborationFragment>,
    ActivityCreatedSubscription,
    ActivityCreatedSubscriptionVariables
  >({
    subscriptionDocument: ActivityCreatedDocument,
    getSubscriptionVariables: () => ({ input: { collaborationID, types, includeChild: true } }),
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
  fetchMoreActivities: (limit: number) => void;
}

interface UseActivityOnCollaborationOptions {
  types?: ActivityEventType[];
  limit: number;
  skip?: boolean;
}

const useActivityOnCollaboration = (
  collaborationID: string | undefined,
  options: UseActivityOnCollaborationOptions
): ActivityOnCollaborationReturnType => {
  const { types, skip, limit } = options;

  const {
    data: activityLogData,
    loading,
    subscribeToMore,
    refetch,
  } = useActivityLogOnCollaborationQuery({
    variables: {
      collaborationID: collaborationID!,
      types,
      limit,
    },
    skip: !collaborationID || skip,
    fetchPolicy: 'cache-and-network',
  });

  useActivityOnCollaborationSubscription(collaborationID!, { types })(
    activityLogData,
    data => data?.activityLogOnCollaboration,
    // @ts-ignore react-18
    subscribeToMore,
    { skip: !collaborationID }
  );

  const activities = useMemo<ActivityLogResultType[] | undefined>(() => {
    if (!activityLogData) {
      return undefined;
    }

    return activityLogData.activityLogOnCollaboration as ActivityLogResultType[];
  }, [activityLogData]);

  const fetchMoreActivities = (limit: number) => {
    refetch({
      // Can't use fetchMore because the query isn't paginated
      limit,
    });
  };

  return {
    activities,
    loading,
    fetchMoreActivities,
  };
};

export default useActivityOnCollaboration;
