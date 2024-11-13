import { useInnovationFlowDetailsQuery } from '@core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@core/apollo/generated/graphql-schema';
import { InnovationFlowState } from '../InnovationFlow';

interface UseInnovationFlowStatesParams {
  collaborationId: string | undefined;
}

export const INNOVATION_FLOW_STATES_TAGSET_NAME = 'flow-state';

export interface UseInnovationFlowStatesProvided {
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  canEditInnovationFlow: boolean | undefined;
}

const useInnovationFlowStates = ({
  collaborationId,
}: UseInnovationFlowStatesParams): UseInnovationFlowStatesProvided => {
  const { data } = useInnovationFlowDetailsQuery({
    variables: {
      collaborationId: collaborationId!,
    },
    skip: !collaborationId,
  });

  const innovationFlow = data?.lookup.collaboration?.innovationFlow;

  const currentInnovationFlowState = innovationFlow?.currentState.displayName;
  const myPrivilleges = innovationFlow?.authorization?.myPrivileges;
  const canEditInnovationFlow = myPrivilleges?.includes(AuthorizationPrivilege.Update);

  return {
    innovationFlowStates: innovationFlow?.states,
    currentInnovationFlowState,
    canEditInnovationFlow,
  };
};

export default useInnovationFlowStates;
