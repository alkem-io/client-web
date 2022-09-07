import { isChallengeId, isHubId, isOpportunityId, OptionalCoreEntityIds } from '../shared/types/CoreEntityIds';
import {
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
  };

const useCallouts = (params: OptionalCoreEntityIds) => {
  const { data: hubCalloutsData, loading: hubCalloutsLoading } = useHubCalloutsQuery({
    variables: isHubId(params) ? params : (params as never),
    skip: !isHubId(params),
  });

  const { data: challengeCalloutsData, loading: challengeCalloutsLoading } = useChallengeCalloutsQuery({
    variables: isChallengeId(params) ? params : (params as never),
    skip: !isChallengeId(params),
  });

  const { data: opportunityCalloutsData, loading: opportunityCalloutsLoading } = useOpportunityCalloutsQuery({
    variables: isOpportunityId(params) ? params : (params as never),
    skip: !isOpportunityId(params),
  });

  const { collaboration } =
    hubCalloutsData?.hub ?? challengeCalloutsData?.hub.challenge ?? opportunityCalloutsData?.hub.opportunity ?? {};

  const canCreateCallout = collaboration?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateCallout);

  const callouts = collaboration?.callouts?.map(({ authorization, ...callout }) => {
    const draft = callout?.visibility === CalloutVisibility.Draft;
    const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
    return {
      ...callout,
      // Add calloutNameId to all the canvases and aspects
      canvases: callout.canvases?.map(canvas => ({ ...canvas, calloutNameId: callout.nameID })),
      aspects: callout.aspects?.map(aspect => ({ ...aspect, calloutNameId: callout.nameID })),
      comments: { ...callout.comments, calloutNameId: callout.nameID },
      authorization,
      draft,
      editable,
    } as TypedCallout;
  });

  return {
    callouts,
    canCreateCallout,
    loading: hubCalloutsLoading || challengeCalloutsLoading || opportunityCalloutsLoading,
  };
};

export default useCallouts;
