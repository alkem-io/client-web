import { ApolloError } from '@apollo/client';
import React, { FC, useCallback, useMemo } from 'react';
import { useSpace } from '../SpaceContext/useSpace';
import { useUserContext } from '../../../community/contributor/user';
import {
  useSpaceDashboardReferencesQuery,
  useSpacePageQuery,
  usePlatformLevelAuthorizationQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  ActivityEventType,
  AssociatedOrganizationDetailsFragment,
  AuthorizationPrivilege,
  ChallengeCardFragment,
  DashboardTopCalloutFragment,
  SpacePageFragment,
  Reference,
} from '../../../../core/apollo/generated/graphql-schema';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { usePostsCount } from '../../../collaboration/post/utils/postsCount';
import { useWhiteboardsCount } from '../../../collaboration/whiteboard/utils/whiteboardsCount';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';

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
  challengesCount: number | undefined;
  isAuthenticated: boolean;
  isMember: boolean;
  challenges: ChallengeCardFragment[];
  activities: ActivityLogResultType[] | undefined;
  activityLoading: boolean;
  postsCount: number | undefined;
  whiteboardsCount: number | undefined;
  references: Reference[] | undefined;
  hostOrganizations: AssociatedOrganizationDetailsFragment[] | undefined;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
}

export interface SpaceContainerActions {}

export interface SpaceContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface SpacePageContainerProps
  extends ContainerChildProps<SpaceContainerEntities, SpaceContainerActions, SpaceContainerState> {}

const EMPTY = [];
const NO_PRIVILEGES = [];

export const SpaceDashboardContainer: FC<SpacePageContainerProps> = ({ children }) => {
  const { spaceId, spaceNameId, loading: loadingSpace, isPrivate } = useSpace();
  const { user, isAuthenticated } = useUserContext();

  const isMember = user?.ofSpace(spaceId) ?? false;

  const { data: _space, loading: loadingSpaceQuery } = useSpacePageQuery({
    variables: { spaceId: spaceNameId },
    errorPolicy: 'all',
    skip: loadingSpace,
  });
  const collaborationID = _space?.space?.collaboration?.id;

  // don't load references without READ privilege on Context
  const { data: referencesData } = useSpaceDashboardReferencesQuery({
    variables: { spaceId },
    skip: !_space?.space?.context?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read),
  });

  const communityReadAccess = (_space?.space?.community?.authorization?.myPrivileges ?? []).some(
    x => x === AuthorizationPrivilege.Read
  );

  const timelineReadAccess = (_space?.space?.timeline?.authorization?.myPrivileges ?? []).some(
    x => x === AuthorizationPrivilege.Read
  );

  const challengesCount = useMemo(() => getMetricCount(_space?.space.metrics, MetricType.Challenge), [_space]);

  const spacePrivileges = _space?.space?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const { data: platformPrivilegesData } = usePlatformLevelAuthorizationQuery();
  const platformPrivileges = platformPrivilegesData?.authorization.myPrivileges ?? NO_PRIVILEGES;

  const permissions = {
    canEdit: spacePrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess,
    timelineReadAccess,
    spaceReadAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: platformPrivileges.includes(AuthorizationPrivilege.ReadUsers),
  };

  const activityTypes = Object.values(ActivityEventType).filter(x => x !== ActivityEventType.MemberJoined);

  const { activities, loading: activityLoading } = useActivityOnCollaboration(collaborationID || '', {
    skipCondition: !permissions.spaceReadAccess || !permissions.readUsers,
    types: activityTypes,
  });

  const challenges = _space?.space.challenges ?? EMPTY;

  const postsCount = usePostsCount(_space?.space.metrics);
  const whiteboardsCount = useWhiteboardsCount(_space?.space.metrics);

  const references = referencesData?.space?.profile.references;

  const hostOrganizations = useMemo(() => _space?.space.host && [_space?.space.host], [_space]);

  const topCallouts = _space?.space.collaboration?.callouts?.slice(0, 3);

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

  return (
    <>
      {children(
        {
          space: _space?.space,
          isPrivate,
          permissions,
          challengesCount,
          isAuthenticated,
          isMember,
          challenges,
          postsCount,
          whiteboardsCount,
          references,
          activities,
          activityLoading,
          hostOrganizations,
          topCallouts,
          sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
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
