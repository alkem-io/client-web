import { useMemo } from 'react';
import { ActivityLogResultType } from '../ActivityComponent';
import {
  useActivityCreatedSubscription,
  useActivityLogOnCollaborationLazyQuery,
  useActivityLogOnCollaborationQuery,
} from '../../../../../hooks/generated/graphql';
import { LATEST_ACTIVITIES_COUNT } from '../../../../../models/constants/common.constants';
import { useApolloErrorHandler } from '../../../../../core/apollo/hooks/useApolloErrorHandler';

// todo: use when the subscription is working on the server
// const useActivityOnCollaborationSubscription = createUseSubscriptionToSubEntityHook<
//   Array<ActivityLogOnCollaborationFragment>,
//   ActivityCreatedSubscription,
//   ActivityCreatedSubscriptionVariables
// >({
//   subscriptionDocument: ActivityCreatedDocument,
//   updateSubEntity: (subEntity, { activityCreated }) => {
//     if (!subEntity) {
//       return;
//     }
//
//     subEntity.push(activityCreated.activity);
//   },
// });

interface ActivityOnCollaborationReturnType {
  activities: ActivityLogResultType[] | undefined;
  loading: boolean;
}

export const useActivityOnCollaboration = (collaborationID: string | undefined): ActivityOnCollaborationReturnType => {
  const handleError = useApolloErrorHandler();
  const { data: activityLogData, loading } = useActivityLogOnCollaborationQuery({
    variables: { queryData: { collaborationID: collaborationID! } },
    skip: !collaborationID,
    fetchPolicy: 'cache-and-network',
  });

  const [fetchActivityLog] = useActivityLogOnCollaborationLazyQuery();

  useActivityCreatedSubscription({
    shouldResubscribe: true,
    skip: !collaborationID,
    variables: { collaborationID: collaborationID! },
    onSubscriptionData: async options => {
      if (options.subscriptionData.error) {
        handleError(options.subscriptionData.error);
        return;
      }

      await fetchActivityLog({
        variables: {
          queryData: {
            collaborationID: collaborationID!,
          },
        },
        fetchPolicy: 'network-only',
      });
    },
  });

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
    activities,
    loading,
  };
};

const sortFunction = (a: ActivityLogResultType, b: ActivityLogResultType) =>
  new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
