import { ActivityLogViewProps } from '../views';
import { useAuthorsDetails } from '../../../../communication/communication/useAuthorsDetails';
import { Activity, ActivityEventType } from '../../../../../models/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';
import { useCallback, useMemo } from 'react';
import { EntityPageSection } from '../../../layout/EntityPageSection';
import { buildAspectUrl, buildCalloutUrl } from '../../../../../common/utils/urlBuilders';
import { CalloutActivityData, useCalloutsActivityData } from './useCalloutsActivityData';
import { CardActivityData, useCardsActivityData } from './useCardsActivityInformation';

interface ActivityToViewModelReturnType {
  activityViewModel: ActivityLogViewProps[] | undefined;
  getActivityViewModel: (activityLog: Activity) => ActivityLogViewProps;
  loading: boolean;
}

function getUrlByActivityType(
  activityLog: Activity,
  authors: Author[],
  callouts: CalloutActivityData[],
  cards: CardActivityData[]
): string | undefined {
  switch (activityLog.type) {
    case ActivityEventType.CanvasCreated: {
      return EntityPageSection.Explore;
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

export const useActivityToViewModel = (activities: Activity[]): ActivityToViewModelReturnType => {
  // Authors information
  const authorIds = activities?.map(x => x.triggeredBy);
  const { authors = [], loading: loadingAuthors } = useAuthorsDetails(authorIds ?? []);

  // Callouts:
  const { calloutActivityData, loading: loadingCallouts } = useCalloutsActivityData(activities);

  // Cards:
  const { cardsActivityData, loading: loadingCards } = useCardsActivityData(activities);

  const loading = loadingAuthors || loadingCallouts || loadingCards;
  // Prepare the result of this hook
  const getActivityViewModel = useCallback(
    (activityLog: Activity) => toActivityViewModel(activityLog, authors, calloutActivityData, cardsActivityData),
    [loading, authors, calloutActivityData, cardsActivityData]
  );

  const activityViewModel = useMemo(
    () =>
      activities?.map<ActivityLogViewProps>(activity =>
        toActivityViewModel(activity, authors, calloutActivityData, cardsActivityData)
      ),
    [loading, activities, authors, calloutActivityData, cardsActivityData]
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
  cards: CardActivityData[]
) => ({
  author: authors.find(author => author.id === activityLog.triggeredBy),
  createdDate: activityLog.createdDate,
  url: getUrlByActivityType(activityLog, authors, callouts, cards),
  description: activityLog.description,
});
