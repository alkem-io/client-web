import { isChallengeId, isHubId, isOpportunityId, OptionalCoreEntityIds } from '../../shared/types/CoreEntityIds';
import {
  useChallengeCalloutsQuery,
  useHubCalloutsQuery,
  useOpportunityCalloutsQuery,
} from '../../../hooks/generated/graphql';
import {
  AuthorizationPrivilege,
  Callout,
  CalloutType,
  CalloutVisibility,
  CanvasDetailsFragment,
  CommentsWithMessagesFragment,
  ContributeTabAspectFragment,
} from '../../../models/graphql-schema';
import useSubscribeOnCommentCallouts from './useSubscribeOnCommentCallouts';
import { buildCalloutUrl } from '../../../common/utils/urlBuilders';

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

type TypedCallout = Pick<Callout, 'id' | 'displayName' | 'nameID' | 'description' | 'state' | 'authorization'> &
  (
    | CalloutTypesWithChildTypes[CalloutType.Card]
    | CalloutTypesWithChildTypes[CalloutType.Canvas]
    | CalloutTypesWithChildTypes[CalloutType.Comments]
  ) & {
    draft: boolean;
    editable: boolean;
    isSubscribedToComments: boolean;
    url: string;
  };

const useCallouts = (params: OptionalCoreEntityIds) => {
  // queries
  const { data: hubCalloutsData, loading: hubCalloutsLoading } = useHubCalloutsQuery({
    variables: isHubId(params) ? params : (params as never),
    fetchPolicy: 'cache-and-network',
    skip: !isHubId(params),
  });

  const { data: challengeCalloutsData, loading: challengeCalloutsLoading } = useChallengeCalloutsQuery({
    variables: isChallengeId(params) ? params : (params as never),
    fetchPolicy: 'cache-and-network',
    skip: !isChallengeId(params),
  });

  const { data: opportunityCalloutsData, loading: opportunityCalloutsLoading } = useOpportunityCalloutsQuery({
    variables: isOpportunityId(params) ? params : (params as never),
    fetchPolicy: 'cache-and-network',
    skip: !isOpportunityId(params),
  });

  const collaboration = (
    hubCalloutsData?.hub ??
    challengeCalloutsData?.hub.challenge ??
    opportunityCalloutsData?.hub.opportunity
  )?.collaboration;

  const commentCalloutIds = collaboration?.callouts?.filter(x => x.type === CalloutType.Comments).map(x => x.id) ?? [];

  const subscribedToComments = useSubscribeOnCommentCallouts(commentCalloutIds);

  const canCreateCallout = collaboration?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateCallout);

  const callouts = collaboration?.callouts?.map(({ authorization, ...callout }) => {
    const draft = callout?.visibility === CalloutVisibility.Draft;
    const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
    const isSubscribedToComments = commentCalloutIds.includes(callout.id) && subscribedToComments;
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
      url:
        params.hubNameId &&
        buildCalloutUrl(callout.nameID, {
          hubNameId: params.hubNameId,
          challengeNameId: params.challengeNameId,
          opportunityNameId: params.opportunityNameId,
        }),
    } as TypedCallout;
  });

  return {
    callouts,
    canCreateCallout,
    loading: hubCalloutsLoading || challengeCalloutsLoading || opportunityCalloutsLoading,
  };
};

export default useCallouts;
