import {
  refetchInnovationFlowSettingsQuery,
  useInnovationFlowSettingsQuery,
  useUpdateCalloutFlowStateMutation,
  useUpdateCalloutsSortOrderMutation,
  useUpdateInnovationFlowMutation,
  useUpdateInnovationFlowCurrentStateMutation,
  useUpdateInnovationFlowStatesMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutType,
  Tagset,
  UpdateProfileInput,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutDisplayLocationValuesMap } from '../../callout/CalloutsInContext/CalloutsGroup';
import { InnovationFlowState } from '../InnovationFlow';
import { sortCallouts } from '../utils/sortCallouts';
import { useMemo } from 'react';

interface useInnovationFlowSettingsProps {
  collaborationId: string | undefined;
  skip?: boolean;
}

export interface GroupedCallout {
  id: string;
  nameID: string;
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

// Only return callouts that are dependent on an innovation flow state.
// And for the moment that is the callouts that are in ContributeRight displayLocation
const isCalloutConnectedToFlowState = (callout: { framing: { profile: { calloutDisplayLocation?: Tagset } } }) => {
  const calloutDisplayLocation = callout.framing.profile.calloutDisplayLocation?.tags?.[0] as
    | CalloutDisplayLocationValuesMap
    | undefined;
  return calloutDisplayLocation === CalloutDisplayLocationValuesMap.ContributeRight;
};

const useInnovationFlowSettings = ({ collaborationId, skip }: useInnovationFlowSettingsProps) => {
  const { data, loading: loadingData } = useInnovationFlowSettingsQuery({
    variables: { collaborationId: collaborationId! },
    skip: skip || !collaborationId,
  });

  const collaboration = data?.lookup.collaboration;
  const innovationFlow = collaboration?.innovationFlow;

  // Collaboration
  const callouts = useMemo(
    () =>
      collaboration?.callouts
        ?.filter(isCalloutConnectedToFlowState)
        ?.map<GroupedCallout>(callout => ({
          id: callout.id,
          nameID: callout.nameID,
          profile: {
            displayName: callout.framing.profile.displayName,
          },
          type: callout.type,
          activity: callout.activity,
          sortOrder: callout.sortOrder,
          flowState: mapFlowState(callout.framing.profile.flowState),
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [collaboration?.callouts]
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
        updateInnovationFlowData: {
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
    const callout = collaboration?.callouts?.find(({ id }) => id === calloutId);
    const flowStateTagset = callout?.framing.profile.flowState;
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
          framing: {
            profile: {
              ...callout.framing.profile,
              flowState: {
                ...flowStateTagset,
                tags: [newState],
              },
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
        collaborationId: collaboration.id,
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

  const handleCreateState = (newState: InnovationFlowState, stateBefore?: string) => {
    const states = innovationFlow?.states ?? [];
    const stateBeforeIndex = !stateBefore ? -1 : states.findIndex(state => state.displayName === stateBefore);

    const nextStates =
      stateBeforeIndex === -1
        ? [...states, newState] // if stateBefore not found or undefined, just append the newState to the end
        : [...states.slice(0, stateBeforeIndex + 1), newState, ...states.slice(stateBeforeIndex + 1)];

    return updateInnovationFlowStates(nextStates);
  };

  const handleEditState = async (oldState: InnovationFlowState, newState: InnovationFlowState) => {
    const states = innovationFlow?.states ?? [];
    const oldStateIndex = states.findIndex(state => state.displayName === oldState.displayName);

    if (oldStateIndex === -1) {
      throw new Error('Old state not found.');
    }

    const nextStates = [...states.slice(0, oldStateIndex), newState, ...states.slice(oldStateIndex + 1)];

    // Callouts in this state should be moved to the new state if the displayName change
    // TODO: This should be handled by the backend, created task #3708
    const oldCallouts =
      collaboration?.callouts
        ?.filter(callout => callout.framing.profile.flowState?.tags[0] === oldState.displayName)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(callout => callout.id) ?? [];

    await updateInnovationFlowStates(nextStates);
    await Promise.all(
      oldCallouts.map((calloutId, index) => handleUpdateCalloutFlowState(calloutId, newState.displayName, index))
    );
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
