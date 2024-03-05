import {
  refetchInnovationFlowSettingsQuery,
  useInnovationFlowSettingsQuery,
  useUpdateCalloutFlowStateMutation,
  useUpdateCalloutsSortOrderMutation,
  useUpdateInnovationFlowMutation,
  useUpdateInnovationFlowStateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CalloutType, Tagset, UpdateProfileInput } from '../../../../core/apollo/generated/graphql-schema';
import { compact, uniq } from 'lodash';
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

const useInnovationFlowSettings = ({ collaborationId }: useInnovationFlowSettingsProps) => {
  const { data, loading: loadingData } = useInnovationFlowSettingsQuery({
    variables: { collaborationId: collaborationId! },
    skip: !collaborationId
  });

  const collaboration = data?.lookup.collaboration;
  const innovationFlow = collaboration?.innovationFlow;

  // Collaboration
  const callouts = useMemo(
    () =>
      collaboration?.callouts
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

  const flowStateAllowedValues = uniq(compact(callouts?.flatMap(callout => callout.flowState?.allowedValues))) ?? [];

  const [updateInnovationFlowSelectedState, { loading: changingState }] = useUpdateInnovationFlowStateMutation({  // TODO: Not used?
    refetchQueries: [refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! })],
  });
  const handleInnovationFlowStateChange = async (newState: string) => {
    if (!innovationFlow) {
      return;
    }
    await updateInnovationFlowSelectedState({
      variables: {
        innovationFlowId: innovationFlow.id,
        selectedState: newState
      },
    });
  }

  const [updateInnovationFlow, { loading: loadingUpdateInnovationFlow }] = useUpdateInnovationFlowMutation();
  const handleUpdateInnovationFlowProfile = async (innovationFlowID: string, profileData: UpdateProfileInput) =>
    updateInnovationFlow({
      variables: {
        updateInnovationFlowData: {
          innovationFlowID,
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

  return {
    data: {
      innovationFlow,
      callouts,
      flowStateAllowedValues,
    },
    actions: {
      updateInnovationFlowState: handleInnovationFlowStateChange,
      updateInnovationFlowProfile: handleUpdateInnovationFlowProfile,
      updateCalloutFlowState: handleUpdateCalloutFlowState,
    },
    state: {
      loading: loadingData || loadingUpdateInnovationFlow || loadingUpdateCallout || loadingSortOrder,
      changingState,
    },
  };
};

export default useInnovationFlowSettings;
