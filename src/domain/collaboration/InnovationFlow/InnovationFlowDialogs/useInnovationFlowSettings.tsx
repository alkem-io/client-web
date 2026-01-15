import {
  refetchInnovationFlowSettingsQuery,
  useInnovationFlowSettingsQuery,
  useUpdateCalloutFlowStateMutation,
  useUpdateCalloutsSortOrderMutation,
  useUpdateInnovationFlowMutation,
  useUpdateInnovationFlowCurrentStateMutation,
  useUpdateInnovationFlowStateMutation,
  useCreateStateOnInnovationFlowMutation,
  useDeleteStateOnInnovationFlowMutation,
  useUpdateInnovationFlowStatesSortOrderMutation,
  useUpdateCollaborationFromSpaceTemplateMutation,
  useSetDefaultCalloutTemplateOnInnovationFlowStateMutation,
  useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutContributionType,
  CalloutFramingType,
  UpdateProfileInput,
} from '@/core/apollo/generated/graphql-schema';
import { InnovationFlowStateFormValues } from '../InnovationFlowDragNDropEditor/InnovationFlowStateForm';
import { sortCallouts } from '../utils/sortCallouts';
import { useMemo } from 'react';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { sortBySortOrder } from '@/core/utils/sortBySortOrder';

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
  framing?: {
    type: CalloutFramingType;
  };
  settings?: {
    contribution?: {
      allowedTypes?: CalloutContributionType[];
    };
  };
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
            displayName: callout.framing?.profile.displayName,
          },
          framing: {
            type: callout.framing?.type,
          },
          settings: {
            contribution: {
              allowedTypes: callout.settings?.contribution?.allowedTypes,
            },
          },
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
  const handleInnovationFlowCurrentStateChange = (newStateId: string) => {
    if (!innovationFlow) {
      return;
    }
    return updateInnovationFlowCurrentState({
      variables: {
        innovationFlowId: innovationFlow.id,
        currentStateId: newStateId,
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

  const [updateInnovationFlowStatesSortOrder] = useUpdateInnovationFlowStatesSortOrderMutation();
  const handleInnovationFlowStateOrder = async (movedStateId: string, sortOrder: number) => {
    const requiredInnovationFlow = ensurePresence(innovationFlow, 'Innovation Flow');
    const states = requiredInnovationFlow.states;
    // Remove the flowState from its current position
    const movedState = states.find(state => state.id === movedStateId);
    if (!movedState) {
      throw new Error(`State with ID ${movedStateId} not found in the innovation flow.`);
    }
    const stateIdsWithoutMovedState = states.map(state => state.id).filter(stateId => stateId !== movedStateId);

    // Insert the flowState at the new position
    const stateIDs = [
      ...stateIdsWithoutMovedState.slice(0, sortOrder),
      movedStateId,
      ...stateIdsWithoutMovedState.slice(sortOrder),
    ];

    await updateInnovationFlowStatesSortOrder({
      variables: {
        innovationFlowID: requiredInnovationFlow.id,
        stateIDs,
      },
      refetchQueries: [
        refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! }),
        'CalloutsOnCalloutsSetUsingClassification',
      ],
    });
  };

  /**
   * if stateBefore is undefined, the new state will be appended to the end of the list
   */
  const [createStateOnInnovationFlow] = useCreateStateOnInnovationFlowMutation();
  const handleCreateState = async (newStateData: InnovationFlowStateFormValues, stateBeforeId?: string) => {
    const requiredInnovationFlow = ensurePresence(innovationFlow, 'Innovation Flow');
    const currentStates = requiredInnovationFlow.states.map(state => ({ id: state.id, sortOrder: state.sortOrder }));

    let calculatedSortOrder: number;
    if (stateBeforeId) {
      calculatedSortOrder = (currentStates.find(state => state.id === stateBeforeId)?.sortOrder ?? 0) + 1;
    } else if (currentStates.length > 0) {
      calculatedSortOrder = Math.max(...currentStates.map(state => state.sortOrder)) + 1;
    } else {
      calculatedSortOrder = 1;
    }
    newStateData.sortOrder = calculatedSortOrder;

    const newState = await createStateOnInnovationFlow({
      variables: {
        stateData: {
          innovationFlowID: requiredInnovationFlow.id,
          displayName: newStateData.displayName,
          description: newStateData.description,
          settings: newStateData.settings,
          sortOrder: newStateData.sortOrder,
        },
      },
      refetchQueries: [
        refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! }),
        'CalloutsOnCalloutsSetUsingClassification',
      ],
    });
    // In theory the new state create should have gone to the database with a correct sortOrder, but there are cases where
    // states have consecutive sortOrders and that produces collisions, so we call the sort mutation to ensure all states get a correct sortOrder
    const newStateId = ensurePresence(newState.data?.createStateOnInnovationFlow?.id, 'New State');
    let stateIdsSorted: string[] = currentStates.sort(sortBySortOrder).map(state => state.id);
    if (stateBeforeId) {
      const stateBeforeIndex = stateIdsSorted.indexOf(stateBeforeId);
      if (stateBeforeIndex === -1) {
        throw new Error(`State with ID ${stateBeforeId} not found in the innovation flow.`);
      }
      // Insert newStateId after stateBeforeId
      stateIdsSorted.splice(stateBeforeIndex + 1, 0, newStateId);
    } else {
      stateIdsSorted.push(newStateId);
    }

    await updateInnovationFlowStatesSortOrder({
      variables: {
        innovationFlowID: requiredInnovationFlow.id,
        stateIDs: stateIdsSorted,
      },
      refetchQueries: [
        refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! }),
        'CalloutsOnCalloutsSetUsingClassification',
      ],
    });
  };

  const [deleteStateOnInnovationFlow] = useDeleteStateOnInnovationFlowMutation();
  const handleDeleteState = async (stateId: string) => {
    const requiredInnovationFlow = ensurePresence(innovationFlow, 'Innovation Flow');
    const states = requiredInnovationFlow.states;
    if (states.length - 1 < requiredInnovationFlow.settings.minimumNumberOfStates) {
      throw new Error('Minimum number of states reached.');
    }
    await deleteStateOnInnovationFlow({
      variables: {
        stateData: {
          innovationFlowID: requiredInnovationFlow.id,
          ID: stateId,
        },
      },
      refetchQueries: [
        refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! }),
        'CalloutsOnCalloutsSetUsingClassification',
      ],
    });
  };

  const [updateInnovationFlowState] = useUpdateInnovationFlowStateMutation();
  const handleEditState = async (innovationFlowStateId: string, newState: InnovationFlowStateFormValues) => {
    const oldState = innovationFlow?.states.find(state => state.id === innovationFlowStateId);

    await updateInnovationFlowState({
      variables: {
        innovationFlowStateId,
        displayName: newState.displayName,
        description: newState.description ?? '',
        settings: newState.settings,
      },
    });

    if (oldState) {
      // TODO: This should be done by the server but currently it is not.
      // Probably soon we'll have callouts classified by state.id and not by state.displayName
      // so this won't be needed anymore
      await Promise.all(
        callouts
          .filter(callout => callout.flowState?.currentState === oldState.displayName)
          .map((callout, index) => handleUpdateCalloutFlowState(callout.id, newState.displayName, index))
      );
    }
    refetch({ collaborationId: collaborationId! });
  };

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
        refetchInnovationFlowSettingsQuery({ collaborationId }),
        'InnovationFlowDetails',
        'CalloutsOnCalloutsSetUsingClassification',
      ],
    });
  };

  const [setDefaultCalloutTemplate, { loading: loadingSetDefaultTemplate }] =
    useSetDefaultCalloutTemplateOnInnovationFlowStateMutation();
  const [removeDefaultCalloutTemplate, { loading: loadingRemoveDefaultTemplate }] =
    useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation();

  const handleSetDefaultTemplate = async (flowStateId: string, templateId: string | null) => {
    const collaborationId = ensurePresence(collaboration?.id, 'Collaboration');

    if (templateId) {
      await setDefaultCalloutTemplate({
        variables: {
          flowStateId,
          templateId,
        },
        refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId })],
      });
    } else {
      await removeDefaultCalloutTemplate({
        variables: {
          flowStateId,
        },
        refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId })],
      });
    }
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
      setDefaultTemplate: handleSetDefaultTemplate,
    },
    state: {
      loading:
        loadingData ||
        loadingUpdateInnovationFlow ||
        loadingUpdateCallout ||
        loadingSortOrder ||
        loadingSetDefaultTemplate ||
        loadingRemoveDefaultTemplate,
      changingState,
    },
  };
};

export default useInnovationFlowSettings;
