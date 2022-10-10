import { useMemo } from 'react';
import {
  Activity,
  ActivityEventType,
  CardsNamesFromHubQuery,
  CardsNamesFromChallengeQuery,
  CardsNamesFromOpportunityQuery,
} from '../../../../../models/graphql-schema';
import { useApolloErrorHandler, useUrlParams } from '../../../../../hooks';
import {
  useCardsNamesFromChallengeQuery,
  useCardsNamesFromHubQuery,
  useCardsNamesFromOpportunityQuery,
} from '../../../../../hooks/generated/graphql';
import { isChallengeId, isHubId, isOpportunityId } from '../../../types/CoreEntityIds';

export type CardActivityData = {
  id: string;
  nameID: string;
  calloutNameId: string;
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
};

function flatMapAllCards(
  hubData?: CardsNamesFromHubQuery,
  challengeData?: CardsNamesFromChallengeQuery,
  opportunityData?: CardsNamesFromOpportunityQuery
): CardActivityData[] {
  const cards: CardActivityData[] = [];

  hubData?.hub?.collaboration?.callouts
    ?.flatMap(callout =>
      callout.aspects?.map(card => ({
        ...card,
        calloutNameId: callout.nameID,
        hubNameId: hubData.hub.nameID,
      }))
    )
    .filter(card => !!card)
    .forEach(card => cards.push(card!));

  challengeData?.hub?.challenge?.collaboration?.callouts
    ?.flatMap(callout =>
      callout.aspects?.map(card => ({
        ...card,
        calloutNameId: callout.nameID,
        hubNameId: challengeData.hub.nameID,
        challengeNameId: challengeData.hub.challenge.nameID,
      }))
    )
    .filter(card => !!card)
    .forEach(card => cards.push(card!));

  opportunityData?.hub?.opportunity?.collaboration?.callouts
    ?.flatMap(callout =>
      callout.aspects?.map(card => ({
        ...card,
        calloutNameId: callout.nameID,
        hubNameId: opportunityData.hub.nameID,
        challengeNameId: opportunityData.hub.opportunity.parentNameID,
        opportunityNameId: opportunityData.hub.opportunity.nameID,
      }))
    )
    .filter(card => !!card)
    .forEach(card => cards.push(card!));

  return cards;
}

export const useCardsActivityData = (activities: Activity[]) => {
  const urlParams = useUrlParams();
  const handleError = useApolloErrorHandler();

  // Get the Ids of the Cards that have an Activity entry
  const cardsIds =
    activities
      ?.filter(a => a.type === ActivityEventType.CardCreated || a.type === ActivityEventType.CardComment)
      .map(a => a.resourceID) || [];

  // Retrieve the relevant information to print these activity entries about cards
  const { data: hubCardsData, loading: hubCardsLoading } = useCardsNamesFromHubQuery({
    onError: handleError,
    variables: isHubId(urlParams) ? { hubID: urlParams.hubNameId, cardsIds } : undefined,
    skip: !isHubId(urlParams) || cardsIds.length === 0,
    errorPolicy: 'all',
  });

  const { data: challengeCardsData, loading: challengeCardsLoading } = useCardsNamesFromChallengeQuery({
    onError: handleError,
    variables: isChallengeId(urlParams)
      ? { hubID: urlParams.hubNameId, challengeId: urlParams.challengeNameId, cardsIds }
      : undefined,
    skip: !isChallengeId(urlParams) || cardsIds.length === 0,
    errorPolicy: 'all',
  });

  const { data: opportunityCardsData, loading: opportunityCardsLoading } = useCardsNamesFromOpportunityQuery({
    onError: handleError,
    variables: isOpportunityId(urlParams)
      ? { hubID: urlParams.hubNameId, opportunityId: urlParams.opportunityNameId, cardsIds }
      : undefined,
    skip: !isOpportunityId(urlParams) || cardsIds.length === 0,
    errorPolicy: 'all',
  });

  // Join the information together
  const cardsActivityData = useMemo(
    () => flatMapAllCards(hubCardsData, challengeCardsData, opportunityCardsData),
    [hubCardsData, challengeCardsData, opportunityCardsData]
  );

  return {
    cardsActivityData,
    loading: hubCardsLoading || challengeCardsLoading || opportunityCardsLoading,
  };
};
