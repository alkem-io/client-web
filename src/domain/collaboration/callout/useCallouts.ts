import { OptionalCoreEntityIds } from '../../shared/types/CoreEntityIds';
import {
  useCalloutsLazyQuery,
  useCalloutsQuery,
  useUpdateCalloutsSortOrderMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  Callout,
  CalloutType,
  CalloutVisibility,
  CanvasDetailsFragment,
  WhiteboardTemplate,
  CommentsWithMessagesFragment,
  ContributeTabAspectFragment,
} from '../../../core/apollo/generated/graphql-schema';
import useSubscribeOnCommentCallouts from './useSubscribeOnCommentCallouts';
import { buildCalloutUrl } from '../../../common/utils/urlBuilders';
import { CalloutPostTemplate } from './creation-dialog/CalloutCreationDialog';
import { useMemo } from 'react';
import { Tagset } from '../../common/profile/Profile';

interface CalloutChildTypePropName {
  [CalloutType.Card]: 'aspects';
  [CalloutType.Canvas]: 'canvases';
  [CalloutType.Comments]: 'comments';
}

export type AspectFragmentWithCallout = ContributeTabAspectFragment & { calloutNameId: string };

export type CanvasFragmentWithCallout = CanvasDetailsFragment & { calloutNameId: string };

export type CommentsWithMessagesFragmentWithCallout = CommentsWithMessagesFragment & { calloutNameId: string };

interface CalloutChildPropValue {
  aspects: never;
  canvases: CanvasFragmentWithCallout[];
  comments: CommentsWithMessagesFragmentWithCallout;
}

type CalloutCardTemplateType = {
  [CalloutType.Card]: { postTemplate: CalloutPostTemplate };
  [CalloutType.Canvas]: { whiteboardTemplate: WhiteboardTemplate };
  [CalloutType.Comments]: {};
};

type CalloutWithChildType<PropName extends keyof CalloutChildPropValue> = {
  [P in PropName]: CalloutChildPropValue[P];
};

type CalloutTypesWithChildTypes = {
  [Type in keyof CalloutChildTypePropName]: { type: Type } & CalloutWithChildType<CalloutChildTypePropName[Type]> &
    CalloutCardTemplateType[Type];
};

export type TypedCallout = Pick<Callout, 'id' | 'nameID' | 'state' | 'activity' | 'authorization' | 'sortOrder'> &
  (
    | CalloutTypesWithChildTypes[CalloutType.Card]
    | CalloutTypesWithChildTypes[CalloutType.Canvas]
    | CalloutTypesWithChildTypes[CalloutType.Comments]
  ) & {
    profile: {
      id: string;
      displayName: string;
      description?: string;
      tagset?: Tagset;
    };
    draft: boolean;
    editable: boolean;
    isSubscribedToComments: boolean;
    url: string;
  };

const useCallouts = (params: OptionalCoreEntityIds) => {
  const includeHub = !(params.challengeNameId || params.opportunityNameId);
  const includeChallenge = !!params.challengeNameId;
  const includeOpportunity = !!params.opportunityNameId;

  const { data: calloutsData, loading: calloutsLoading } = useCalloutsQuery({
    variables: {
      hubNameId: params.hubNameId!,
      challengeNameId: params.challengeNameId,
      opportunityNameId: params.opportunityNameId,
      includeHub,
      includeChallenge,
      includeOpportunity,
    },
    fetchPolicy: 'cache-and-network',
    skip: !params.hubNameId,
  });

  const [getCallouts] = useCalloutsLazyQuery({
    variables: {
      hubNameId: params.hubNameId!,
      challengeNameId: params.challengeNameId,
      opportunityNameId: params.opportunityNameId,
      includeHub,
      includeChallenge,
      includeOpportunity,
    },
    fetchPolicy: 'cache-and-network',
  });

  const collaboration = (calloutsData?.hub.opportunity ?? calloutsData?.hub.challenge ?? calloutsData?.hub)
    ?.collaboration;

  const reloadCallouts = getCallouts;

  const commentCalloutIds = collaboration?.callouts?.filter(x => x.type === CalloutType.Comments).map(x => x.id) ?? [];

  const subscribedToComments = useSubscribeOnCommentCallouts(commentCalloutIds);

  const canCreateCallout =
    collaboration?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateCallout) ?? false;

  const getItemsCount = (callout: TypedCallout) => {
    return callout.activity;
  };

  const callouts = useMemo(
    () =>
      collaboration?.callouts?.map(({ authorization, ...callout }) => {
        const draft = callout?.visibility === CalloutVisibility.Draft;
        const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
        const isSubscribedToComments = commentCalloutIds.includes(callout.id) && subscribedToComments;
        return {
          ...callout,
          // Add calloutNameId to all canvases
          canvases: callout.canvases?.map(canvas => ({ ...canvas, calloutNameId: callout.nameID })),
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
      }),
    [collaboration]
  );

  const [runUpdateCalloutsSortOrderMutation] = useUpdateCalloutsSortOrderMutation();

  const updateCalloutsSortOrder = (calloutIds: string[]) => {
    if (!collaboration) {
      throw new Error('Collaboration is not loaded yet.');
    }
    return runUpdateCalloutsSortOrderMutation({
      variables: {
        collaborationId: collaboration.id,
        calloutIds,
      },
    });
  };

  return {
    callouts,
    canCreateCallout,
    getItemsCount,
    loading: calloutsLoading,
    reloadCallouts,
    updateCalloutsSortOrder,
  };
};

export default useCallouts;
