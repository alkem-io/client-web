import {
  refetchInnovationFlowSettingsQuery,
  useInnovationFlowSettingsQuery,
  useUpdateCalloutFlowStateMutation,
  useUpdateCalloutsSortOrderMutation,
  useUpdateInnovationFlowMutation,
  useUpdateInnovationFlowSelectedStateMutation,
  useUpdateInnovationFlowStatesMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutType,
  Tagset,
  UpdateProfileInput,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutDisplayLocationValuesMap } from '../../callout/CalloutsInContext/CalloutsGroup';
import { sortCallouts } from '../utils/sortCallouts';
import { useMemo } from 'react';

interface useInnovationFlowSettingsProps {
  collaborationId: string | undefined;
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

const getCalloutDisplayLocation = (tagset: Tagset | undefined) => {
  return tagset?.tags[0] as CalloutDisplayLocationValuesMap;
};

const useInnovationFlowSettings = ({ collaborationId }: useInnovationFlowSettingsProps) => {
  const { data, loading: loadingData } = useInnovationFlowSettingsQuery({
    variables: { collaborationId: collaborationId! },
    skip: !collaborationId,
  });

  const collaboration = data?.lookup.collaboration;
  const innovationFlow = collaboration?.innovationFlow;

  // Collaboration
  const callouts = useMemo(
    () =>
      collaboration?.callouts
        ?.filter(
          callout =>
            getCalloutDisplayLocation(callout.framing.profile.calloutDisplayLocation) ===
            CalloutDisplayLocationValuesMap.ContributeRight
        )
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

  const [updateInnovationFlowSelectedState, { loading: changingState }] = useUpdateInnovationFlowSelectedStateMutation({
    refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
  });
  const handleInnovationFlowStateChange = async (newState: string) => {
    if (!innovationFlow) {
      return;
    }
    await updateInnovationFlowSelectedState({
      variables: {
        innovationFlowId: innovationFlow.id,
        selectedState: newState,
      },
    });
  };

  const [updateInnovationFlow, { loading: loadingUpdateInnovationFlow }] = useUpdateInnovationFlowMutation();
  const handleUpdateInnovationFlowProfile = async (innovationFlowId: string, profileData: UpdateProfileInput) =>
    updateInnovationFlow({
      variables: {
        updateInnovationFlowData: {
          innovationFlowID: innovationFlowId,
          profileData,
        },
      },
      refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
    });

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

  const [updateInnovationFlowStates] = useUpdateInnovationFlowStatesMutation();

  const handleInnovationFlowStateOrder = async (displayName: string, sortOrder: number) => {
    const innovationFlowId = innovationFlow?.id;
    if (!innovationFlowId) {
      throw new Error('Innovation flow still not loaded.');
    }
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
    return updateInnovationFlowStates({
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
      updateInnovationFlowState: handleInnovationFlowStateChange,
      updateInnovationFlowProfile: handleUpdateInnovationFlowProfile,
      updateInnovationFlowStateOrder: handleInnovationFlowStateOrder,
      updateCalloutFlowState: handleUpdateCalloutFlowState,
    },
    state: {
      loading: loadingData || loadingUpdateInnovationFlow || loadingUpdateCallout || loadingSortOrder,
      changingState,
    },
  };
};

export default useInnovationFlowSettings;
