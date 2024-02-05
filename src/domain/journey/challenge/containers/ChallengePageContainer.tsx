import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useUserContext } from '../../../community/user';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { useChallenge } from '../hooks/useChallenge';
import {
  useChallengeDashboardReferencesQuery,
  useChallengePageQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  AuthorizationPrivilege,
  CalloutDisplayLocation,
  ChallengeProfileFragment,
  CommunityMembershipStatus,
  DashboardTopCalloutFragment,
  Reference,
  SpaceVisibility,
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
  spaceId: string;
  spaceNameId: string;
  spaceDisplayName: string;
  spaceVisibility: SpaceVisibility;
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
  extends ContainerChildProps<ChallengeContainerEntities, ChallengeContainerActions, ChallengeContainerState> {}

const NO_PRIVILEGES = [];

export const ChallengePageContainer: FC<ChallengePageContainerProps> = ({ children }) => {
  const { user, isAuthenticated } = useUserContext();
  const { loading: loadingSpaceContext, ...space } = useSpace();
  const { spaceId, spaceNameId, challengeNameId, loading } = useChallenge();

  const { data: _challenge, loading: loadingProfile } = useChallengePageQuery({
    variables: {
      spaceId: spaceNameId,
      challengeId: challengeNameId,
    },
  });

  const collaborationID = _challenge?.space?.challenge?.collaboration?.id;

  const challengePrivileges = _challenge?.space?.challenge?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const timelineReadAccess = (
    _challenge?.space.challenge?.collaboration?.timeline?.authorization?.myPrivileges ?? []
  ).includes(AuthorizationPrivilege.Read);

  const permissions = {
    canEdit: challengePrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess: (_challenge?.space?.challenge?.community?.authorization?.myPrivileges || []).some(
      x => x === AuthorizationPrivilege.Read
    ),
    challengeReadAccess: challengePrivileges.includes(AuthorizationPrivilege.Read),
    timelineReadAccess,
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
  };

  const {
    activities,
    loading: activityLoading,
    fetchMoreActivities,
  } = useActivityOnCollaboration(collaborationID, {
    skip: !permissions.challengeReadAccess || !permissions.readUsers,
    limit: RECENT_ACTIVITIES_LIMIT_INITIAL,
  });

  const canReadReferences = _challenge?.space?.challenge?.context?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const { data: referenceData } = useChallengeDashboardReferencesQuery({
    variables: {
      spaceId: spaceNameId,
      challengeId: challengeNameId,
    },
    skip: !canReadReferences,
  });

  const { metrics = [] } = _challenge?.space.challenge || {};

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (_challenge?.space.challenge.community?.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(_challenge?.space.challenge.community, { memberUsersCount });

  const references = referenceData?.space?.challenge?.profile.references;

  const topCallouts = _challenge?.space.challenge.collaboration?.callouts?.slice(0, TOP_CALLOUTS_LIMIT);

  const communityId = _challenge?.space.challenge.community?.id ?? '';

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const callouts = useCallouts({
    spaceNameId,
    challengeNameId,
    displayLocations: [CalloutDisplayLocation.HomeLeft, CalloutDisplayLocation.HomeRight],
  });

  const isMember = _challenge?.space.challenge.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  return (
    <>
      {children(
        {
          spaceId,
          spaceNameId,
          spaceDisplayName: space.profile.displayName,
          spaceVisibility: space.license.visibility,
          challenge: _challenge?.space.challenge,
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
        { loading: loading || loadingProfile || loadingSpaceContext, activityLoading },
        {}
      )}
    </>
  );
};

export default ChallengePageContainer;
