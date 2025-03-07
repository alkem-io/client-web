import {
  refetchInnovationFlowSettingsQuery,
  useInnovationFlowSettingsQuery,
  useUpdateCalloutFlowStateMutation,
  useUpdateCalloutsSortOrderMutation,
  useUpdateInnovationFlowMutation,
  useUpdateInnovationFlowCurrentStateMutation,
  useUpdateInnovationFlowStatesMutation,
  useUpdateInnovationFlowSingleStateMutation,
  useUpdateCollaborationFromTemplateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutType,
  Tagset,
  UpdateProfileInput,
} from '@/core/apollo/generated/graphql-schema';
import { InnovationFlowState } from '../InnovationFlow';
import { sortCallouts } from '../utils/sortCallouts';
import { useMemo } from 'react';

type useInnovationFlowSettingsProps = {
  collaborationId: string | undefined;
  skip?: boolean;
};

export interface GroupedCallout {
  id: string;
  type: CalloutType;
  activity: number;
  sortOrder: number;
  profile: {
    displayName: string;
  };
  flowState:
    | {
        tagsetId: string;
        currentState: string | undefined;
        allowedValues: string[];
      }
    | undefined;
}

const mapFlowState = (tagset: Tagset | undefined): GroupedCallout['flowState'] => {
  return tagset
    ? {
        tagsetId: tagset.id,
        currentState: tagset.tags[0],
        allowedValues: tagset.allowedValues,
      }
    : undefined;
};

