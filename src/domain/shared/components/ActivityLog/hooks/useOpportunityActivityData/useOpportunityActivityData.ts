import { uniq } from 'lodash';
import { useMemo } from 'react';
import { Activity, ActivityEventType } from '../../../../../../models/graphql-schema';
import { useApolloErrorHandler } from '../../../../../../core/apollo/hooks/useApolloErrorHandler';
import { useOpportunitiesNameQuery } from '../../../../../../hooks/generated/graphql';
import { useUrlParams } from '../../../../../../hooks';

export type OpportunityActivityData = {
  id: string;
  nameID: string;
  displayName: string;
  hubNameId: string;
  challengeNameId: string;
};

type ReturnType = {
  opportunitiesActivityData: OpportunityActivityData[];
  loading: boolean;
};

export const useOpportunityActivityData = (activities: Activity[]): ReturnType => {
  const { hubNameId, challengeNameId } = useUrlParams();
  const handleError = useApolloErrorHandler();

  const opportunityActivities = uniq(activities.filter(({ type }) => type === ActivityEventType.OpportunityCreated));
  const opportunityIds = opportunityActivities.map(({ resourceID }) => resourceID);
  const { data, loading } = useOpportunitiesNameQuery({
    onError: handleError,
    variables: {
      hubID: hubNameId!,
      opportunityIDs: opportunityIds,
    },
    skip: !hubNameId || opportunityIds.length === 0,
  });

  const opportunitiesActivityData = useMemo(() => {
    if (!hubNameId || !challengeNameId) {
      return [];
    }

    const challenges = data?.hub?.opportunities ?? [];
    return challenges.map<OpportunityActivityData>(x => ({ ...x, hubNameId, challengeNameId }));
  }, [data?.hub?.opportunities, hubNameId, challengeNameId]);

  return {
    opportunitiesActivityData,
    loading,
  };
};
