import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { useChallenge, useHub, useUserContext } from '../../hooks';
import { useChallengeDashboardReferencesQuery, useChallengePageQuery } from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { Discussion } from '../../domain/communication/discussion/models/discussion';
import { AuthorizationPrivilege, ChallengeProfileFragment } from '../../models/graphql-schema';
import getMetricCount from '../../domain/platform/metrics/utils/getMetricCount';
import { MetricType } from '../../domain/platform/metrics/MetricType';
import { useAspectsCount } from '../../domain/collaboration/aspect/utils/aspectsCount';
import { EntityDashboardContributors } from '../../domain/community/community/EntityDashboardContributorsSection/Types';
import useCommunityMembersAsCardProps from '../../domain/community/community/utils/useCommunityMembersAsCardProps';
import { useCanvasesCount } from '../../domain/collaboration/canvas/utils/canvasesCount';
import {
  getAspectsFromPublishedCallouts,
  getCanvasesFromPublishedCallouts,
} from '../../domain/collaboration/callout/utils/getPublishedCallouts';
import { Reference } from '../../models/Profile';
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../../domain/collaboration/callout/useCallouts';
import useOpportunityCreatedSubscription from '../../domain/challenge/challenge/hooks/useOpportunityCreatedSubscription';
import { ActivityLogResultType } from '../../domain/shared/components/ActivityLog/ActivityComponent';
import { useActivityOnCollaboration } from '../../domain/shared/components/ActivityLog/hooks/useActivityOnCollaboration';

export interface ChallengeContainerEntities extends EntityDashboardContributors {
  hubId: string;
  hubNameId: string;
  hubDisplayName: string;
  challenge?: ChallengeProfileFragment;
  opportunitiesCount: number | undefined;
  aspects: AspectFragmentWithCallout[];
  aspectsCount: number | undefined;
  references: Reference[] | undefined;
  canvases: CanvasFragmentWithCallout[];
  canvasesCount: number | undefined;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
  };
  isAuthenticated: boolean;
  isMember: boolean;
  discussions: Discussion[];
  activities: ActivityLogResultType[] | undefined;
}

export interface ChallengeContainerActions {}

export interface ChallengeContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengePageContainerProps
  extends ContainerChildProps<ChallengeContainerEntities, ChallengeContainerActions, ChallengeContainerState> {}

export const ChallengePageContainer: FC<ChallengePageContainerProps> = ({ children }) => {
  const { user, isAuthenticated } = useUserContext();
  const { loading: loadingHubContext, ...hub } = useHub();
  const { hubId, hubNameId, challengeId, challengeNameId, loading } = useChallenge();

  const {
    data: _challenge,
    loading: loadingProfile,
    subscribeToMore,
  } = useChallengePageQuery({
    variables: {
      hubId: hubNameId,
      challengeId: challengeNameId,
    },
    errorPolicy: 'all',
  });
  useOpportunityCreatedSubscription(_challenge, data => data?.hub?.challenge, subscribeToMore);

  const collaborationID = _challenge?.hub?.challenge?.collaboration?.id;

  const { activities } = useActivityOnCollaboration(collaborationID || '');

  const permissions = {
    canEdit: user?.isChallengeAdmin(hubId, challengeId) || false,
    communityReadAccess: (_challenge?.hub?.challenge?.community?.authorization?.myPrivileges || []).some(
      x => x === AuthorizationPrivilege.Read
    ),
  };

  const canReadReferences = _challenge?.hub?.challenge?.context?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const { data: referenceData } = useChallengeDashboardReferencesQuery({
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

  const contributors = useCommunityMembersAsCardProps(_challenge?.hub.challenge.community);

  const references = referenceData?.hub?.challenge?.context?.references;

  return (
    <>
      {children(
        {
          hubId,
          hubNameId,
          hubDisplayName: hub.displayName,
          challenge: _challenge?.hub.challenge,
          opportunitiesCount,
          aspects,
          aspectsCount,
          canvases,
          canvasesCount,
          permissions,
          isAuthenticated,
          references,
          isMember: user?.ofChallenge(challengeId) || false,
          discussions: discussionList,
          ...contributors,
          activities,
        },
        { loading: loading || loadingProfile || loadingHubContext || loadingDiscussions },
        {}
      )}
    </>
  );
};
export default ChallengePageContainer;
