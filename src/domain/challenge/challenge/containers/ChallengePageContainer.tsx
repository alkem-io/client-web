import { ApolloError } from '@apollo/client';
import React, { FC, useCallback, useMemo } from 'react';
import { useDiscussionsContext } from '../../../communication/discussion/providers/DiscussionsProvider';
import { useUserContext } from '../../../community/contributor/user';
import { useHub } from '../../hub/HubContext/useHub';
import { useChallenge } from '../hooks/useChallenge';
import {
  useChallengeDashboardReferencesAndRecommendationsQuery,
  useChallengePageQuery,
  usePlatformLevelAuthorizationQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { Discussion } from '../../../communication/discussion/models/Discussion';
import {
  AuthorizationPrivilege,
  ChallengeProfileFragment,
  DashboardTopCalloutFragment,
  HubVisibility,
  Reference,
} from '../../../../core/apollo/generated/graphql-schema';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { useAspectsCount } from '../../../collaboration/aspect/utils/aspectsCount';
import { EntityDashboardContributors } from '../../../community/community/EntityDashboardContributorsSection/Types';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { useCanvasesCount } from '../../../collaboration/canvas/utils/canvasesCount';
import {
  getAspectsFromPublishedCallouts,
  getCanvasesFromPublishedCallouts,
} from '../../../collaboration/callout/utils/getPublishedCallouts';
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../../../collaboration/callout/useCallouts';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog/ActivityComponent';
import { useActivityOnCollaboration } from '../../../shared/components/ActivityLog/hooks/useActivityOnCollaboration';

export interface ChallengeContainerEntities extends EntityDashboardContributors {
  hubId: string;
  hubNameId: string;
  hubDisplayName: string;
  hubVisibility: HubVisibility;
  challenge?: ChallengeProfileFragment;
  opportunitiesCount: number | undefined;
  aspects: AspectFragmentWithCallout[];
  aspectsCount: number | undefined;
  references: Reference[] | undefined;
  recommendations: Reference[] | undefined;
  canvases: CanvasFragmentWithCallout[];
  canvasesCount: number | undefined;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
    challengeReadAccess: boolean;
    readUsers: boolean;
  };
  isAuthenticated: boolean;
  isMember: boolean;
  discussions: Discussion[];
  activities: ActivityLogResultType[] | undefined;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
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
  const { loading: loadingHubContext, ...hub } = useHub();
  const { hubId, hubNameId, challengeId, challengeNameId, loading } = useChallenge();

  const { data: _challenge, loading: loadingProfile } = useChallengePageQuery({
    variables: {
      hubId: hubNameId,
      challengeId: challengeNameId,
    },
  });

  const collaborationID = _challenge?.hub?.challenge?.collaboration?.id;

  const challengePrivileges = _challenge?.hub?.challenge?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const { data: platformPrivilegesData } = usePlatformLevelAuthorizationQuery();
  const platformPrivileges = platformPrivilegesData?.authorization.myPrivileges ?? NO_PRIVILEGES;

  const permissions = {
    canEdit: challengePrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess: (_challenge?.hub?.challenge?.community?.authorization?.myPrivileges || []).some(
      x => x === AuthorizationPrivilege.Read
    ),
    challengeReadAccess: challengePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: platformPrivileges.includes(AuthorizationPrivilege.ReadUsers),
  };

  const { activities, loading: activityLoading } = useActivityOnCollaboration(
    collaborationID,
    !permissions.challengeReadAccess || !permissions.readUsers
  );

  const canReadReferences = _challenge?.hub?.challenge?.context?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const { data: referenceData } = useChallengeDashboardReferencesAndRecommendationsQuery({
    variables: {
      hubId: hubNameId,
      challengeId: challengeNameId,
    },
    skip: !canReadReferences,
  });

  const { discussionList, loading: loadingDiscussions } = useDiscussionsContext();

  const { metrics = [] } = _challenge?.hub.challenge || {};

  const opportunitiesCount = useMemo(() => getMetricCount(metrics, MetricType.Opportunity), [metrics]);

  const aspects = getAspectsFromPublishedCallouts(_challenge?.hub.challenge.collaboration?.callouts).slice(0, 2);
  const aspectsCount = useAspectsCount(_challenge?.hub.challenge.metrics);

  const canvases = getCanvasesFromPublishedCallouts(_challenge?.hub.challenge.collaboration?.callouts).slice(0, 2);
  const canvasesCount = useCanvasesCount(_challenge?.hub.challenge.metrics);

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (_challenge?.hub.challenge.community?.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(_challenge?.hub.challenge.community, { memberUsersCount });

  const references = referenceData?.hub?.challenge?.profile.references;
  const recommendations = referenceData?.hub?.challenge?.context?.recommendations;

  const topCallouts = _challenge?.hub.challenge.collaboration?.callouts?.slice(0, 3);

  const communityId = _challenge?.hub.challenge.community?.id ?? '';

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
          hubId,
          hubNameId,
          hubDisplayName: hub.profile.displayName,
          hubVisibility: hub.visibility,
          challenge: _challenge?.hub.challenge,
          opportunitiesCount,
          aspects,
          aspectsCount,
          canvases,
          canvasesCount,
          permissions,
          isAuthenticated,
          references,
          recommendations,
          isMember: user?.ofChallenge(challengeId) || false,
          discussions: discussionList,
          ...contributors,
          activities,
          topCallouts,
          sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
        },
        { loading: loading || loadingProfile || loadingHubContext || loadingDiscussions, activityLoading },
        {}
      )}
    </>
  );
};

export default ChallengePageContainer;
