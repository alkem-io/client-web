import { OptionalCoreEntityIds } from '../../../shared/types/CoreEntityIds';
import {
  useCalloutsLazyQuery,
  useCalloutsQuery,
  useUpdateCalloutsSortOrderMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  Callout,
  CalloutType,
  CalloutVisibility,
  WhiteboardDetailsFragment,
  WhiteboardTemplate,
  CommentsWithMessagesFragment,
  ContributeTabPostFragment,
  CalloutsQueryVariables,
  ReferenceDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutPostTemplate } from '../creation-dialog/CalloutCreationDialog';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { CalloutsGroup } from '../CalloutsInContext/CalloutsGroup';
import { compact, groupBy, sortBy } from 'lodash';
import { OrderUpdate } from '../../../../core/utils/UpdateOrder';
import { Tagset } from '../../../common/profile/Profile';
import { INNOVATION_FLOW_STATES_TAGSET_NAME } from '../../InnovationFlow/InnovationFlowStates/useInnovationFlowStates';

interface CalloutChildTypePropName {
  [CalloutType.PostCollection]: 'posts';
  [CalloutType.WhiteboardCollection]: 'whiteboards';
  [CalloutType.Post]: 'comments';
  [CalloutType.LinkCollection]: 'links';
  [CalloutType.Whiteboard]: 'whiteboards';
}

export type PostFragmentWithCallout = ContributeTabPostFragment & { calloutNameId: string };

export type WhiteboardFragmentWithCallout = WhiteboardDetailsFragment & { calloutNameId: string };

export type CommentsWithMessagesFragmentWithCallout = CommentsWithMessagesFragment & { calloutNameId: string };

export type ReferencesFragmentWithCallout = ReferenceDetailsFragment & { calloutNameId: string };

interface CalloutChildPropValue {
  posts: never;
  whiteboards: WhiteboardFragmentWithCallout[];
  comments: CommentsWithMessagesFragmentWithCallout;
  links: ReferencesFragmentWithCallout;
  whiteboard: WhiteboardFragmentWithCallout[];
}

type CalloutCardTemplateType = {
  [CalloutType.PostCollection]: { postTemplate: CalloutPostTemplate };
  [CalloutType.WhiteboardCollection]: { whiteboardTemplate: WhiteboardTemplate };
  [CalloutType.Post]: {};
  [CalloutType.LinkCollection]: {};
  [CalloutType.Whiteboard]: { whiteboardTemplate: WhiteboardTemplate };
};

type CalloutWithChildType<PropName extends keyof CalloutChildPropValue> = {
  [P in PropName]: CalloutChildPropValue[P];
};

type CalloutTypesWithChildTypes = {
  [Type in keyof CalloutChildTypePropName]: { type: Type } & CalloutWithChildType<CalloutChildTypePropName[Type]> &
    CalloutCardTemplateType[Type];
};

export type TypedCallout = Pick<
  Callout,
  'id' | 'nameID' | 'state' | 'activity' | 'authorization' | 'sortOrder' | 'group'
> &
  (
    | CalloutTypesWithChildTypes[CalloutType.PostCollection]
    | CalloutTypesWithChildTypes[CalloutType.WhiteboardCollection]
    | CalloutTypesWithChildTypes[CalloutType.Post]
    | CalloutTypesWithChildTypes[CalloutType.LinkCollection]
    | CalloutTypesWithChildTypes[CalloutType.Whiteboard]
  ) & {
    profile: {
      id: string;
      displayName: string;
      description?: string;
      tagset?: Tagset;
    };
    draft: boolean;
    editable: boolean;
  };

interface UseCalloutsParams extends OptionalCoreEntityIds {
  calloutGroups?: CalloutsGroup[];
  innovationFlowState?: string;
}

interface UseCalloutsProvided {
  callouts: TypedCallout[] | undefined;
  groupedCallouts: Record<CalloutsGroup, TypedCallout[] | undefined>;
  canCreateCallout: boolean;
  canReadCallout: boolean;
  calloutNames: string[];
  loading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  calloutsSortOrder: string[];
  onCalloutsSortOrderUpdate: (update: OrderUpdate) => void;
}

const getSortedCalloutIds = (callouts?: TypedCallout[]) => sortBy(callouts, c => c.sortOrder).map(c => c.id);

