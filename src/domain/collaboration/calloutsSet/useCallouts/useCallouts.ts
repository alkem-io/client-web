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
import { cloneDeep, groupBy } from 'lodash';
import { Tagset } from '@/domain/common/profile/Profile';
import useInnovationFlowStates, {
  INNOVATION_FLOW_STATES_TAGSET_NAME,
} from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import { getCalloutGroupNameValue } from '../../callout/utils/getCalloutGroupValue';
import { useCalloutsSetAuthorization } from '../authorization/useCalloutsSetAuthorization';

export type TypedCallout = Pick<Callout, 'id' | 'activity' | 'sortOrder'> & {
  authorization:
    | {
        myPrivileges?: AuthorizationPrivilege[];
      }
    | undefined;
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
      whiteboard?: WhiteboardDetailsFragment;
    };
    groupName: CalloutGroupName;
    contribution?: Pick<CalloutContribution, 'link' | 'post' | 'whiteboard'>;
    contributionPolicy: Pick<CalloutContributionPolicy, 'state'>;
    comments?: CommentsWithMessagesFragment | undefined;
  };

interface UseCalloutsParams {
  calloutsSetId: string | undefined;
  collaborationId?: string; // Do not leave this, this is a hack
  groupNames?: CalloutGroupName[];
  canSaveAsTemplate: boolean;
  entitledToSaveAsTemplate: boolean;
}

export interface OrderUpdate {
  (relatedCalloutIds: string[]): string[];
}

export interface UseCalloutsProvided {
  callouts: TypedCallout[] | undefined;
  groupedCallouts: Record<CalloutGroupName, TypedCallout[] | undefined>;
  canCreateCallout: boolean;
  canReadCalloutsSet: boolean;
  loading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
}

const UNGROUPED_CALLOUTS_GROUP = Symbol('undefined');
const CALLOUT_DISPLAY_LOCATION_TAGSET_NAME = 'callout-group'; // what to do with this ?

/**
 * If you need Callouts without a group, don't specify groupNames at all.
 */

const useCallouts = ({
  calloutsSetId,
  collaborationId,
  canSaveAsTemplate,
  entitledToSaveAsTemplate,
  groupNames,
}: UseCalloutsParams): UseCalloutsProvided => {
  const {
    canCreateCallout,
    canReadCalloutsSet,
    loading: authorizationLoading,
  } = useCalloutsSetAuthorization({ calloutsSetId });

  const { innovationFlowStates } = useInnovationFlowStates({ collaborationId });

  const variables = {
    calloutsSetId: calloutsSetId!,
    // groups: groupNames, // Disabled group-names server side filtering for now
  } as const;

  const {
    data: calloutsData,
    loading: calloutsLoading,
    refetch: refetchCallouts,
  } = useCalloutsQuery({
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !canReadCalloutsSet || !calloutsSetId,
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

  const calloutsSet = calloutsData?.lookup.calloutsSet;

  const callouts = useMemo(
    () =>
      calloutsSet?.callouts
        ?.map(cloneDeep) // Clone to be able to modify the callouts
        .filter(callout => {
          //!! Added client side filtering for group-names filtering by flow-state
          if (!groupNames || groupNames.length === 0) {
            return true;
          }
          if (!innovationFlowStates) {
            return false;
          }
          const validStates = innovationFlowStates.map(state => state.displayName);

          // Get the flow-state of the callout
          const [calloutFlowState] =
            callout.framing.profile.tagsets?.find(tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME)?.tags ??
            [];
          // Get the group-name tagset of the callout
          const calloutGroupNameTagset = callout.framing.profile.tagsets?.find(
            tagset => tagset.name === CALLOUT_DISPLAY_LOCATION_TAGSET_NAME
          );

          const groupNameToFlowStateMap = {
            [CalloutGroupName.Home]: validStates[0],
            [CalloutGroupName.Community]: validStates[1],
            [CalloutGroupName.Subspaces]: validStates[2],
            [CalloutGroupName.Knowledge]: validStates[3],
            [CalloutGroupName.Custom]: validStates[4],
            [CalloutGroupName.Contribute]: validStates[5],
          };

          for (const groupName of groupNames) {
            if (groupNameToFlowStateMap[groupName] === calloutFlowState) {
              if (calloutGroupNameTagset) {
                // Overwrite the group-name tagset with the one from the groupNames, HACK B-)
                calloutGroupNameTagset.tags = [groupName];
              }
              return true;
            }
          }
          return false;
        })

        .map(({ authorization, ...callout }) => {
          const draft = callout?.visibility === CalloutVisibility.Draft;
          const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
          const movable = calloutsSet.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
          const innovationFlowTagset = callout.framing.profile.tagsets?.find(
            tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
          );
          const groupNameTagset = callout.framing.profile.tagsets?.find(
            tagset => tagset.name === CALLOUT_DISPLAY_LOCATION_TAGSET_NAME
          );
          const flowStates = innovationFlowTagset?.tags;

          const result: TypedCallout = {
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
          };
          return result;
        }),
    [calloutsSet, canSaveAsTemplate, entitledToSaveAsTemplate, innovationFlowStates]
  );

  const submitCalloutsSortOrder = useCallback(
    (calloutIds: string[]) => {
      if (!calloutsSet) {
        throw new Error('CalloutsSet is not loaded yet.');
      }
      return updateCalloutsSortOrderMutation({
        variables: {
          calloutsSetID: calloutsSet.id,
          calloutIds,
        },
      });
    },
    [calloutsSet]
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
    canReadCalloutsSet,
    loading: calloutsLoading || authorizationLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  };
};

export default useCallouts;
