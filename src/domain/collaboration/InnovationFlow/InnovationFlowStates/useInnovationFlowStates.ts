import { useInnovationFlowDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';

export interface UseInnovationFlowStatesProvided {
  innovationFlowStates: InnovationFlowStateModel[] | undefined;
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

  const currentInnovationFlowStateDisplayName = innovationFlowStates?.find(
    state => state.id === innovationFlow?.currentState?.id
  )?.displayName;
  const myPrivileges = innovationFlow?.authorization?.myPrivileges;
  const canEditInnovationFlow = myPrivileges?.includes(AuthorizationPrivilege.Update);

  return {
    innovationFlowStates,
    currentInnovationFlowStateDisplayName,
    canEditInnovationFlow,
  };
};

export default useInnovationFlowStates;
