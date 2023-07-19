import { useChallengeInnovationFlowStatesAllowedValuesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useOpportunityInnovationFlowStatesAllowedValuesQuery } from '../../../../core/apollo/generated/apollo-hooks';
interface UseInnovationFlowStatesParams {
  spaceId: string;
  challengeId: string | undefined;
  opportunityId: string | undefined;
}

export const INNOVATION_FLOW_STATES_TAGSET_NAME = 'flow-state';

interface UseInnovationFlowStatesProvided {
  innovationFlowStates: string[] | undefined;
  currentInnovationFlowState: string | undefined;
}

const useInnovationFlowStates = ({
  spaceId,
  challengeId,
  opportunityId,
}: UseInnovationFlowStatesParams): UseInnovationFlowStatesProvided => {
  if (!challengeId && !opportunityId) {
    throw new Error('You need to provide either challenge or opportunity id!');
  }

  const skipChallenge: boolean = !(challengeId && !opportunityId);
  const challengeFlowStates = useChallengeInnovationFlowStatesAllowedValuesQuery({
    variables: {
      spaceId,
      challengeId: challengeId!,
    },
    skip: skipChallenge,
  });

  const opportunityFlowStates = useOpportunityInnovationFlowStatesAllowedValuesQuery({
    variables: {
      spaceId,
      opportunityId: opportunityId!,
    },
    skip: !opportunityId,
  });

  let flowStatesData, flowStatesTagset, currentInnovationFlowState;
  if (!skipChallenge) {
    flowStatesData = challengeFlowStates.data;
    flowStatesTagset = flowStatesData?.space.challenge.innovationFlow?.profile.tagsets?.find(
      tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
    );
    currentInnovationFlowState = flowStatesData?.space.challenge.innovationFlow?.lifecycle?.state;
  }

  if (opportunityId) {
    flowStatesData = opportunityFlowStates.data;
    flowStatesTagset = flowStatesData?.space.opportunity.innovationFlow?.profile.tagsets?.find(
      tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
    );
    currentInnovationFlowState = flowStatesData?.space.opportunity.innovationFlow?.lifecycle?.state;
  }

  const flowStates = flowStatesTagset?.allowedValues;

  return {
    innovationFlowStates: flowStates,
    currentInnovationFlowState,
  };
};

export default useInnovationFlowStates;
