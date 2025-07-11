import {
  refetchInnovationFlowSettingsQuery,
  useInnovationFlowSettingsQuery,
  useUpdateCalloutFlowStateMutation,
  useUpdateCalloutsSortOrderMutation,
  useUpdateInnovationFlowMutation,
  useUpdateInnovationFlowSelectedStateMutation,
  useUpdateInnovationFlowStateMutation,
  useCreateStateOnInnovationFlowMutation,
  useDeleteStateOnInnovationFlowMutation,
  useUpdateInnovationFlowStatesSortOrderMutation,
  useUpdateCollaborationFromSpaceTemplateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CreateStateOnInnovationFlowInput,
  DeleteStateOnInnovationFlowInput,
  UpdateProfileInput,
} from '@/core/apollo/generated/graphql-schema';
import { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';
import { sortCallouts } from '../utils/sortCallouts';
import { useMemo } from 'react';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

type useInnovationFlowSettingsProps = {
  collaborationId: string | undefined;
  skip?: boolean;
};

export interface GroupedCallout {
  id: string;
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

const mapFlowState = (tagset: TagsetModel | undefined): GroupedCallout['flowState'] => {
  return tagset
    ? {
        tagsetId: tagset.id,
        currentState: tagset.tags[0],
        allowedValues: tagset.allowedValues,
      }
    : undefined;
};

const useInnovationFlowSettings = ({ collaborationId, skip }: useInnovationFlowSettingsProps) => {
  const ensurePresence = useEnsurePresence();
  const {
    data,
    loading: loadingData,
    refetch,
  } = useInnovationFlowSettingsQuery({
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
          activity: callout.activity,
          sortOrder: callout.sortOrder,
          flowState: mapFlowState(callout.classification?.flowState),
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [collaboration?.calloutsSet.callouts]
  );

  const [updateInnovationFlowCurrentState, { loading: changingState }] = useUpdateInnovationFlowSelectedStateMutation({
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
      refetchQueries: [
        refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! }),
        'CalloutsOnCalloutsSetUsingClassification',
      ],
    });
  };

  const [UpdateInnovationFlowStatesSortOrder] = useUpdateInnovationFlowStatesSortOrderMutation();
  const handleInnovationFlowStateOrder = async (displayName: string, sortOrder: number) => {
    const requiredInnovationFlow = ensurePresence(innovationFlow, 'Innovation Flow');
    const states = requiredInnovationFlow?.states ?? [];
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
    // TODO: get the IDS based on the nextStates array. So passing in the display names will not work.
    const orderedStateIDs: string[] = nextStates.map(state => state.displayName);
    await UpdateInnovationFlowStatesSortOrder({
      variables: {
        innovationFlowID: requiredInnovationFlow.id,
        stateIDs: orderedStateIDs,
      },
    });
  };

  /**
   * if stateBefore is undefined, the new state will be appended to the end of the list
   */
  const [CreateStateOnInnovationFlow] = useCreateStateOnInnovationFlowMutation();
  const handleCreateState = async (newState: InnovationFlowStateModel, stateBefore?: string) => {
    const requiredInnovationFlow = ensurePresence(innovationFlow, 'Innovation Flow');
    const states = requiredInnovationFlow.states;
    const stateBeforeIndex = !stateBefore ? -1 : states.findIndex(state => state.displayName === stateBefore);

    // TODO: determine the sort order to use, which will be either the last one (so do not specify it), or give an exact position
    const nextStates =
      stateBeforeIndex === -1
        ? [...states, newState] // if stateBefore not found or undefined, just append the newState to the end
        : [...states.slice(0, stateBeforeIndex + 1), newState, ...states.slice(stateBeforeIndex + 1)];

    if (nextStates.length > requiredInnovationFlow.settings.maximumNumberOfStates) {
      throw new Error('Maximum number of states reached.');
    }
    const stateData: CreateStateOnInnovationFlowInput = {
      innovationFlowID: requiredInnovationFlow.id,
      displayName: newState.displayName,
      description: newState.description,
      settings: newState.settings,
    };

    await CreateStateOnInnovationFlow({
      variables: {
        stateData,
      },
    });
  };

  const [DeleteStateOnInnovationFlow] = useDeleteStateOnInnovationFlowMutation();
  const handleDeleteState = async (stateID: string) => {
    const requiredInnovationFlow = ensurePresence(innovationFlow, 'Innovation Flow');
    const states = requiredInnovationFlow.states;
    if (states.length - 1 < requiredInnovationFlow.settings.minimumNumberOfStates) {
      throw new Error('Minimum number of states reached.');
    }
    const stateData: DeleteStateOnInnovationFlowInput = {
      innovationFlowID: requiredInnovationFlow.id,
      ID: stateID,
    };
    await DeleteStateOnInnovationFlow({
      variables: {
        stateData,
      },
    });
  };

  const [updateInnovationFlowState] = useUpdateInnovationFlowStateMutation();
  const handleEditState = async (oldState: InnovationFlowStateModel, newState: InnovationFlowStateModel) => {
    await updateInnovationFlowState({
      variables: {
        innovationFlowStateId: '', // TODO
        displayName: oldState.displayName,
        description: oldState.description,
        settings: oldState.settings,
      },
    });
    await Promise.all(
      callouts
        .filter(callout => callout.flowState?.currentState === oldState.displayName)
        .map((callout, index) => handleUpdateCalloutFlowState(callout.id, newState.displayName, index))
    );
    refetch({ collaborationId: collaborationId! });
  };

  // const [updateInnovationFlow] = useUpdateInnovationFlowStatesMutation();
  // const updateInnovationFlowStates = (nextStates: InnovationFlowStateModel[]) => {
  //   const innovationFlowId = ensurePresence(innovationFlow?.id, 'Innovation Flow Id');

  //   return updateInnovationFlow({
  //     variables: { innovationFlowId, states: nextStates },
  //     optimisticResponse: {
  //       updateInnovationFlow: {
  //         id: innovationFlowId,
  //         states: nextStates,
  //       },
  //     },
  //     update: cache => {
  //       const id = cache.identify({
  //         id: innovationFlowId,
  //         __typename: 'InnovationFlow',
  //       });

  //       cache.modify({
  //         id,
  //         fields: {
  //           states() {
  //             return nextStates;
  //           },
  //         },
  //       });
  //     },
  //     refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
  //     awaitRefetchQueries: true,
  //   });
  // };

  const [updateCollaborationFromSpaceTemplate] = useUpdateCollaborationFromSpaceTemplateMutation();
  const handleImportInnovationFlowFromSpaceTemplate = (spaceTemplateId: string, addCallouts?: boolean) => {
    const collaborationId = ensurePresence(collaboration?.id, 'Collaboration');

    return updateCollaborationFromSpaceTemplate({
      variables: {
        collaborationId,
        spaceTemplateId,
        addCallouts,
      },
      refetchQueries: [
        refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! }),
        'InnovationFlowDetails',
        'CalloutsOnCalloutsSetUsingClassification',
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
      importInnovationFlowFromSpaceTemplate: handleImportInnovationFlowFromSpaceTemplate,
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