const useInnovationFlowSettings = ({ collaborationId, skip }: useInnovationFlowSettingsProps) => {
  const { data, loading: loadingData } = useInnovationFlowSettingsQuery({
    variables: {
      collaborationId: collaborationId!,
    },
    skip: skip || !collaborationId,
  });

  const collaboration = data?.lookup.collaboration;
  const calloutsSetId = collaboration?.calloutsSet?.id;
  const innovationFlow = collaboration?.innovationFlow;

  // Collaboration
  const callouts = useMemo(
    () =>
      collaboration?.calloutsSet.callouts
        ?.map<GroupedCallout>(callout => ({
          id: callout.id,
          profile: {
            displayName: callout.framing.profile.displayName,
          },
          type: callout.type,
          activity: callout.activity,
          sortOrder: callout.sortOrder,
          flowState: mapFlowState(callout.classification?.flowState),
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [collaboration?.calloutsSet.callouts]
  );

  const [updateInnovationFlowCurrentState, { loading: changingState }] = useUpdateInnovationFlowCurrentStateMutation({
    refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
  });
  const handleInnovationFlowCurrentStateChange = (newState: string) => {
    if (!innovationFlow) {
      return;
    }
    return updateInnovationFlowCurrentState({
      variables: {
        innovationFlowId: innovationFlow.id,
        currentState: newState,
      },
      refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
    });
  };

  const [updateInnovationFlowProfile, { loading: loadingUpdateInnovationFlow }] = useUpdateInnovationFlowMutation();
  const handleUpdateInnovationFlowProfile = async (innovationFlowId: string, profileData: UpdateProfileInput) => {
    return updateInnovationFlowProfile({
      variables: {
        input: {
          innovationFlowID: innovationFlowId,
          profileData,
        },
      },
      refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
    });
  };

  const [updateCalloutFlowState, { loading: loadingUpdateCallout }] = useUpdateCalloutFlowStateMutation();
  const [updateCalloutsSortOrder, { loading: loadingSortOrder }] = useUpdateCalloutsSortOrderMutation();

  const handleUpdateCalloutFlowState = async (calloutId: string, newState: string, insertIndex: number) => {
    const callout = collaboration?.calloutsSet.callouts?.find(({ id }) => id === calloutId);
    const flowStateTagset = callout?.classification?.flowState;
    if (!collaboration || !callout || !flowStateTagset) {
      return;
    }

    const flowStateTagsetId = flowStateTagset.id;
    const { optimisticSortOrder, sortedCalloutIds } = sortCallouts({
      callouts,
      movedCallout: { id: calloutId, newState, insertIndex },
    });

    await updateCalloutFlowState({
      variables: {
        calloutId,
        flowStateTagsetId,
        value: newState,
      },
      optimisticResponse: {
        updateCallout: {
          ...callout,
          sortOrder: optimisticSortOrder,
          classification: {
            id: callout.classification?.id || '',
            flowState: {
              ...flowStateTagset,
              tags: [newState],
            },
          },
        },
      },
      update: cache => {
        // Here we tamper with the cached sortOrder, but next call
        // will make sure that the order gets correctly saved to the server
        cache.modify({
          id: cache.identify({
            id: calloutId,
            __typename: 'Callout',
          }),
          fields: {
            sortOrder() {
              return optimisticSortOrder;
            },
          },
        });
      },
    });

    await updateCalloutsSortOrder({
      variables: {
        calloutsSetID: calloutsSetId!,
        calloutIds: sortedCalloutIds,
      },
      refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
    });
  };

  const handleInnovationFlowStateOrder = async (displayName: string, sortOrder: number) => {
    const states = innovationFlow?.states ?? [];
    // Remove the flowState from its current position
    const movedState = states.find(state => state.displayName === displayName);
    if (!movedState) {
      throw new Error('Moved state not found.');
    }
    const statesWithoutMovedState = states.filter(state => state.displayName !== displayName);

    // Insert the flowState at the new position
    const nextStates = [
      ...statesWithoutMovedState.slice(0, sortOrder),
      movedState,
      ...statesWithoutMovedState.slice(sortOrder),
    ];
    updateInnovationFlowStates(nextStates);
  };

  /**
   * if stateBefore is undefined, the new state will be appended to the end of the list
   */
  const handleCreateState = (newState: InnovationFlowState, stateBefore?: string) => {
    const states = innovationFlow?.states ?? [];
    const stateBeforeIndex = !stateBefore ? -1 : states.findIndex(state => state.displayName === stateBefore);

    const nextStates =
      stateBeforeIndex === -1
        ? [...states, newState] // if stateBefore not found or undefined, just append the newState to the end
        : [...states.slice(0, stateBeforeIndex + 1), newState, ...states.slice(stateBeforeIndex + 1)];

    return updateInnovationFlowStates(nextStates);
  };

  const [updateInnovationFlowState] = useUpdateInnovationFlowSingleStateMutation();
  const handleEditState = async (oldState: InnovationFlowState, newState: InnovationFlowState) => {
    const innovationFlowId = innovationFlow?.id;
    if (!innovationFlowId) {
      throw new Error('Innovation flow still not loaded.');
    }
    return updateInnovationFlowState({
      variables: {
        innovationFlowId,
        stateName: oldState.displayName,
        stateUpdatedData: newState,
      },
      refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
    });
  };

  const handleDeleteState = (stateDisplayName: string) => {
    const states = innovationFlow?.states ?? [];
    const nextStates = states.filter(state => state.displayName !== stateDisplayName);
    return updateInnovationFlowStates(nextStates);
  };

  const [updateInnovationFlow] = useUpdateInnovationFlowStatesMutation();
  const updateInnovationFlowStates = (nextStates: InnovationFlowState[]) => {
    const innovationFlowId = innovationFlow?.id;
    if (!innovationFlowId) {
      throw new Error('Innovation flow still not loaded.');
    }
    return updateInnovationFlow({
      variables: { innovationFlowId, states: nextStates },
      optimisticResponse: {
        updateInnovationFlow: {
          id: innovationFlowId,
          states: nextStates,
        },
      },
      update: cache => {
        const id = cache.identify({
          id: innovationFlowId,
          __typename: 'InnovationFlow',
        });

        cache.modify({
          id,
          fields: {
            states() {
              return nextStates;
            },
          },
        });
      },
      refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
      awaitRefetchQueries: true,
    });
  };

  const [applyCollaborationTemplate] = useUpdateCollaborationFromTemplateMutation();
  const handleImportCollaborationTemplate = (collaborationTemplateId: string, addCallouts?: boolean) => {
    const innovationFlowId = innovationFlow?.id;
    if (!innovationFlowId) {
      throw new Error('Innovation flow still not loaded.');
    }
    const collaborationId = collaboration?.id;
    if (!collaborationId) {
      throw new Error('Collaboration flow still not loaded.');
    }
    return applyCollaborationTemplate({
      variables: {
        collaborationId,
        collaborationTemplateId,
        addCallouts,
      },
      refetchQueries: [
        refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! }),
        'InnovationFlowDetails',
        'Callouts',
      ],
    });
  };

  return {
    data: {
      innovationFlow,
      callouts,
    },
    authorization: {
      canEditInnovationFlow: collaboration?.innovationFlow?.authorization?.myPrivileges?.includes(
        AuthorizationPrivilege.Update
      ),
    },
    actions: {
      updateInnovationFlowCurrentState: handleInnovationFlowCurrentStateChange,
      updateInnovationFlowProfile: handleUpdateInnovationFlowProfile,
      updateInnovationFlowStateOrder: handleInnovationFlowStateOrder,
      updateCalloutFlowState: handleUpdateCalloutFlowState,
      importCollaborationTemplate: handleImportCollaborationTemplate,
      createState: handleCreateState,
      editState: handleEditState,
      deleteState: handleDeleteState,
    },
    state: {
      loading: loadingData || loadingUpdateInnovationFlow || loadingUpdateCallout || loadingSortOrder,
      changingState,
    },
  };
};

export default useInnovationFlowSettings;
