import { useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  ActivityEventType,
  AuthorizationPrivilege,
  DashboardTopCalloutFragment,
} from '@/core/apollo/generated/graphql-schema';
import { ContainerChildProps } from '@/core/container/container';
import { ActivityLogResultType } from '@/domain/collaboration/activity/ActivityLog/ActivityComponent';
import useActivityOnCollaboration from '@/domain/collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import { useUserContext } from '@/domain/community/user';
import {
  RECENT_ACTIVITIES_LIMIT_INITIAL,
  TOP_CALLOUTS_LIMIT,
} from '@/domain/journey/common/journeyDashboard/constants';
import { ApolloError } from '@apollo/client';

export interface ActivityContainerEntities {
  permissions: {
    readAccess: boolean;
    readUsers: boolean;
  };
  activities: ActivityLogResultType[] | undefined;
  fetchMoreActivities: (limit: number) => void;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
}

export interface ActivityContainerActions {}

export interface ActivityContainerState {
  error?: ApolloError;
  activityLoading: boolean;
}

export interface ActivityContainerProps
  extends ContainerChildProps<ActivityContainerEntities, ActivityContainerActions, ActivityContainerState> {
  spaceId: string | undefined;
}

export const ActivityContainer = ({ spaceId, children }: ActivityContainerProps) => {
  const { user } = useUserContext();
  const { data: _space, loading: loadingSpaceQuery } = useSpacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    errorPolicy: 'all',
    skip: !spaceId,
  });

  const collaborationID = _space?.lookup.space?.collaboration?.id;

  const spacePrivileges = _space?.lookup.space?.authorization?.myPrivileges ?? [];

  const permissions = {
    readAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
  };

  const activityTypes = Object.values(ActivityEventType).filter(
    activityType => activityType !== ActivityEventType.CalloutWhiteboardContentModified
  );

  const {
    activities,
    loading: activityLoading,
    fetchMoreActivities,
  } = useActivityOnCollaboration(collaborationID, {
    skip: !permissions.readAccess || !permissions.readUsers,
    types: activityTypes,
    limit: RECENT_ACTIVITIES_LIMIT_INITIAL,
  });

  const topCallouts = _space?.lookup.space?.collaboration?.calloutsSet?.callouts?.slice(0, TOP_CALLOUTS_LIMIT);

  return (
    <>
      {children(
        {
          permissions,
          activities,
          fetchMoreActivities,
          topCallouts,
        },
        { activityLoading: activityLoading || loadingSpaceQuery },
        {}
      )}
    </>
  );
};

export default ActivityContainer;
