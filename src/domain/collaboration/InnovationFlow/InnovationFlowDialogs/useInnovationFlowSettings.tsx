import {
  refetchInnovationFlowSettingsQuery,
  useChallengeInnovationFlowEventMutation,
  useInnovationFlowSettingsQuery,
  useOpportunityInnovationFlowEventMutation,
  useUpdateCalloutFlowStateMutation,
  useUpdateInnovationFlowMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';
import { INNOVATION_FLOW_STATES_TAGSET_NAME } from '../InnovationFlowStates/useInnovationFlowStates';
import { Callout, Profile, UpdateProfileInput } from '../../../../core/apollo/generated/graphql-schema';
import { uniq } from 'lodash';

interface useInnovationFlowSettingsProps extends CoreEntityIdTypes {}

export interface GrouppedCallout extends Pick<Callout, 'id' | 'nameID' | 'type' | 'activity'> {
  profile: Pick<Profile, 'displayName'>;
  flowStateId: string | null;
  flowState: string | null;
  flowStateAllowedValues: string[];
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
    skip: !spaceNameId || (!challengeNameId && !opportunityNameId),
  });

  const innovationFlow = data?.space.challenge?.innovationFlow ?? data?.space.opportunity?.innovationFlow;

  // Collaboration
  const collaboration = data?.space.challenge?.collaboration ?? data?.space.opportunity?.collaboration;
  const callouts =
    collaboration?.callouts?.map<GrouppedCallout>(callout => ({
      id: callout.id,
      nameID: callout.nameID,
      profile: {
        displayName: callout.profile.displayName,
      },
      type: callout.type,
      activity: callout.activity,
      flowStateId:
        callout.profile.tagsets?.find(tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME)?.id ?? null,
      flowState:
        callout.profile.tagsets?.find(tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME)?.tags[0] ?? null,
      flowStateAllowedValues:
        callout.profile.tagsets?.find(tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME)?.allowedValues ??
        [],
    })) ?? [];

  const flowStateAllowedValues = uniq(callouts?.flatMap(callout => callout.flowStateAllowedValues)) ?? [];

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
  const handleUpdateCalloutFlowState = async (calloutId: string, flowStateTagsetId: string, value: string) =>
    updateCalloutFlowState({
      variables: {
        calloutId,
        flowStateTagsetId,
        value,
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
      loading: loadingData || loadingUpdateInnovationFlow || loadingUpdateCallout,
      loadingLifecycleEvents: loadingChallengeEvent || loadingOpportunityEvent,
    },
  };
};

export default useInnovationFlowSettings;
