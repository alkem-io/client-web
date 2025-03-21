import { useInnovationFlowDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { InnovationFlowState } from '../InnovationFlow';

export interface UseInnovationFlowStatesProvided {
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
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

  const currentInnovationFlowState = innovationFlow?.currentState.displayName;
  const myPrivileges = innovationFlow?.authorization?.myPrivileges;
  const canEditInnovationFlow = myPrivileges?.includes(AuthorizationPrivilege.Update);

  return {
    innovationFlowStates: innovationFlow?.states,
    currentInnovationFlowState,
    canEditInnovationFlow,
  };
};

export default useInnovationFlowStates;
