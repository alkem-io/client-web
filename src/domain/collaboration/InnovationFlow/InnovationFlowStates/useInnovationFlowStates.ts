import { useInnovationFlowDetailsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { InnovationFlowState } from '../InnovationFlow';

interface UseInnovationFlowStatesParams {
  innovationFlowId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

export interface UseInnovationFlowStatesProvided {
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  canEditInnovationFlow: boolean | undefined;
}

const useInnovationFlowStates = ({
  innovationFlowId,
}: UseInnovationFlowStatesParams): UseInnovationFlowStatesProvided => {
  const { data } = useInnovationFlowDetailsQuery({
    variables: {
      innovationFlowId: innovationFlowId!
    },
    skip: !innovationFlowId
  });

  const innovationFlow = data?.lookup.innovationFlow;


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
