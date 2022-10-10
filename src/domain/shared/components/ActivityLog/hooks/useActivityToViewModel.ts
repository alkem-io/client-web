import { ActivityLogViewProps } from '../views';
import { useAuthorsDetails } from '../../../../communication/communication/useAuthorsDetails';
import {
  Activity,
  ActivityEventType,
  CalloutsNamesFromChallengeQuery,
  CalloutsNamesFromHubQuery,
  CalloutsNamesFromOpportunityQuery,
} from '../../../../../models/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';
import { useCallback, useMemo } from 'react';
import { useApolloErrorHandler, useUrlParams } from '../../../../../hooks';
import {
  useCalloutsNamesFromChallengeQuery,
  useCalloutsNamesFromHubQuery,
  useCalloutsNamesFromOpportunityQuery,
} from '../../../../../hooks/generated/graphql';
import { isChallengeId, isHubId, isOpportunityId } from '../../../types/CoreEntityIds';
import { EntityPageSection } from '../../../layout/EntityPageSection';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';

type CalloutData = {
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
) {
  const callouts: CalloutData[] = [];
  hubData?.hub?.collaboration?.callouts?.map(c => callouts.push({ ...c, hubNameId: hubData.hub.nameID }));

  challengeData?.hub?.challenge?.collaboration?.callouts?.map(c =>
    callouts.push({ ...c, hubNameId: challengeData.hub.nameID, challengeNameId: challengeData.hub.challenge.nameID })
  );

  opportunityData?.hub?.opportunity?.collaboration?.callouts?.map(c =>
    callouts.push({
      ...c,
      hubNameId: opportunityData.hub.nameID,
      challengeNameId: opportunityData.hub.opportunity.parentNameID,
      opportunityNameId: opportunityData.hub.opportunity.nameID,
    })
  );

  return callouts;
}

function getUrlByActivityType(activityLog: Activity, authors: Author[], callouts: CalloutData[]): string | undefined {
  switch (activityLog.type) {
    case ActivityEventType.CanvasCreated:
      return EntityPageSection.Explore;
    case ActivityEventType.CardComment:
      return EntityPageSection.Explore;
    case ActivityEventType.CardCreated:
      return EntityPageSection.Explore;
    case ActivityEventType.MemberJoined:
      return authors.find(author => author.id === activityLog.triggeredBy)?.url;
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

interface ActivityToViewModelReturnType {
  activityViewModel: ActivityLogViewProps[] | undefined;
  getActivityViewModel: (activityLog: Activity) => ActivityLogViewProps;
  loading: boolean;
}

export const useActivityToViewModel = (activities: Activity[]): ActivityToViewModelReturnType => {
  const urlParams = useUrlParams();
  const handleError = useApolloErrorHandler();

  // Authors information
  const authorIds = activities?.map(x => x.triggeredBy);
  const { authors = [], loading: loadingAuthors } = useAuthorsDetails(authorIds ?? []);

  // Callouts information
  const calloutIds =
    activities
      ?.filter(a => a.type === ActivityEventType.CalloutPublished || a.type === ActivityEventType.DiscussionComment)
      .map(a => a.resourceID) || [];

  const { data: hubCalloutsData, loading: hubCalloutsLoading } = useCalloutsNamesFromHubQuery({
    onError: handleError,
    variables: isHubId(urlParams) ? { hubID: urlParams.hubNameId, calloutIds: calloutIds } : undefined,
    skip: !isHubId(urlParams) || calloutIds.length === 0,
  });

  const { data: challengeCalloutsData, loading: challengeCalloutsLoading } = useCalloutsNamesFromChallengeQuery({
    onError: handleError,
    variables: isChallengeId(urlParams)
      ? { hubID: urlParams.hubNameId, challengeId: urlParams.challengeNameId, calloutIds: calloutIds }
      : undefined,
    skip: !isChallengeId(urlParams) || calloutIds.length === 0,
  });

  const { data: opportunityCalloutsData, loading: opportunityCalloutsLoading } = useCalloutsNamesFromOpportunityQuery({
    onError: handleError,
    variables: isOpportunityId(urlParams)
      ? { hubID: urlParams.hubNameId, opportunityId: urlParams.opportunityNameId, calloutIds: calloutIds }
      : undefined,
    skip: !isOpportunityId(urlParams) || calloutIds.length === 0,
  });

  const calloutData = useMemo(
    () => flatMapAllCallouts(hubCalloutsData, challengeCalloutsData, opportunityCalloutsData),
    [hubCalloutsData, challengeCalloutsData, opportunityCalloutsData]
  );

  // Prepare the result of this hook
  const getActivityViewModel = useCallback(
    (activityLog: Activity) => toActivityViewModel(activityLog, authors, calloutData),
    [authors, calloutData]
  );

  const activityViewModel = useMemo(
    () => activities?.map<ActivityLogViewProps>(activity => toActivityViewModel(activity, authors, calloutData)),
    [activities, authors, calloutData]
  );

  const loading = loadingAuthors || hubCalloutsLoading || challengeCalloutsLoading || opportunityCalloutsLoading;
  return {
    activityViewModel,
    getActivityViewModel,
    loading,
  };
};

const toActivityViewModel = (activityLog: Activity, authors: Author[], callouts: CalloutData[]) => ({
  author: authors.find(author => author.id === activityLog.triggeredBy),
  createdDate: activityLog.createdDate,
  url: getUrlByActivityType(activityLog, authors, callouts),
  description: activityLog.description,
});
