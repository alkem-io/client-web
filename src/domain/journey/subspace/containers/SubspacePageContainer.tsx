import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useUserContext } from '../../../community/user';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  ActivityEventType,
  AuthorizationPrivilege,
  CalloutGroupName,
  CommunityMembershipStatus,
  DashboardTopCalloutFragment,
  Reference,
} from '../../../../core/apollo/generated/graphql-schema';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { EntityDashboardContributors } from '../../../community/community/EntityDashboardContributorsSection/Types';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { ActivityLogResultType } from '../../../collaboration/activity/ActivityLog/ActivityComponent';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import useSendMessageToCommunityLeads from '../../../community/CommunityLeads/useSendMessageToCommunityLeads';
import { RECENT_ACTIVITIES_LIMIT_INITIAL, TOP_CALLOUTS_LIMIT } from '../../common/journeyDashboard/constants';
import { useSpaceDashboardReferencesQuery, useSubspacePageQuery } from '../../../../core/apollo/generated/apollo-hooks';

export interface SubspaceContainerEntities extends EntityDashboardContributors {
  challenge?: ChallengeProfileFragment;
  references: Reference[] | undefined;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
    challengeReadAccess: boolean;
    timelineReadAccess: boolean;
    readUsers: boolean;
  };
  isAuthenticated: boolean;
  isMember: boolean;
  activities: ActivityLogResultType[] | undefined;
  fetchMoreActivities: (limit: number) => void;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  callouts: UseCalloutsProvided;
}

export interface ChallengeContainerActions {}

export interface ChallengeContainerState {
  loading: boolean;
  error?: ApolloError;
  activityLoading: boolean;
}

export interface ChallengePageContainerProps
  extends ContainerChildProps<SubspaceContainerEntities, ChallengeContainerActions, ChallengeContainerState> {
  challengeId: string | undefined;
}

const NO_PRIVILEGES = [];

export const SubspacePageContainer: FC<ChallengePageContainerProps> = ({ challengeId, children }) => {
  const { user, isAuthenticated } = useUserContext();

  const { data: subspace, loading: loadingProfile } = useSubspacePageQuery({
    variables: {
      subspaceId: challengeId!,
    },
    skip: !challengeId,
  });

  const collaborationID = subspace?.space?.collaboration?.id;

  const challengePrivileges = subspace?.space?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const timelineReadAccess = (subspace?.space?.collaboration?.timeline?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const permissions = {
    canEdit: challengePrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess: (subspace?.space?.community?.authorization?.myPrivileges || []).some(
      x => x === AuthorizationPrivilege.Read
    ),
    subspaceReadAccess: challengePrivileges.includes(AuthorizationPrivilege.Read),
    timelineReadAccess,
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
    skip: !permissions.subspaceReadAccess || !permissions.readUsers,
    types: activityTypes,
    limit: RECENT_ACTIVITIES_LIMIT_INITIAL,
  });

  const canReadReferences = subspace?.space?.context?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const { data: referenceData } = useSpaceDashboardReferencesQuery({
    variables: {
      spaceId: challengeId!, // canReadReferences implies challengeId is provided
    },
    skip: !canReadReferences,
  });

  const { metrics = [] } = subspace?.space || {};

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (subspace?.space?.community?.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(subspace?.space?.community, { memberUsersCount });

  const references = referenceData?.space?.profile.references;

  const topCallouts = subspace?.space?.collaboration?.callouts?.slice(0, TOP_CALLOUTS_LIMIT);

  const communityId = subspace?.space?.community?.id ?? '';

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const callouts = useCallouts({
    journeyId: challengeId,
    journeyTypeName: 'challenge',
    groupNames: [CalloutGroupName.Home_1, CalloutGroupName.Home_2],
  });

  const isMember = subspace?.space?.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  return (
    <>
      {children(
        {
          challenge: subspace?.space,
          permissions,
          isAuthenticated,
          references,
          isMember,
          ...contributors,
          activities,
          fetchMoreActivities,
          topCallouts,
          sendMessageToCommunityLeads,
          callouts,
        },
        { loading: loadingProfile, activityLoading },
        {}
      )}
    </>
  );
};

export default SubspacePageContainer;
