import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { useChallenge, useHub, useUserContext } from '../../hooks';
import {
  useActivityLogOnCollaborationQuery,
  useChallengeDashboardReferencesQuery,
  useChallengePageQuery,
} from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { Discussion } from '../../domain/discussion/models/discussion';
import { Activity, AuthorizationPrivilege, ChallengeProfileFragment } from '../../models/graphql-schema';
import getActivityCount from '../../domain/activity/utils/getActivityCount';
import { ActivityType } from '../../domain/activity/ActivityType';
import { useAspectsCount } from '../../domain/aspect/utils/aspectsCount';
import { EntityDashboardContributors } from '../../domain/community/EntityDashboardContributorsSection/Types';
import useCommunityMembersAsCardProps from '../../domain/community/utils/useCommunityMembersAsCardProps';
import { useCanvasesCount } from '../../domain/canvas/utils/canvasesCount';
import {
  getAspectsFromPublishedCallouts,
  getCanvasesFromPublishedCallouts,
} from '../../domain/callout/utils/getPublishedCallouts';
import { Reference } from '../../models/Profile';
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../../domain/callout/useCallouts';
import { LATEST_ACTIVITIES_COUNT } from '../../models/constants';

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
  activities: Activity[] | undefined;
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

  const { data: _challenge, loading: loadingProfile } = useChallengePageQuery({
    variables: {
      hubId: hubNameId,
      challengeId: challengeNameId,
    },
    errorPolicy: 'all',
  });
  const collaborationID = _challenge?.hub?.challenge?.collaboration?.id;

  const { data: activityLogData } = useActivityLogOnCollaborationQuery({
    variables: { queryData: { collaborationID: collaborationID! } },
    skip: !collaborationID,
  });
  const activities = useMemo(() => {
    if (!activityLogData) {
      return undefined;
    }

    return [...activityLogData.activityLogOnCollaboration]
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, LATEST_ACTIVITIES_COUNT);
  }, [activityLogData]);

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

  const { activity = [] } = _challenge?.hub.challenge || {};

  const opportunitiesCount = useMemo(() => getActivityCount(activity, ActivityType.Opportunity), [activity]);

  const aspects = getAspectsFromPublishedCallouts(_challenge?.hub.challenge.collaboration?.callouts).slice(0, 2);
  const aspectsCount = useAspectsCount(_challenge?.hub.challenge.activity);

  const canvases = getCanvasesFromPublishedCallouts(_challenge?.hub.challenge.collaboration?.callouts).slice(0, 2);
  const canvasesCount = useCanvasesCount(_challenge?.hub.challenge.activity);

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
