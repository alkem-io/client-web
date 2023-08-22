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
  CalloutDisplayLocation,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutPostTemplate } from '../creationDialog/CalloutCreationDialog';
import { useCallback, useMemo } from 'react';
import { groupBy } from 'lodash';
import { Tagset } from '../../../common/profile/Profile';
import { INNOVATION_FLOW_STATES_TAGSET_NAME } from '../../InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import { getCalloutDisplayLocationValue } from '../utils/getCalloutDisplayLocationValue';
import { getJourneyTypeName } from '../../../journey/JourneyTypeName';

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

export type TypedCallout = Pick<Callout, 'id' | 'nameID' | 'state' | 'activity' | 'authorization' | 'sortOrder'> &
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
      displayLocationTagset?: Tagset;
    };
    draft: boolean;
    editable: boolean;
    flowStates: string[] | undefined;
    displayLocation: string;
  };

interface UseCalloutsParams extends OptionalCoreEntityIds {
  displayLocations?: CalloutDisplayLocation[];
}

export interface OrderUpdate {
  (relatedCalloutIds: string[]): string[];
}

export interface UseCalloutsProvided {
  callouts: TypedCallout[] | undefined;
  groupedCallouts: Record<CalloutDisplayLocation, TypedCallout[] | undefined>;
  canCreateCallout: boolean;
  canReadCallout: boolean;
  calloutNames: string[];
  loading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
}

const UNGROUPED_CALLOUTS_GROUP = Symbol('undefined');
const CALLOUT_DISPLAY_LOCATION_TAGSET_NAME = 'callout-display-location';
/**
 * If you need Callouts without a group, don't specify displayLocations at all.
 */
const useCallouts = (params: UseCalloutsParams): UseCalloutsProvided => {
  const journeyTypeName = getJourneyTypeName(params);

  const variables = {
    spaceNameId: params.spaceNameId!,
    challengeNameId: params.challengeNameId,
    opportunityNameId: params.opportunityNameId,
    includeSpace: journeyTypeName === 'space',
    includeChallenge: journeyTypeName === 'challenge',
    includeOpportunity: journeyTypeName === 'opportunity',
    displayLocations: params.displayLocations,
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
      collaboration?.callouts?.map(({ authorization, ...callout }) => {
        const draft = callout?.visibility === CalloutVisibility.Draft;
        const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
        const innovationFlowTagset = callout.profile.tagsets?.find(
          tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
        );
        const displayLocationTagset = callout.profile.tagsets?.find(
          tagset => tagset.name === CALLOUT_DISPLAY_LOCATION_TAGSET_NAME
        );
        const flowStates = innovationFlowTagset?.tags;
        return {
          ...callout,
          // Add calloutNameId to all whiteboards
          whiteboards: callout.whiteboards?.map(whiteboard => ({ ...whiteboard, calloutNameId: callout.nameID })),
          comments: { ...callout.comments, calloutNameId: callout.nameID },
          authorization,
          draft,
          editable,
          flowStates,
          displayLocation: getCalloutDisplayLocationValue(displayLocationTagset?.tags),
        } as TypedCallout;
      }),
    [collaboration]
  );

  const submitCalloutsSortOrder = useCallback(
    (calloutIds: string[]) => {
      if (!collaboration) {
        throw new Error('Collaboration is not loaded yet.');
      }
      return updateCalloutsSortOrderMutation({
        variables: {
          collaborationId: collaboration.id,
          calloutIds,
        },
      });
    },
    [collaboration]
  );

  const calloutNames = useMemo(() => callouts?.map(c => c.profile.displayName) ?? [], [callouts]);

  const sortedCallouts = useMemo(() => callouts?.sort((a, b) => a.sortOrder - b.sortOrder), [callouts]);

  const onCalloutsSortOrderUpdate = useCallback(
    (movedCalloutId: string) => {
      const flowState = callouts?.find(callout => callout.id === movedCalloutId)?.flowStates?.[0];
      const displayLocation = callouts?.find(callout => callout.id === movedCalloutId)?.displayLocation;
      const relatedCallouts = callouts?.filter(
        callout =>
          (!flowState || callout.flowStates?.includes(flowState)) && callout.displayLocation === displayLocation
      );
      const relatedCalloutIds = relatedCallouts?.map(callout => callout.id) ?? [];
      return (update: OrderUpdate) => {
        const nextIds = update(relatedCalloutIds);
        return submitCalloutsSortOrder(nextIds);
      };
    },
    [submitCalloutsSortOrder]
  );

  const groupedCallouts = useMemo(() => {
    return groupBy(
      sortedCallouts,
      callout => getCalloutDisplayLocationValue(callout.profile.displayLocationTagset?.tags) ?? UNGROUPED_CALLOUTS_GROUP
    ) as Record<CalloutDisplayLocation | typeof UNGROUPED_CALLOUTS_GROUP, TypedCallout[] | undefined>;
  }, [sortedCallouts]);

  const [updateCalloutsSortOrderMutation] = useUpdateCalloutsSortOrderMutation();

  return {
    callouts,
    groupedCallouts,
    canCreateCallout,
    canReadCallout,
    calloutNames,
    loading: calloutsLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  };
};

export default useCallouts;