const UNGROUPED_CALLOUTS_GROUP = Symbol('undefined');

/**
 * If you need Callouts without a group, don't specify calloutGroups at all.
 */
const useCallouts = (params: UseCalloutsParams): UseCalloutsProvided => {
  const includeSpace = !params.challengeNameId && !params.opportunityNameId;
  const includeChallenge = !!params.challengeNameId;
  const includeOpportunity = !!params.opportunityNameId;

  const variables = {
    spaceNameId: params.spaceNameId!,
    challengeNameId: params.challengeNameId,
    opportunityNameId: params.opportunityNameId,
    includeSpace,
    includeChallenge,
    includeOpportunity,
    calloutGroups: params.calloutGroups,
  };

  const {
    data: calloutsData,
    loading: calloutsLoading,
    refetch: refetchCallouts,
  } = useCalloutsQuery({
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !params.spaceNameId,
  });

  const [getCallouts] = useCalloutsLazyQuery({
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const refetchCallout = (calloutId: string) => {
    getCallouts({
      variables: {
        ...variables,
        calloutIds: [calloutId],
      },
    });
  };

  const collaboration = (calloutsData?.space.opportunity ?? calloutsData?.space.challenge ?? calloutsData?.space)
    ?.collaboration;

  const canCreateCallout =
    collaboration?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateCallout) ?? false;

  const canReadCallout = collaboration?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;

  const callouts = useMemo(
    () =>
      collaboration?.callouts
        ?.filter(callout => {
          if (!params.innovationFlowState) {
            return true;
          }
          const innovationFlowTagset = callout.profile.tagsets?.find(
            tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
          );
          return innovationFlowTagset?.tags.includes(params.innovationFlowState);
        })
        .map(({ authorization, ...callout }) => {
          const draft = callout?.visibility === CalloutVisibility.Draft;
          const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
          return {
            ...callout,
            // Add calloutNameId to all whiteboards
            whiteboards: callout.whiteboards?.map(whiteboard => ({ ...whiteboard, calloutNameId: callout.nameID })),
            comments: { ...callout.comments, calloutNameId: callout.nameID },
            authorization,
            draft,
            editable,
          } as TypedCallout;
        }),
    [collaboration, params.innovationFlowState]
  );

  const submitCalloutsSortOrder = useCallback(
    (calloutIds: string[]) => {
      if (!collaboration) {
        throw new Error('Collaboration is not loaded yet.');
      }
      return runUpdateCalloutsSortOrderMutation({
        variables: {
          collaborationId: collaboration.id,
          calloutIds,
        },
      });
    },
    [collaboration]
  );

  const calloutNames = useMemo(() => callouts?.map(c => c.profile.displayName) ?? [], [callouts]);

  const [calloutsSortOrder, setCalloutsSortOrder] = useState(getSortedCalloutIds(callouts));

  useLayoutEffect(() => {
    setCalloutsSortOrder(getSortedCalloutIds(callouts));
  }, [callouts]);

  const sortedCallouts = useMemo(
    () => compact(calloutsSortOrder.map(id => callouts?.find(c => c.id === id))),
    [calloutsSortOrder, callouts]
  );

  const onCalloutsSortOrderUpdate = useCallback(
    (update: OrderUpdate) => {
      setCalloutsSortOrder(ids => {
        const nextIds = update(ids);
        submitCalloutsSortOrder(nextIds);
        return nextIds;
      });
    },
    [submitCalloutsSortOrder]
  );

  const groupedCallouts = useMemo(() => {
    return groupBy(sortedCallouts, callout => callout.group ?? UNGROUPED_CALLOUTS_GROUP) as Record<
      CalloutsGroup | typeof UNGROUPED_CALLOUTS_GROUP,
      TypedCallout[] | undefined
    >;
  }, [sortedCallouts]);

  const [runUpdateCalloutsSortOrderMutation] = useUpdateCalloutsSortOrderMutation();

  return {
    callouts,
    groupedCallouts,
    canCreateCallout,
    canReadCallout,
    calloutNames,
    loading: calloutsLoading,
    refetchCallouts,
    refetchCallout,
    calloutsSortOrder,
    onCalloutsSortOrderUpdate,
  };
};

export default useCallouts;
