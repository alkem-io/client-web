import {
  refetchInnovationFlowSettingsQuery,
  useChallengeInnovationFlowEventMutation,
  useInnovationFlowSettingsQuery,
  useOpportunityInnovationFlowEventMutation,
  useUpdateCalloutFlowStateMutation,
  useUpdateCalloutsSortOrderMutation,
  useUpdateInnovationFlowMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';
import { INNOVATION_FLOW_STATES_TAGSET_NAME } from '../InnovationFlowStates/useInnovationFlowStates';
import { CalloutType, Tagset, UpdateProfileInput } from '../../../../core/apollo/generated/graphql-schema';
import { compact, uniq } from 'lodash';
import { sortCallouts } from '../utils/sortCallouts';
import { useMemo } from 'react';

interface useInnovationFlowSettingsProps extends CoreEntityIdTypes {}

const findFlowStateTagset = (tagsets: Tagset[] | undefined) =>
  tagsets?.find(tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME);

const findFlowState = (tagsets: Tagset[] | undefined) => {
  const tagset = findFlowStateTagset(tagsets);
  return tagset
    ? {
        tagsetId: tagset.id,
        currentState: tagset.tags[0],
        allowedValues: tagset.allowedValues,
      }
    : undefined;
};

export interface GrouppedCallout {
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

const useInnovationFlowSettings = ({
  spaceNameId,
  challengeNameId,
  opportunityNameId,
}: useInnovationFlowSettingsProps) => {
  const isChallenge = !opportunityNameId;

  const { data, loading: loadingData } = useInnovationFlowSettingsQuery({
    variables: {
      spaceNameId,
      challengeNameId,
      opportunityNameId,
      includeChallenge: isChallenge,
      includeOpportunity: !isChallenge,
    },
    fetchPolicy: 'network-only',
    skip: !spaceNameId || (!challengeNameId && !opportunityNameId),
  });

  const innovationFlow = data?.space.challenge?.innovationFlow ?? data?.space.opportunity?.innovationFlow;

  // Collaboration
  const collaboration = data?.space.challenge?.collaboration ?? data?.space.opportunity?.collaboration;
  const callouts = useMemo(
    () =>
      collaboration?.callouts
        ?.map<GrouppedCallout>(callout => ({
          id: callout.id,
          nameID: callout.nameID,
          profile: {
            displayName: callout.profile.displayName,
          },
          type: callout.type,
          activity: callout.activity,
          sortOrder: callout.sortOrder,
          flowState: findFlowState(callout.profile.tagsets),
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [collaboration?.callouts]
  );

  const flowStateAllowedValues = uniq(compact(callouts?.flatMap(callout => callout.flowState?.allowedValues))) ?? [];

  const [challengeEvent, { loading: loadingChallengeEvent }] = useChallengeInnovationFlowEventMutation({
    refetchQueries: [
      refetchInnovationFlowSettingsQuery({
        spaceNameId,
        challengeNameId,
        opportunityNameId,
        includeChallenge: isChallenge,
        includeOpportunity: !isChallenge,
      }),
    ],
  });

  const [opportunityEvent, { loading: loadingOpportunityEvent }] = useOpportunityInnovationFlowEventMutation({
    refetchQueries: [
      refetchInnovationFlowSettingsQuery({
        spaceNameId,
        challengeNameId,
        opportunityNameId,
        includeChallenge: isChallenge,
        includeOpportunity: !isChallenge,
      }),
    ],
  });

  const handleLifecycleNextEvent = async (nextEvent: string) => {
    if (!innovationFlow?.id) {
      return;
    }
    if (isChallenge) {
      await challengeEvent({
        variables: {
          eventName: nextEvent,
          innovationFlowID: innovationFlow?.id,
        },
      });
    } else {
      await opportunityEvent({
        variables: {
          eventName: nextEvent,
          innovationFlowID: innovationFlow?.id,
        },
      });
    }
  };

  const [updateInnovationFlow, { loading: loadingUpdateInnovationFlow }] = useUpdateInnovationFlowMutation();
  const handleUpdateInnovationFlowProfile = async (innovationFlowID: string, profileData: UpdateProfileInput) =>
    updateInnovationFlow({
      variables: {
        updateInnovationFlowData: {
          innovationFlowID,
          profileData,
        },
      },
      refetchQueries: [
        refetchInnovationFlowSettingsQuery({
          spaceNameId,
          challengeNameId,
          opportunityNameId,
          includeChallenge: isChallenge,
          includeOpportunity: !isChallenge,
        }),
      ],
    });

  const [updateCalloutFlowState, { loading: loadingUpdateCallout }] = useUpdateCalloutFlowStateMutation();
  const [updateCalloutsSortOrder, { loading: loadingSortOrder }] = useUpdateCalloutsSortOrderMutation();

  const handleUpdateCalloutFlowState = async (calloutId: string, newState: string, insertIndex: number) => {
    const callout = collaboration?.callouts?.find(({ id }) => id === calloutId);
    const flowStateTagset = callout && findFlowStateTagset(callout.profile.tagsets);
    if (!collaboration || !callout || !flowStateTagset) {
      return;
    }

    const { optimisticSortOrder, sortedCalloutIds } = sortCallouts({
      callouts,
      movedCallout: { id: calloutId, newState, insertIndex },
    });

    await updateCalloutFlowState({
      variables: {
        calloutId,
        flowStateTagsetId: flowStateTagset?.id,
        value: newState,
      },
      optimisticResponse: {
        updateCallout: {
          ...callout,
          sortOrder: optimisticSortOrder,
          profile: {
            ...callout.profile,
            tagsets: [
              {
                ...flowStateTagset,
                tags: [newState],
              },
            ],
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
      refetchQueries: [
        refetchInnovationFlowSettingsQuery({
          spaceNameId,
          challengeNameId,
          opportunityNameId,
          includeChallenge: isChallenge,
          includeOpportunity: !isChallenge,
        }),
      ],
    });
  };

  return {
    data: {
      innovationFlow,
      callouts,
      flowStateAllowedValues,
    },
    actions: {
      nextEvent: handleLifecycleNextEvent,
      updateInnovationFlowProfile: handleUpdateInnovationFlowProfile,
      updateCalloutFlowState: handleUpdateCalloutFlowState,
    },
    state: {
      loading: loadingData || loadingUpdateInnovationFlow || loadingUpdateCallout || loadingSortOrder,
      loadingLifecycleEvents: loadingChallengeEvent || loadingOpportunityEvent,
    },
  };
};

export default useInnovationFlowSettings;
