import {
  useCalloutsLazyQuery,
  useCalloutsQuery,
  useUpdateCalloutsSortOrderMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  Callout,
  CalloutDisplayLocation,
  CalloutsQueryVariables,
  CalloutType,
  CalloutVisibility,
  WhiteboardDetailsFragment,
  CommentsWithMessagesFragment,
  ContributeTabPostFragment,
  CalloutContributionPolicy,
  CalloutContribution,
} from '../../../../core/apollo/generated/graphql-schema';
import { useCallback, useMemo } from 'react';
import { groupBy } from 'lodash';
import { Tagset } from '../../../common/profile/Profile';
import { getCalloutDisplayLocationValue } from '../utils/getCalloutDisplayLocationValue';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { useCollaborationAuthorization } from '../../authorization/useCollaborationAuthorization';
import { INNOVATION_FLOW_STATES_TAGSET_NAME } from '../../InnovationFlow/InnovationFlowStates/useInnovationFlowStates';

export type PostFragmentWithCallout = ContributeTabPostFragment & { calloutNameId: string };

export type WhiteboardFragmentWithCallout = WhiteboardDetailsFragment & { calloutNameId: string };

export type CommentsWithMessagesFragmentWithCallout = CommentsWithMessagesFragment & { calloutNameId: string };

export type TypedCallout = Pick<Callout, 'id' | 'nameID' | 'activity' | 'sortOrder'> & {
  authorization: {
    myPrivileges?: AuthorizationPrivilege[];
  };
  framing: {
    profile: {
      id: string;
      url: string;
      displayName: string;
    };
  };
  type: CalloutType;
  draft: boolean;
  editable: boolean;
  movable: boolean;
  canSaveAsTemplate: boolean;
  flowStates: string[] | undefined;
  displayLocation: CalloutDisplayLocation;
};

export type TypedCalloutDetails = TypedCallout &
  Pick<Callout, 'contributionDefaults'> & {
    framing: {
      profile: {
        id: string;
        displayName: string;
        description?: string;
        tagset?: Tagset;
        storageBucket: {
          id: string;
        };
      };
      whiteboard?: WhiteboardFragmentWithCallout;
    };
    displayLocation: CalloutDisplayLocation;
    contribution?: Pick<CalloutContribution, 'link' | 'post' | 'whiteboard'>;
    contributionPolicy: Pick<CalloutContributionPolicy, 'state'>;
    comments: CommentsWithMessagesFragmentWithCallout | undefined;
  };

interface UseCalloutsParams {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
  displayLocations?: CalloutDisplayLocation[];
}

export interface OrderUpdate {
  (relatedCalloutIds: string[]): string[];
}

export interface UseCalloutsProvided {
  callouts: TypedCallout[] | undefined;
  groupedCallouts: Record<CalloutDisplayLocation, TypedCallout[] | undefined>;
  canCreateCallout: boolean;
  canCreateCalloutFromTemplate: boolean;
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
const useCallouts = ({ journeyTypeName, ...params }: UseCalloutsParams): UseCalloutsProvided => {
  const {
    canReadCollaboration,
    canCreateCallout,
    canCreateCalloutFromTemplate,
    canReadCallout,
    canSaveAsTemplate,
    loading: authorizationLoading,
  } = useCollaborationAuthorization();

  const variables = {
    spaceId: params.journeyId,
    challengeId: params.journeyId,
    opportunityId: params.journeyId,
    includeSpace: journeyTypeName === 'space',
    includeChallenge: journeyTypeName === 'challenge',
    includeOpportunity: journeyTypeName === 'opportunity',
    displayLocations: params.displayLocations,
  } as const;

  const {
    data: calloutsData,
    loading: calloutsLoading,
    refetch: refetchCallouts,
  } = useCalloutsQuery({
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !canReadCollaboration || !params.journeyId,
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

  const collaboration = (calloutsData?.lookup.opportunity ?? calloutsData?.lookup.challenge ?? calloutsData?.space)
    ?.collaboration;

  const callouts = useMemo(
    () =>
      collaboration?.callouts?.map(({ authorization, ...callout }) => {
        const draft = callout?.visibility === CalloutVisibility.Draft;
        const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
        const movable = collaboration.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
        const innovationFlowTagset = callout.framing.profile.tagsets?.find(
          tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
        );
        const displayLocationTagset = callout.framing.profile.tagsets?.find(
          tagset => tagset.name === CALLOUT_DISPLAY_LOCATION_TAGSET_NAME
        );
        const flowStates = innovationFlowTagset?.tags;
        return {
          ...callout,
          framing: {
            profile: callout.framing.profile,
          },
          authorization,
          draft,
          editable,
          movable,
          canSaveAsTemplate,
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

  const calloutNames = useMemo(() => callouts?.map(c => c.framing.profile.displayName) ?? [], [callouts]);

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
    return groupBy(sortedCallouts, callout => callout.displayLocation) as Record<
      CalloutDisplayLocation | typeof UNGROUPED_CALLOUTS_GROUP,
      TypedCallout[] | undefined
    >;
  }, [sortedCallouts]);

  const [updateCalloutsSortOrderMutation] = useUpdateCalloutsSortOrderMutation();

  return {
    callouts,
    groupedCallouts,
    canCreateCallout,
    canCreateCalloutFromTemplate,
    canReadCallout,
    calloutNames,
    loading: calloutsLoading || authorizationLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  };
};

export default useCallouts;
