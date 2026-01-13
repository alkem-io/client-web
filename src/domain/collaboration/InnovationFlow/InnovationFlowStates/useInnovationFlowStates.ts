import { useInnovationFlowDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';

export interface UseInnovationFlowStatesProvided {
  innovationFlowStates: InnovationFlowStateModel[] | undefined;
  currentInnovationFlowState: InnovationFlowStateModel | undefined;
  currentInnovationFlowStateDisplayName: string | undefined;
  canEditInnovationFlow: boolean | undefined;
}

const useInnovationFlowStates = ({
  collaborationId,
}: {
  collaborationId: string | undefined;
}): UseInnovationFlowStatesProvided => {
  const { data } = useInnovationFlowDetailsQuery({
    variables: { collaborationId: collaborationId! },
    skip: !collaborationId,
  });

  const innovationFlow = data?.lookup.collaboration?.innovationFlow;
  const innovationFlowStates = innovationFlow?.states;

  const currentInnovationFlowState = innovationFlowStates?.find(state => state.id === innovationFlow?.currentState?.id);
  const currentInnovationFlowStateDisplayName = currentInnovationFlowState?.displayName;
  const myPrivileges = innovationFlow?.authorization?.myPrivileges;
  const canEditInnovationFlow = myPrivileges?.includes(AuthorizationPrivilege.Update);

  return {
    innovationFlowStates,
    currentInnovationFlowState,
    currentInnovationFlowStateDisplayName,
    canEditInnovationFlow,
  };
};

export default useInnovationFlowStates;
