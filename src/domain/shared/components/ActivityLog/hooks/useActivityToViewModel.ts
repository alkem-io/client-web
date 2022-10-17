import { ActivityLogViewProps } from '../views';
import { useAuthorsDetails } from '../../../../communication/communication/useAuthorsDetails';
import { Activity, ActivityEventType } from '../../../../../models/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';
import { useCallback, useMemo } from 'react';
import { buildAspectUrl, buildCalloutUrl, buildCanvasUrl } from '../../../../../common/utils/urlBuilders';
import { CalloutActivityData, useCalloutsActivityData } from './useCalloutsActivityData';
import { CardActivityData, useCardsActivityData } from './useCardsActivityData';
import { CanvasActivityData, useCanvasesActivityData } from './useCanvasesActivityData';

interface ActivityToViewModelReturnType {
  activityViewModel: ActivityLogViewProps[] | undefined;
  getActivityViewModel: (activityLog: Activity) => ActivityLogViewProps;
  loading: boolean;
}

function getUrlByActivityType(
  activityLog: Activity,
  authors: Author[],
  callouts: CalloutActivityData[],
  cards: CardActivityData[],
  canvases: CanvasActivityData[]
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
  }
}

export const useActivityToViewModel = (activities: Activity[]): ActivityToViewModelReturnType => {
  const authorIds = activities?.map(x => x.triggeredBy);
  const { authors = [], loading: loadingAuthors } = useAuthorsDetails(authorIds ?? []);

  const { calloutActivityData, loading: loadingCallouts } = useCalloutsActivityData(activities);

  const { cardsActivityData, loading: loadingCards } = useCardsActivityData(activities);

  const { canvasesActivityData, loading: loadingCanvases } = useCanvasesActivityData(activities);

  const loading = loadingAuthors || loadingCallouts || loadingCards || loadingCanvases;

  const getActivityViewModel = useCallback(
    (activityLog: Activity) =>
      toActivityViewModel(activityLog, authors, calloutActivityData, cardsActivityData, canvasesActivityData),
    [loading, authors, calloutActivityData, cardsActivityData, canvasesActivityData]
  );

  const activityViewModel = useMemo(
    () =>
      activities?.map<ActivityLogViewProps>(activity =>
        toActivityViewModel(activity, authors, calloutActivityData, cardsActivityData, canvasesActivityData)
      ),
    [loading, activities, authors, calloutActivityData, cardsActivityData, canvasesActivityData]
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
  canvases: CanvasActivityData[]
) => ({
  author: authors.find(author => author.id === activityLog.triggeredBy),
  createdDate: activityLog.createdDate,
  url: getUrlByActivityType(activityLog, authors, callouts, cards, canvases),
  description: activityLog.description,
  parentDisplayName: getParentDisplayNameByActivityType(activityLog, callouts, cards, canvases),
});
