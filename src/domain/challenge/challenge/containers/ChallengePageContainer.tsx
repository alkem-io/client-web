import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useDiscussionsContext } from '../../../communication/discussion/providers/DiscussionsProvider';
import { useUserContext } from '../../../community/contributor/user';
import { useHub } from '../../hub/HubContext/useHub';
import { useChallenge } from '../hooks/useChallenge';
import {
  useChallengeDashboardReferencesAndRecommendationsQuery,
  useChallengePageQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { Discussion } from '../../../communication/discussion/models/discussion';
import {
  AuthorizationPrivilege,
  ChallengeProfileFragment,
  DashboardTopCalloutFragment,
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
    opportunitiesReadAccess: boolean;
  };
  isAuthenticated: boolean;
  isMember: boolean;
  discussions: Discussion[];
  activities: ActivityLogResultType[] | undefined;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
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

  const { activities, loading: activityLoading } = useActivityOnCollaboration(collaborationID);

  const challengePrivileges = _challenge?.hub?.challenge?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const permissions = {
    canEdit: user?.isChallengeAdmin(hubId, challengeId) || false,
    communityReadAccess: (_challenge?.hub?.challenge?.community?.authorization?.myPrivileges || []).some(
      x => x === AuthorizationPrivilege.Read
    ),
    opportunitiesReadAccess: challengePrivileges.includes(AuthorizationPrivilege.Read),
  };

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

  const contributors = useCommunityMembersAsCardProps(_challenge?.hub.challenge.community);

  const references = referenceData?.hub?.challenge?.context?.references;
  const recommendations = referenceData?.hub?.challenge?.context?.recommendations;

  const topCallouts = _challenge?.hub.challenge.collaboration?.callouts?.slice(0, 3);

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
          recommendations,
          isMember: user?.ofChallenge(challengeId) || false,
          discussions: discussionList,
          ...contributors,
          activities,
          topCallouts,
        },
        { loading: loading || loadingProfile || loadingHubContext || loadingDiscussions, activityLoading },
        {}
      )}
    </>
  );
};

export default ChallengePageContainer;
