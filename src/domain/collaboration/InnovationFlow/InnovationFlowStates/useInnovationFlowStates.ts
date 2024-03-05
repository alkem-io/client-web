import { useInnovationFlowDetailsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { InnovationFlowState } from '../InnovationFlow';

interface UseInnovationFlowStatesParams {
  collaborationId?: string;
  innovationFlowId?: string;
}

export const INNOVATION_FLOW_STATES_TAGSET_NAME = 'flow-state';

export interface UseInnovationFlowStatesProvided {
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  canEditInnovationFlow: boolean | undefined;
}

// TODO: Maybe refactor to allow only one of them, not both
const useInnovationFlowStates = ({
  innovationFlowId,
  collaborationId,
}: UseInnovationFlowStatesParams): UseInnovationFlowStatesProvided => {
  if (innovationFlowId && collaborationId) {
    throw new Error('Cannot provide both innovationFlowId and collaborationId');
  }
  const isCollaborationId = !!collaborationId;

  const { data } = useInnovationFlowDetailsQuery({
    variables: {
      collaborationId: collaborationId!,
      innovationFlowId: innovationFlowId!,
      includeCollaboration: isCollaborationId,
      includeInnovationFlow: !isCollaborationId
    },
    skip: !innovationFlowId && !collaborationId
  });

  const innovationFlow = isCollaborationId ? data?.lookup.collaboration?.innovationFlow : data?.lookup.innovationFlow;


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
