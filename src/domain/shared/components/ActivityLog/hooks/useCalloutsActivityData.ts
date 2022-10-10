import { useMemo } from 'react';
import {
  Activity,
  ActivityEventType,
  CalloutsNamesFromHubQuery,
  CalloutsNamesFromChallengeQuery,
  CalloutsNamesFromOpportunityQuery,
} from '../../../../../models/graphql-schema';
import { useApolloErrorHandler, useUrlParams } from '../../../../../hooks';
import {
  useCalloutsNamesFromChallengeQuery,
  useCalloutsNamesFromHubQuery,
  useCalloutsNamesFromOpportunityQuery,
} from '../../../../../hooks/generated/graphql';
import { isChallengeId, isHubId, isOpportunityId } from '../../../types/CoreEntityIds';
import { uniq } from 'lodash';

export type CalloutActivityData = {
  id: string;
  nameID: string;
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
};

function flatMapAllCallouts(
  hubData?: CalloutsNamesFromHubQuery,
  challengeData?: CalloutsNamesFromChallengeQuery,
  opportunityData?: CalloutsNamesFromOpportunityQuery
): CalloutActivityData[] {
  const callouts: CalloutActivityData[] = [];
  hubData?.hub?.collaboration?.callouts?.forEach(c => callouts.push({ ...c, hubNameId: hubData.hub.nameID }));

  challengeData?.hub?.challenge?.collaboration?.callouts?.forEach(c =>
    callouts.push({ ...c, hubNameId: challengeData.hub.nameID, challengeNameId: challengeData.hub.challenge.nameID })
  );

  opportunityData?.hub?.opportunity?.collaboration?.callouts?.forEach(c =>
    callouts.push({
      ...c,
      hubNameId: opportunityData.hub.nameID,
      challengeNameId: opportunityData.hub.opportunity.parentNameID,
      opportunityNameId: opportunityData.hub.opportunity.nameID,
    })
  );

  return callouts;
}

export const useCalloutsActivityData = (activities: Activity[]) => {
  const urlParams = useUrlParams();
  const handleError = useApolloErrorHandler();

  // Get the Ids of the Callouts that have an Activity entry
  const calloutsIds = uniq(
    activities
      ?.filter(a => a.type === ActivityEventType.CalloutPublished || a.type === ActivityEventType.DiscussionComment)
      .map(a => a.resourceID) || []
  );

  // Retrieve the relevant information to print these activity entries about callouts
  const { data: hubCalloutsData, loading: hubCalloutsLoading } = useCalloutsNamesFromHubQuery({
    onError: handleError,
    variables: isHubId(urlParams) ? { hubID: urlParams.hubNameId, calloutsIds } : undefined,
    skip: !isHubId(urlParams) || calloutsIds.length === 0,
  });

  const { data: challengeCalloutsData, loading: challengeCalloutsLoading } = useCalloutsNamesFromChallengeQuery({
    onError: handleError,
    variables: isChallengeId(urlParams)
      ? { hubID: urlParams.hubNameId, challengeId: urlParams.challengeNameId, calloutsIds }
      : undefined,
    skip: !isChallengeId(urlParams) || calloutsIds.length === 0,
  });

  const { data: opportunityCalloutsData, loading: opportunityCalloutsLoading } = useCalloutsNamesFromOpportunityQuery({
    onError: handleError,
    variables: isOpportunityId(urlParams)
      ? { hubID: urlParams.hubNameId, opportunityId: urlParams.opportunityNameId, calloutsIds }
      : undefined,
    skip: !isOpportunityId(urlParams) || calloutsIds.length === 0,
  });

  // Join the information together
  const calloutActivityData = useMemo(
    () => flatMapAllCallouts(hubCalloutsData, challengeCalloutsData, opportunityCalloutsData),
    [hubCalloutsData, challengeCalloutsData, opportunityCalloutsData]
  );

  return {
    calloutActivityData,
    loading: hubCalloutsLoading || challengeCalloutsLoading || opportunityCalloutsLoading,
  };
};
