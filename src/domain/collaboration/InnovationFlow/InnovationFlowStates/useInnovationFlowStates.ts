import { useInnovationFlowStatesAllowedValuesQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface UseInnovationFlowStatesParams {
  spaceId: string;
  challengeId: string | undefined;
}

export const INNOVATION_FLOW_STATES_TAGSET_NAME = 'flow-state';

interface UseInnovationFlowStatesProvided {
  innovationFlowStates: string[] | undefined;
  currentInnovationFlowState: string | undefined;
}

const useInnovationFlowStates = ({
  spaceId,
  challengeId,
}: UseInnovationFlowStatesParams): UseInnovationFlowStatesProvided => {
  const { data: flowStatesData } = useInnovationFlowStatesAllowedValuesQuery({
    variables: {
      spaceId,
      challengeId: challengeId!,
    },
    skip: !challengeId,
  });

  const flowStatesTagset = flowStatesData?.space.challenge.innovationFlow?.profile.tagsets?.find(
    tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
  );

  const flowStates = flowStatesTagset?.allowedValues;

  const currentInnovationFlowState = flowStatesData?.space.challenge.innovationFlow?.lifecycle?.state;

  return {
    innovationFlowStates: flowStates,
    currentInnovationFlowState,
  };
};

export default useInnovationFlowStates;
