import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { useChallenge, useHub, useUserContext } from '../../hooks';
import { useChallengePageQuery } from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { Discussion } from '../../models/discussion/discussion';
import {
  AspectCardFragment,
  AuthorizationPrivilege,
  CanvasDetailsFragment,
  ChallengeProfileFragment,
} from '../../models/graphql-schema';
import getActivityCount from '../../domain/activity/utils/getActivityCount';
import { ActivityType } from '../../domain/activity/ActivityType';
import { useAspectsCount } from '../../domain/aspect/utils/aspectsCount';
import { EntityDashboardContributors } from '../../domain/community/EntityDashboardContributorsSection/Types';
import useCommunityMembersAsCardProps from '../../domain/community/utils/useCommunityMembersAsCardProps';
import { useCanvasesCount } from '../../domain/canvas/utils/canvasesCount';
import { getCanvasCallout } from '../canvas/getCanvasCallout';
import { getAspectCallout } from '../aspect/getAspectCallout';

export interface ChallengeContainerEntities extends EntityDashboardContributors {
  hubId: string;
  hubNameId: string;
  hubDisplayName: string;
  challenge?: ChallengeProfileFragment;
  activity: ActivityItem[];
  aspects: AspectCardFragment[];
  aspectsCount: number | undefined;
  canvases: CanvasDetailsFragment[];
  canvasesCount: number | undefined;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
  };
  isAuthenticated: boolean;
  isMember: boolean;
  discussions: Discussion[];
}

export interface ChallengeContainerActions {}

export interface ChallengeContainerState {
  loading: boolean;
  error?: ApolloError;
}

const EMPTY = [];

export interface ChallengePageContainerProps
  extends ContainerChildProps<ChallengeContainerEntities, ChallengeContainerActions, ChallengeContainerState> {}

export const ChallengePageContainer: FC<ChallengePageContainerProps> = ({ children }) => {
  const { t } = useTranslation();
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

  const permissions = {
    canEdit: user?.isChallengeAdmin(hubId, challengeId) || false,
    communityReadAccess: (_challenge?.hub?.challenge?.community?.authorization?.myPrivileges || []).some(
      x => x === AuthorizationPrivilege.Read
    ),
  };

  const { discussionList, loading: loadingDiscussions } = useDiscussionsContext();

  const activity: ActivityItem[] = useMemo(() => {
    const _activity = _challenge?.hub.challenge.activity || [];
    return [
      {
        name: t('common.opportunities'),
        type: ActivityType.Opportunity,
        count: getActivityCount(_activity, 'opportunities'),
        color: 'primary',
      },
      {
        name: t('common.projects'),
        count: getActivityCount(_activity, 'projects'),
        color: 'positive',
      },
      {
        name: t('common.members'),
        count: getActivityCount(_activity, 'members'),
        color: 'neutralMedium',
      },
    ];
  }, [_challenge]);

  const aspects = getAspectCallout(_challenge?.hub.challenge.collaboration?.callouts)?.aspects || EMPTY;
  const aspectsCount = useAspectsCount(_challenge?.hub.challenge.activity);

  const canvases = getCanvasCallout(_challenge?.hub.challenge.collaboration?.callouts)?.canvases || EMPTY;
  const canvasesCount = useCanvasesCount(_challenge?.hub.challenge.activity);

  const contributors = useCommunityMembersAsCardProps(_challenge?.hub.challenge.community);

  return (
    <>
      {children(
        {
          hubId,
          hubNameId,
          hubDisplayName: hub.displayName,
          challenge: _challenge?.hub.challenge,
          activity,
          aspects,
          aspectsCount,
          canvases,
          canvasesCount,
          permissions,
          isAuthenticated,
          isMember: user?.ofChallenge(challengeId) || false,
          discussions: discussionList,
          ...contributors,
        },
        { loading: loading || loadingProfile || loadingHubContext || loadingDiscussions },
        {}
      )}
    </>
  );
};
export default ChallengePageContainer;
