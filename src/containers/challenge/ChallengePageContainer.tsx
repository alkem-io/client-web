import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useChallenge, useUserContext } from '../../hooks';
import { useChallengeProfileQuery } from '../../hooks/generated/graphql';
import { Container } from '../../models/container';
import { ChallengeProfileFragment } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';

export interface ChallengeContainerEntities {
  challenge?: ChallengeProfileFragment;
  activity: ActivityItem[];
  permissions: {
    canEdit: boolean;
  };
  isAuthenticated: boolean;
  isMember: boolean;
}

export interface ChallengeContainerActions {}

export interface ChallengeContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengePageContainerProps
  extends Container<ChallengeContainerEntities, ChallengeContainerActions, ChallengeContainerState> {}

export const ChallengePageContainer: FC<ChallengePageContainerProps> = ({ children }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useUserContext();
  const { ecoverseId, ecoverseNameId, challengeId, challengeNameId, loading } = useChallenge();

  const { data: _challenge, loading: loadingProfile } = useChallengeProfileQuery({
    variables: {
      ecoverseId: ecoverseNameId,
      challengeId: challengeNameId,
    },
    errorPolicy: 'all',
  });

  const permissions = {
    canEdit: user?.isChallengeAdmin(ecoverseId, challengeId) || false,
  };

  const activity: ActivityItem[] = useMemo(() => {
    const _activity = _challenge?.ecoverse.challenge.activity || [];
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
          challenge: _challenge?.ecoverse.challenge,
          activity,
          permissions,
          isAuthenticated,
          isMember: user?.ofChallenge(challengeId) || false,
        },
        { loading: loading || loadingProfile },
        {}
      )}
    </>
  );
};
export default ChallengePageContainer;
