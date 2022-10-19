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
import { uniq } from 'lodash';

export type CardActivityData = {
  id: string;
  nameID: string;
  calloutNameId: string;
  calloutDisplayName: string;
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
        calloutDisplayName: callout.displayName,
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
        calloutDisplayName: callout.displayName,
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
        calloutDisplayName: callout.displayName,
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
  const cardsIds = uniq(
    activities
      ?.filter(a => a.type === ActivityEventType.CardCreated || a.type === ActivityEventType.CardComment)
      .map(a => a.resourceID) || []
  );
  const calloutsIds = uniq(
    activities
      ?.filter(a => a.type === ActivityEventType.CardCreated || a.type === ActivityEventType.CardComment)
      .map(a => a.parentID)
      .filter(c => !!c)
      .map(c => c!) || []
  );

  // Retrieve the relevant information to print these activity entries about cards
  const { data: hubCardsData, loading: hubCardsLoading } = useCardsNamesFromHubQuery({
    onError: handleError,
    variables: isHubId(urlParams)
      ? {
          hubID: urlParams.hubNameId,
          calloutsIds /* cardsIds: TODO: Filter by cardsIds when server doesn't return an error */,
        }
      : undefined,
    skip: !isHubId(urlParams) || cardsIds.length === 0,
    errorPolicy: 'all',
  });

  const { data: challengeCardsData, loading: challengeCardsLoading } = useCardsNamesFromChallengeQuery({
    onError: handleError,
    variables: isChallengeId(urlParams)
      ? {
          hubID: urlParams.hubNameId,
          challengeId: urlParams.challengeNameId,
          calloutsIds /* cardsIds: TODO: Filter by cardsIds when server doesn't return an error */,
        }
      : undefined,
    skip: !isChallengeId(urlParams) || cardsIds.length === 0,
    errorPolicy: 'all',
  });

  const { data: opportunityCardsData, loading: opportunityCardsLoading } = useCardsNamesFromOpportunityQuery({
    onError: handleError,
    variables: isOpportunityId(urlParams)
      ? {
          hubID: urlParams.hubNameId,
          opportunityId: urlParams.opportunityNameId,
          calloutsIds /* cardsIds: TODO: Filter by cardsIds when server doesn't return an error */,
        }
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
