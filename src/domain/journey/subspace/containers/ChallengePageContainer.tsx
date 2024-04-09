import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useUserContext } from '../../../community/user';
import {
  useChallengeDashboardReferencesQuery,
  useChallengePageQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  ActivityEventType,
  AuthorizationPrivilege,
  CalloutGroupName,
  ChallengeProfileFragment,
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

export interface ChallengeContainerEntities extends EntityDashboardContributors {
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
  extends ContainerChildProps<ChallengeContainerEntities, ChallengeContainerActions, ChallengeContainerState> {
  challengeId: string | undefined;
}

const NO_PRIVILEGES = [];

export const ChallengePageContainer: FC<ChallengePageContainerProps> = ({ challengeId, children }) => {
  const { user, isAuthenticated } = useUserContext();

  const { data: _challenge, loading: loadingProfile } = useChallengePageQuery({
    variables: {
      challengeId: challengeId!,
    },
    skip: !challengeId,
  });

  const collaborationID = _challenge?.lookup.subspace?.collaboration?.id;

  const challengePrivileges = _challenge?.lookup.subspace?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const timelineReadAccess = (
    _challenge?.lookup.subspace?.collaboration?.timeline?.authorization?.myPrivileges ?? []
  ).includes(AuthorizationPrivilege.Read);

  const permissions = {
    canEdit: challengePrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess: (_challenge?.lookup.subspace?.community?.authorization?.myPrivileges || []).some(
      x => x === AuthorizationPrivilege.Read
    ),
    challengeReadAccess: challengePrivileges.includes(AuthorizationPrivilege.Read),
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

  const canReadReferences = _challenge?.lookup.subspace?.context?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const { data: referenceData } = useChallengeDashboardReferencesQuery({
    variables: {
      challengeId: challengeId!, // canReadReferences implies challengeId is provided
    },
    skip: !canReadReferences,
  });

  const { metrics = [] } = _challenge?.lookup.subspace || {};

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (_challenge?.lookup.subspace?.community?.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(_challenge?.lookup.subspace?.community, { memberUsersCount });

  const references = referenceData?.lookup.subspace?.profile.references;

  const topCallouts = _challenge?.lookup.subspace?.collaboration?.callouts?.slice(0, TOP_CALLOUTS_LIMIT);

  const communityId = _challenge?.lookup.subspace?.community?.id ?? '';

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const callouts = useCallouts({
    journeyId: challengeId,
    journeyTypeName: 'challenge',
    groupNames: [CalloutGroupName.Home_1, CalloutGroupName.Home_2],
  });

  const isMember = _challenge?.lookup.subspace?.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  return (
    <>
      {children(
        {
          challenge: _challenge?.lookup.subspace,
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

export default ChallengePageContainer;
