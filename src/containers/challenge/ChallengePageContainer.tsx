import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { useChallenge, useHub, useUserContext } from '../../hooks';
import { useChallengePageQuery } from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { Discussion } from '../../models/discussion/discussion';
import { AspectCardFragment, AuthorizationPrivilege, ChallengeProfileFragment } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import { ActivityType } from '../../models/constants';
import { useAspectsCount } from '../../domain/aspect/utils/aspectsCount';
import { EntityDashboardContributorsSectionProps } from '../../domain/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import useMembersAsContributors from '../../domain/community/utils/useMembersAsContributors';

export interface ChallengeContainerEntities extends EntityDashboardContributorsSectionProps {
  hubId: string;
  hubNameId: string;
  hubDisplayName: string;
  challenge?: ChallengeProfileFragment;
  activity: ActivityItem[];
  aspects: AspectCardFragment[];
  aspectsCount: number | undefined;
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
        count: getActivityCount(_activity, 'opportunities') || 0,
        color: 'primary',
      },
      {
        name: t('common.projects'),
        count: getActivityCount(_activity, 'projects') || 0,
        color: 'positive',
      },
      {
        name: t('common.members'),
        count: getActivityCount(_activity, 'members') || 0,
        color: 'neutralMedium',
      },
    ];
  }, [_challenge]);

  const aspects = _challenge?.hub.challenge.context?.aspects || EMPTY;
  const aspectsCount = useAspectsCount(_challenge?.hub.challenge.activity);

  const contributors = useMembersAsContributors(_challenge?.hub.challenge.community);

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
