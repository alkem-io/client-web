import { useEffect, useState } from 'react';
import {
  ActivityCreatedDocument,
  useActivityLogOnCollaborationQuery,
  useActorDetailsLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  type ActivityCreatedSubscription,
  type ActivityCreatedSubscriptionVariables,
  type ActivityEventType,
  type ActivityLogOnCollaborationFragment,
  type ActorDetailsQuery,
  ActorType,
} from '@/core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '@/core/apollo/subscriptions/useSubscriptionToSubEntity';
import type { ActivityLogResultType } from '../ActivityLog/ActivityComponent';

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
    // @ts-expect-error react-18
    subscribeToMore,
    { skip: !collaborationID }
  );

  // Fetch actor-specific details for MemberJoined activity contributors
  type ActorDetail = NonNullable<ActorDetailsQuery['actor']>;
  const [fetchActorDetails] = useActorDetailsLazyQuery();
  const [actorDetailsMap, setActorDetailsMap] = useState<Record<string, ActorDetail>>({});

  const memberJoinedContributorIds = (() => {
    const entries = activityLogData?.activityLogOnCollaboration ?? [];
    return [
      ...new Set(entries.filter((e): e is typeof e & { actor: { id: string } } => 'actor' in e).map(e => e.actor.id)),
    ];
  })();

  useEffect(() => {
    if (memberJoinedContributorIds.length === 0) {
      return;
    }
    const fetchAll = async () => {
      const results = await Promise.all(
        memberJoinedContributorIds.map(actorId => fetchActorDetails({ variables: { actorId } }))
      );
      const newMap: Record<string, ActorDetail> = {};
      for (const result of results) {
        const actor = result.data?.actor;
        if (actor) {
          newMap[actor.id] = actor;
        }
      }
      setActorDetailsMap(newMap);
    };
    fetchAll();
  }, [memberJoinedContributorIds, fetchActorDetails]);

  // Extract type-specific fields from actor details to enrich contributors
  const getExtraContributorFields = (actorDetail: ActorDetail | undefined): Record<string, unknown> => {
    if (!actorDetail) return {};
    if (actorDetail.type === ActorType.User && 'firstName' in actorDetail) {
      return { firstName: actorDetail.firstName, lastName: actorDetail.lastName };
    }
    if (actorDetail.type === ActorType.Organization && 'contactEmail' in actorDetail) {
      return { contactEmail: actorDetail.contactEmail };
    }
    return {};
  };

  const activities = (() => {
    if (!activityLogData) {
      return undefined;
    }

    return activityLogData.activityLogOnCollaboration.map(entry => {
      if ('actor' in entry) {
        const extra = getExtraContributorFields(actorDetailsMap[entry.actor.id]);
        if (Object.keys(extra).length > 0) {
          return { ...entry, actor: { ...entry.actor, ...extra } } as ActivityLogResultType;
        }
      }
      return entry as ActivityLogResultType;
    });
  })();

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
