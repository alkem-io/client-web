import { isChallengeId, isHubId, isOpportunityId, OptionalCoreEntityIds } from '../shared/types/CoreEntityIds';
import {
  useCalloutMessageReceivedSubscription,
  useChallengeCalloutsQuery,
  useHubCalloutsQuery,
  useOpportunityCalloutsQuery,
} from '../../hooks/generated/graphql';
import {
  AuthorizationPrivilege,
  Callout,
  CalloutType,
  CalloutVisibility,
  CanvasDetailsFragment,
  ContributeTabAspectFragment,
  CommentsWithMessagesFragment,
} from '../../models/graphql-schema';
import useCalloutMessageReceivedSubscriptionOnExplorePage from './useCalloutMessageReceivedSubscription';
import { useEffect } from 'react';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';
import { useApolloErrorHandler, useConfig } from '../../hooks';
import useSubscribeToMore from '../shared/subscriptions/useSubscribeToMore';

interface CalloutChildTypePropName {
  [CalloutType.Card]: 'aspects';
  [CalloutType.Canvas]: 'canvases';
  [CalloutType.Comments]: 'comments';
}

export type AspectFragmentWithCallout = ContributeTabAspectFragment & { calloutNameId: string };
export type CanvasFragmentWithCallout = CanvasDetailsFragment & { calloutNameId: string };
export type CommentsWithMessagesFragmentWithCallout = CommentsWithMessagesFragment & { calloutNameId: string };

interface CalloutChildPropValue {
  aspects: AspectFragmentWithCallout[];
  canvases: CanvasFragmentWithCallout[];
  comments: CommentsWithMessagesFragmentWithCallout;
}

type CalloutWithChildType<PropName extends keyof CalloutChildPropValue> = {
  [P in PropName]: CalloutChildPropValue[P];
};

type CalloutTypesWithChildTypes = {
  [Type in keyof CalloutChildTypePropName]: { type: Type } & CalloutWithChildType<CalloutChildTypePropName[Type]>;
};

type TypedCallout = Pick<Callout, 'id' | 'displayName' | 'nameID' | 'description' | 'authorization'> &
  (
    | CalloutTypesWithChildTypes[CalloutType.Card]
    | CalloutTypesWithChildTypes[CalloutType.Canvas]
    | CalloutTypesWithChildTypes[CalloutType.Comments]
  ) & {
    draft: boolean;
    editable: boolean;
    isSubscribedToComments: boolean;
  };

const useCallouts = (params: OptionalCoreEntityIds) => {
  // queries
  const { data: hubCalloutsData, loading: hubCalloutsLoading, fetchMore: hubFetchMore } = useHubCalloutsQuery({
    variables: isHubId(params) ? params : (params as never),
    skip: !isHubId(params),
  });

  const { data: challengeCalloutsData, loading: challengeCalloutsLoading, fetchMore: challengeFetchMore } = useChallengeCalloutsQuery({
    variables: isChallengeId(params) ? params : (params as never),
    skip: !isChallengeId(params),
  });

  const { data: opportunityCalloutsData, loading: opportunityCalloutsLoading, fetchMore: opportunityFetchMore } = useOpportunityCalloutsQuery({
    variables: isOpportunityId(params) ? params : (params as never),
    skip: !isOpportunityId(params),
  });

  const { collaboration } =
    hubCalloutsData?.hub ?? challengeCalloutsData?.hub.challenge ?? opportunityCalloutsData?.hub.opportunity ?? {};

  const commentCalloutIds = collaboration?.callouts?.filter(x => x.type === CalloutType.Comments).map(({ id }) => id);



  const canCreateCallout = collaboration?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateCallout);

  const callouts = collaboration?.callouts?.map(({ authorization, ...callout }) => {
    const draft = callout?.visibility === CalloutVisibility.Draft;
    const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
    const isSubscribedToComments = false; // todo
    return {
      ...callout,
      // Add calloutNameId to all the canvases and aspects
      canvases: callout.canvases?.map(canvas => ({ ...canvas, calloutNameId: callout.nameID })),
      aspects: callout.aspects?.map(aspect => ({ ...aspect, calloutNameId: callout.nameID })),
      comments: { ...callout.comments, calloutNameId: callout.nameID },
      authorization,
      draft,
      editable,
      isSubscribedToComments,
    } as TypedCallout;
  });

  return {
    callouts,
    canCreateCallout,
    loading: hubCalloutsLoading || challengeCalloutsLoading || opportunityCalloutsLoading,
  };
};

export default useCallouts;
