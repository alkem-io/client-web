import { useInnovationFlowDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';

export interface UseInnovationFlowStatesProvided {
  innovationFlowStates: InnovationFlowStateModel[] | undefined;
  currentInnovationFlowStateDisplayName: string | undefined;
  selectedInnovationFlowState: InnovationFlowStateModel | undefined;
  canEditInnovationFlow: boolean | undefined;
}

interface UseInnovationFlowStatesParams {
  collaborationId: string | undefined;
  selectedStateName?: string;
}

const useInnovationFlowStates = ({
  collaborationId,
  selectedStateName,
}: UseInnovationFlowStatesParams): UseInnovationFlowStatesProvided => {
  const { data } = useInnovationFlowDetailsQuery({
    variables: { collaborationId: collaborationId! },
    skip: !collaborationId,
  });

  const innovationFlow = data?.lookup.collaboration?.innovationFlow;
  const innovationFlowStates = innovationFlow?.states;

  const currentInnovationFlowState = innovationFlowStates?.find(state => state.id === innovationFlow?.currentState?.id);
  const currentInnovationFlowStateDisplayName = currentInnovationFlowState?.displayName;

  const selectedInnovationFlowState = selectedStateName
    ? innovationFlowStates?.find(state => state.displayName === selectedStateName)
    : currentInnovationFlowState;

  const myPrivileges = innovationFlow?.authorization?.myPrivileges;
  const canEditInnovationFlow = myPrivileges?.includes(AuthorizationPrivilege.Update);

  return {
    innovationFlowStates,
    currentInnovationFlowStateDisplayName,
    selectedInnovationFlowState,
    canEditInnovationFlow,
  };
};

export default useInnovationFlowStates;
