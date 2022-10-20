import { ActivityViewProps } from '../views';
import { useAuthorsDetails } from '../../../../communication/communication/useAuthorsDetails';
import { Activity, ActivityEventType } from '../../../../../models/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';
import { useCallback, useMemo } from 'react';
import {
  buildAspectUrl,
  buildCalloutUrl,
  buildCanvasUrl,
  buildChallengeUrl,
  buildOpportunityUrl,
} from '../../../../../common/utils/urlBuilders';
import { CalloutActivityData, useCalloutsActivityData } from './useCalloutsActivityData';
import { CardActivityData, useCardsActivityData } from './useCardsActivityData';
import { CanvasActivityData, useCanvasesActivityData } from './useCanvasesActivityData';
import { ChallengeActivityData, useChallengeActivityData } from './useChallengeActivityData/useChallengeActivityData';
import {
  OpportunityActivityData,
  useOpportunityActivityData,
} from './useOpportunityActivityData/useOpportunityActivityData';

interface ActivityToViewModelReturnType {
  activityViewModel: ActivityViewProps[] | undefined;
  getActivityViewModel: (activityLog: Activity) => ActivityViewProps;
  loading: boolean;
}

function getUrlByActivityType(
  activityLog: Activity,
  authors: Author[],
  callouts: CalloutActivityData[],
  cards: CardActivityData[],
  canvases: CanvasActivityData[],
  challenges: ChallengeActivityData[],
  opportunities: OpportunityActivityData[]
): string | undefined {
  switch (activityLog.type) {
    case ActivityEventType.CanvasCreated: {
      const canvas = canvases.find(c => c.id === activityLog.resourceID);
      return canvas ? buildCanvasUrl({ ...canvas, canvasNameId: canvas.nameID }) : undefined;
    }
    case ActivityEventType.CardComment: {
      const card = cards.find(c => c.id === activityLog.resourceID);
      return card ? buildAspectUrl({ ...card, aspectNameId: card.nameID }) : undefined;
    }
    case ActivityEventType.CardCreated: {
      const card = cards.find(c => c.id === activityLog.resourceID);
      return card ? buildAspectUrl({ ...card, aspectNameId: card.nameID }) : undefined;
    }
    case ActivityEventType.MemberJoined: {
      return authors.find(author => author.id === activityLog.triggeredBy)?.url;
    }
    case ActivityEventType.CalloutPublished: {
      const callout = callouts.find(c => c.id === activityLog.resourceID);
      return callout
        ? buildCalloutUrl(callout.nameID, callout.hubNameId, callout.challengeNameId, callout.opportunityNameId)
        : undefined;
    }
    case ActivityEventType.DiscussionComment: {
      const callout = callouts.find(c => c.id === activityLog.resourceID);
      return callout
        ? buildCalloutUrl(callout.nameID, callout.hubNameId, callout.challengeNameId, callout.opportunityNameId)
        : undefined;
    }
    case ActivityEventType.ChallengeCreated: {
      const challenge = challenges.find(c => c.id === activityLog.resourceID);
      return challenge ? buildChallengeUrl(challenge.hubNameId, challenge.nameID) : undefined;
    }
    case ActivityEventType.OpportunityCreated: {
      const opportunity = opportunities.find(o => o.id === activityLog.resourceID);
      return opportunity
        ? buildOpportunityUrl(opportunity.hubNameId, opportunity.challengeNameId, opportunity.nameID)
        : undefined;
    }
  }
}

function getParentDisplayNameByActivityType(
  activityLog: Activity,
  callouts: CalloutActivityData[],
  cards: CardActivityData[],
  canvases: CanvasActivityData[]
): string | undefined {
  switch (activityLog.type) {
    case ActivityEventType.CanvasCreated: {
      const canvas = canvases.find(c => c.id === activityLog.resourceID);
      return canvas ? canvas.calloutDisplayName : undefined;
    }
    case ActivityEventType.CardComment: {
      const card = cards.find(c => c.id === activityLog.resourceID);
      return card ? card.calloutDisplayName : undefined;
    }
    case ActivityEventType.CardCreated: {
      const card = cards.find(c => c.id === activityLog.resourceID);
      return card ? card.calloutDisplayName : undefined;
    }
    case ActivityEventType.MemberJoined: {
      return undefined;
    }
    case ActivityEventType.CalloutPublished: {
      return undefined;
    }
    case ActivityEventType.DiscussionComment: {
      const callout = callouts.find(c => c.id === activityLog.resourceID);
      return callout ? callout.displayName : undefined;
    }
    default: {
      return undefined;
    }
  }
}

export const useActivityToViewModel = (activities: Activity[]): ActivityToViewModelReturnType => {
  const authorIds = activities?.map(x => x.triggeredBy);
  const { authors = [], loading: loadingAuthors } = useAuthorsDetails(authorIds ?? []);

  const { calloutActivityData, loading: loadingCallouts } = useCalloutsActivityData(activities);

  const { cardsActivityData, loading: loadingCards } = useCardsActivityData(activities);

  const { canvasesActivityData, loading: loadingCanvases } = useCanvasesActivityData(activities);

  const { challengesActivityData, loading: loadingChallenges } = useChallengeActivityData(activities);
  const { opportunitiesActivityData, loading: loadingOpportunities } = useOpportunityActivityData(activities);

  const loading =
    loadingAuthors || loadingCallouts || loadingCards || loadingCanvases || loadingChallenges || loadingOpportunities;

  const getActivityViewModel = useCallback(
    (activityLog: Activity) =>
      toActivityViewModel(
        activityLog,
        authors,
        calloutActivityData,
        cardsActivityData,
        canvasesActivityData,
        challengesActivityData,
        opportunitiesActivityData
      ),
    [
      authors,
      calloutActivityData,
      cardsActivityData,
      canvasesActivityData,
      challengesActivityData,
      opportunitiesActivityData,
    ]
  );

  const activityViewModel = useMemo(
    () =>
      activities?.map<ActivityViewProps>(activity =>
        toActivityViewModel(
          activity,
          authors,
          calloutActivityData,
          cardsActivityData,
          canvasesActivityData,
          challengesActivityData,
          opportunitiesActivityData
        )
      ),
    [
      activities,
      authors,
      calloutActivityData,
      cardsActivityData,
      canvasesActivityData,
      challengesActivityData,
      opportunitiesActivityData,
    ]
  );

  return {
    activityViewModel,
    getActivityViewModel,
    loading,
  };
};

const toActivityViewModel = (
  activityLog: Activity,
  authors: Author[],
  callouts: CalloutActivityData[],
  cards: CardActivityData[],
  canvases: CanvasActivityData[],
  challenges: ChallengeActivityData[],
  opportunities: OpportunityActivityData[]
) => ({
  author: authors.find(author => author.id === activityLog.triggeredBy),
  createdDate: activityLog.createdDate,
  url: getUrlByActivityType(activityLog, authors, callouts, cards, canvases, challenges, opportunities),
  description: activityLog.description,
  parentDisplayName: getParentDisplayNameByActivityType(activityLog, callouts, cards, canvases),
});
