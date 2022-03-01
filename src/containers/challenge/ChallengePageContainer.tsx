import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { useChallenge, useHub, useUserContext } from '../../hooks';
import { useChallengePageQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { Discussion } from '../../models/discussion/discussion';
import { AuthorizationPrivilege, ChallengeProfileFragment } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';

export interface ChallengeContainerEntities {
  hubId: string;
  hubNameId: string;
  hubDisplayName: string;
  challenge?: ChallengeProfileFragment;
  activity: ActivityItem[];
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

export interface ChallengePageContainerProps
  extends ContainerProps<ChallengeContainerEntities, ChallengeContainerActions, ChallengeContainerState> {}

export const ChallengePageContainer: FC<ChallengePageContainerProps> = ({ children }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useUserContext();
  const { hub, loading: loadingHubContext } = useHub();
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
        name: t('pages.activity.opportunities'),
        digit: getActivityCount(_activity, 'opportunities') || 0,
        color: 'primary',
      },
      {
        name: t('pages.activity.projects'),
        digit: getActivityCount(_activity, 'projects') || 0,
        color: 'positive',
      },
      {
        name: t('pages.activity.members'),
        digit: getActivityCount(_activity, 'members') || 0,
        color: 'neutralMedium',
      },
    ];
  }, [_challenge]);

  return (
    <>
      {children(
        {
          hubId,
          hubNameId,
          hubDisplayName: hub?.displayName || '',
          challenge: _challenge?.hub.challenge,
          activity,
          permissions,
          isAuthenticated,
          isMember: user?.ofChallenge(challengeId) || false,
          discussions: discussionList,
        },
        { loading: loading || loadingProfile || loadingHubContext || loadingDiscussions },
        {}
      )}
    </>
  );
};
export default ChallengePageContainer;
