import { ApolloError } from '@apollo/client';
import React, { FC, useCallback, useMemo } from 'react';
import { useSpace } from '../SpaceContext/useSpace';
import { useUserContext } from '../../../community/user';
import {
  useSendMessageToCommunityLeadsMutation,
  useSpaceDashboardReferencesQuery,
  useSpacePageQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  ActivityEventType,
  AssociatedOrganizationDetailsFragment,
  AuthorizationPrivilege,
  CalloutDisplayLocation,
  CommunityMembershipStatus,
  DashboardTopCalloutFragment,
  Reference,
  SpacePageFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { usePostsCount } from '../../../collaboration/post/utils/postsCount';
import { useWhiteboardsCount } from '../../../collaboration/whiteboard/utils/whiteboardsCount';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog/ActivityComponent';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { RECENT_ACTIVITIES_LIMIT_INITIAL, TOP_CALLOUTS_LIMIT } from '../../common/journeyDashboard/constants';

export interface SpaceContainerEntities {
  space: SpacePageFragment | undefined;
  isPrivate: boolean | undefined;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
    timelineReadAccess: boolean;
    spaceReadAccess: boolean;
    readUsers: boolean;
  };
  isAuthenticated: boolean;
  isMember: boolean;
  activities: ActivityLogResultType[] | undefined;
  fetchMoreActivities: (limit: number) => void;
  activityLoading: boolean;
  postsCount: number | undefined;
  whiteboardsCount: number | undefined;
  references: Reference[] | undefined;
  hostOrganizations: AssociatedOrganizationDetailsFragment[] | undefined;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  callouts: UseCalloutsProvided;
}

export interface SpaceContainerActions {}

export interface SpaceContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface SpacePageContainerProps
  extends ContainerChildProps<SpaceContainerEntities, SpaceContainerActions, SpaceContainerState> {}

const NO_PRIVILEGES = [];

export const SpaceDashboardContainer: FC<SpacePageContainerProps> = ({ children }) => {
  const { spaceId, spaceNameId, loading: loadingSpace, isPrivate } = useSpace();
  const { user, isAuthenticated } = useUserContext();

  const { data: _space, loading: loadingSpaceQuery } = useSpacePageQuery({
    variables: { spaceId: spaceNameId },
    errorPolicy: 'all',
    skip: loadingSpace,
  });

  const collaborationID = _space?.space?.collaboration?.id;

  const isMember = _space?.space.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  // don't load references without READ privilege on Context
  const { data: referencesData } = useSpaceDashboardReferencesQuery({
    variables: { spaceId },
    skip: !_space?.space?.context?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read),
  });

  const communityReadAccess = (_space?.space?.community?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const timelineReadAccess = (_space?.space?.collaboration?.timeline?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const spacePrivileges = _space?.space?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const permissions = {
    canEdit: spacePrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess,
    timelineReadAccess,
    spaceReadAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) || false,
  };

  const activityTypes = Object.values(ActivityEventType).filter(x => x !== ActivityEventType.MemberJoined);

  const {
    activities,
    loading: activityLoading,
    fetchMoreActivities,
  } = useActivityOnCollaboration(collaborationID || '', {
    skip: !permissions.spaceReadAccess || !permissions.readUsers,
    types: activityTypes,
    limit: RECENT_ACTIVITIES_LIMIT_INITIAL,
  });

  const postsCount = usePostsCount(_space?.space.metrics);
  const whiteboardsCount = useWhiteboardsCount(_space?.space.metrics);

  const references = referencesData?.space?.profile.references;

  const hostOrganizations = useMemo(() => (_space?.space.host ? [_space.space.host] : []), [_space]);

  const topCallouts = _space?.space.collaboration?.callouts?.slice(0, TOP_CALLOUTS_LIMIT);

  const communityId = _space?.space.community?.id ?? '';

  const [sendMessageToCommunityLeads] = useSendMessageToCommunityLeadsMutation();

  const handleSendMessageToCommunityLeads = useCallback(
    async (messageText: string) => {
      await sendMessageToCommunityLeads({
        variables: {
          messageData: {
            message: messageText,
            communityId: communityId,
          },
        },
      });
    },
    [sendMessageToCommunityLeads, communityId]
  );

  const callouts = useCallouts({
    spaceNameId,
    displayLocations: [CalloutDisplayLocation.HomeLeft, CalloutDisplayLocation.HomeRight],
  });

  return (
    <>
      {children(
        {
          space: _space?.space,
          isPrivate,
          permissions,
          isAuthenticated,
          isMember,
          postsCount,
          whiteboardsCount,
          references,
          activities,
          fetchMoreActivities,
          activityLoading,
          hostOrganizations,
          topCallouts,
          sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
          callouts,
        },
        {
          loading: loadingSpaceQuery || loadingSpace,
        },
        {}
      )}
    </>
  );
};

export default SpaceDashboardContainer;
