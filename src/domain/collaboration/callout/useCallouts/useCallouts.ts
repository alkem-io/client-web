import {
  useCalloutsLazyQuery,
  useCalloutsQuery,
  useUpdateCalloutsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  Callout,
  CalloutGroupName,
  CalloutsQueryVariables,
  CalloutType,
  CalloutVisibility,
  WhiteboardDetailsFragment,
  CommentsWithMessagesFragment,
  CalloutContributionPolicy,
  CalloutContribution,
} from '@/core/apollo/generated/graphql-schema';
import { useCallback, useMemo } from 'react';
import { groupBy } from 'lodash';
import { Tagset } from '@/domain/common/profile/Profile';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';
import { useCollaborationAuthorizationEntitlements } from '@/domain/collaboration/authorization/useCollaborationAuthorization';
import { INNOVATION_FLOW_STATES_TAGSET_NAME } from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import { getCalloutGroupNameValue } from '../utils/getCalloutGroupValue';

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
  entitledToSaveAsTemplate: boolean;
  flowStates: string[] | undefined;
  groupName: CalloutGroupName;
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
    groupName: CalloutGroupName;
    contribution?: Pick<CalloutContribution, 'link' | 'post' | 'whiteboard'>;
    contributionPolicy: Pick<CalloutContributionPolicy, 'state'>;
    comments: CommentsWithMessagesFragmentWithCallout | undefined;
  };

interface UseCalloutsParams {
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
  journeyTypeName: JourneyTypeName;
  groupNames?: CalloutGroupName[];
  canReadCollaboration: boolean;
}

export interface OrderUpdate {
  (relatedCalloutIds: string[]): string[];
}

export interface UseCalloutsProvided {
  callouts: TypedCallout[] | undefined;
  groupedCallouts: Record<CalloutGroupName, TypedCallout[] | undefined>;
  canCreateCallout: boolean;
  canReadCallout: boolean;
  loading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
}

const UNGROUPED_CALLOUTS_GROUP = Symbol('undefined');
const CALLOUT_DISPLAY_LOCATION_TAGSET_NAME = 'callout-group';

/**
 * If you need Callouts without a group, don't specify groupNames at all.
 */

const useCallouts = ({
  collaborationId,
  calloutsSetId,
  journeyTypeName,
  canReadCollaboration,
  ...params
}: UseCalloutsParams): UseCalloutsProvided => {
  const {
    canCreateCallout,
    canReadCallout,
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
    loading: authorizationLoading,
  } = useCollaborationAuthorizationEntitlements({ collaborationId });

  const variables = {
    collaborationId: collaborationId!,
    groups: params.groupNames,
  } as const;

  const {
    data: calloutsData,
    loading: calloutsLoading,
    refetch: refetchCallouts,
  } = useCalloutsQuery({
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !canReadCollaboration || !collaborationId,
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

  const collaboration = calloutsData?.lookup.collaboration;

  const callouts = useMemo(
    () =>
      collaboration?.calloutsSet.callouts?.map(({ authorization, ...callout }) => {
        const draft = callout?.visibility === CalloutVisibility.Draft;
        const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
        const movable = collaboration.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
        const innovationFlowTagset = callout.framing.profile.tagsets?.find(
          tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
        );
        const groupNameTagset = callout.framing.profile.tagsets?.find(
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
          entitledToSaveAsTemplate,
          flowStates,
          groupName: getCalloutGroupNameValue(groupNameTagset?.tags),
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
          calloutsSetID: collaboration.calloutsSet.id,
          calloutIds,
        },
      });
    },
    [collaboration]
  );

  const sortedCallouts = useMemo(() => callouts?.sort((a, b) => a.sortOrder - b.sortOrder), [callouts]);

  const onCalloutsSortOrderUpdate = useCallback(
    (movedCalloutId: string) => {
      const flowState = callouts?.find(callout => callout.id === movedCalloutId)?.flowStates?.[0];
      const groupName = callouts?.find(callout => callout.id === movedCalloutId)?.groupName;
      const relatedCallouts = callouts?.filter(
        callout => (!flowState || callout.flowStates?.includes(flowState)) && callout.groupName === groupName
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
    return groupBy(sortedCallouts, callout => callout.groupName) as Record<
      CalloutGroupName | typeof UNGROUPED_CALLOUTS_GROUP,
      TypedCallout[] | undefined
    >;
  }, [sortedCallouts]);

  const [updateCalloutsSortOrderMutation] = useUpdateCalloutsSortOrderMutation();

  return {
    callouts,
    groupedCallouts,
    canCreateCallout,
    canReadCallout,
    loading: calloutsLoading || authorizationLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  };
};

export default useCallouts;
