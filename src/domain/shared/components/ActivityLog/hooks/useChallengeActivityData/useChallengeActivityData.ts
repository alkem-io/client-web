import { uniq } from 'lodash';
import { useMemo } from 'react';
import { Activity, ActivityEventType } from '../../../../../../models/graphql-schema';
import { useApolloErrorHandler } from '../../../../../../core/apollo/hooks/useApolloErrorHandler';
import { useChallengesNameQuery } from '../../../../../../hooks/generated/graphql';
import { useUrlParams } from '../../../../../../hooks';

export type ChallengeActivityData = { id: string; nameID: string; displayName: string; hubNameId: string };

type ReturnType = {
  challengesActivityData: ChallengeActivityData[];
  loading: boolean;
};

export const useChallengeActivityData = (activities: Activity[]): ReturnType => {
  const { hubNameId } = useUrlParams();
  const handleError = useApolloErrorHandler();

  const challengeActivities = uniq(activities.filter(({ type }) => type === ActivityEventType.ChallengeCreated));
  const challengeIds = challengeActivities.map(({ resourceID }) => resourceID);
  const { data, loading } = useChallengesNameQuery({
    onError: handleError,
    variables: {
      hubID: hubNameId!,
      challengeIDs: challengeIds,
    },
    skip: !hubNameId || challengeIds.length === 0,
  });

  const challengesActivityData = useMemo(() => {
    if (!hubNameId) {
      return [];
    }

    const challenges = data?.hub?.challenges ?? [];
    return challenges.map<ChallengeActivityData>(x => ({ ...x, hubNameId }));
  }, [data?.hub?.challenges, hubNameId]);

  return {
    challengesActivityData,
    loading,
  };
};
