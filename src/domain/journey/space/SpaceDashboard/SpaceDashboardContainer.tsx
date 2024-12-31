import { ApolloError } from '@apollo/client';
import React, { FC, useCallback } from 'react';
import { useSpace } from '../SpaceContext/useSpace';
import { useUserContext } from '@/domain/community/user';
import {
  useSendMessageToCommunityLeadsMutation,
  useSpaceDashboardReferencesQuery,
  useSpacePageQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '@/core/container/container';
import {
  AuthorizationPrivilege,
  CalloutGroupName,
  CommunityMembershipStatus,
  Reference,
  SpacePageFragment,
} from '@/core/apollo/generated/graphql-schema';
import { UseCalloutsProvided } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import useSpaceDashboardNavigation, {
  DashboardNavigationItem,
} from '../spaceDashboardNavigation/useSpaceDashboardNavigation';
import { ContributorViewProps } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import useCalloutsOnCollaboration from '@/domain/collaboration/useCalloutsOnCollaboratin';

export interface SpaceContainerEntities {
  space: SpacePageFragment | undefined;
  dashboardNavigation: DashboardNavigationItem | undefined;
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
  references: Reference[] | undefined;
  provider: ContributorViewProps | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  callouts: UseCalloutsProvided;
}

export interface SpaceContainerActions {}

export interface SpaceContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface SpacePageContainerProps
  extends ContainerChildProps<SpaceContainerEntities, SpaceContainerActions, SpaceContainerState> {
  spaceId: string | undefined;
}

const NO_PRIVILEGES = [];

export const SpaceDashboardContainer: FC<SpacePageContainerProps> = ({ spaceId, children }) => {
  const { loading: loadingSpace, permissions: spacePermissions, isPrivate, error } = useSpace();
  const { user, isAuthenticated } = useUserContext();

  const { data: spaceData, loading: loadingSpaceQuery } = useSpacePageQuery({
    variables: {
      spaceId: spaceId!,
      authorizedReadAccess: spacePermissions.canRead,
      authorizedReadAccessCommunity: spacePermissions.communityReadAccess,
    },
    errorPolicy: 'all',
    skip: !spaceId,
  });

  const space = spaceData?.lookup.space;

  const isMember = space?.community?.roleSet?.myMembershipStatus === CommunityMembershipStatus.Member;

  // don't load references without READ privilege on Context
  const { data: referencesData } = useSpaceDashboardReferencesQuery({
    variables: { spaceId: spaceId! }, // having Read privilege implies presence of spaceId
    skip: !space?.context?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read),
  });

  const communityReadAccess = (space?.community?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const timelineReadAccess = (space?.collaboration?.timeline?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const spacePrivileges = space?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const permissions = {
    canEdit: spacePrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess,
    timelineReadAccess,
    spaceReadAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) || false,
  };

  const { dashboardNavigation, loading: dashboardNavigationLoading } = useSpaceDashboardNavigation({
    spaceId: spaceId!, // spaceReadAccess implies presence of spaceId
    skip: !permissions.spaceReadAccess,
  });

  const references = referencesData?.lookup.space?.profile.references;

  const communityId = space?.community?.id ?? '';
  const collaborationId = space?.collaboration?.id ?? '';

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

  const callouts = useCalloutsOnCollaboration({
    collaborationId,
    groupNames: [CalloutGroupName.Home],
  });

  return (
    <>
      {children(
        {
          space,
          dashboardNavigation,
          isPrivate,
          permissions,
          isAuthenticated,
          isMember,
          references,
          provider: space?.provider,
          sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
          callouts,
        },
        {
          error,
          loading: loadingSpaceQuery || loadingSpace || dashboardNavigationLoading,
        },
        {}
      )}
    </>
  );
};

export default SpaceDashboardContainer;
