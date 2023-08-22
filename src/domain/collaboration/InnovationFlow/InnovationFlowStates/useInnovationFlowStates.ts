import { useChallengeInnovationFlowStatesAllowedValuesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useOpportunityInnovationFlowStatesAllowedValuesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

interface UseInnovationFlowStatesParams {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

export const INNOVATION_FLOW_STATES_TAGSET_NAME = 'flow-state';

export interface UseInnovationFlowStatesProvided {
  innovationFlowStates: string[] | undefined;
  currentInnovationFlowState: string | undefined;
  canEditInnovationFlow: boolean | undefined;
}

const useInnovationFlowStates = ({
  journeyId,
  journeyTypeName,
}: UseInnovationFlowStatesParams): UseInnovationFlowStatesProvided => {
  const { data: challengeFlowStatesData } = useChallengeInnovationFlowStatesAllowedValuesQuery({
    variables: { id: journeyId! },
    skip: !journeyId || journeyTypeName !== 'challenge',
  });

  const { data: opportunityFlowStatesData } = useOpportunityInnovationFlowStatesAllowedValuesQuery({
    variables: { id: journeyId! },
    skip: !journeyId || journeyTypeName !== 'opportunity',
  });

  const { lookup } = opportunityFlowStatesData ?? challengeFlowStatesData ?? {};

  const flowStatesTagset = lookup?.journey?.innovationFlow?.profile.tagsets?.find(
    tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
  );
  const currentInnovationFlowState = lookup?.journey?.innovationFlow?.lifecycle?.state;
  const myPrivilleges = lookup?.journey?.innovationFlow?.authorization?.myPrivileges;
  const canEditInnovationFlow = myPrivilleges?.includes(AuthorizationPrivilege.Update);
  const flowStates = flowStatesTagset?.allowedValues;

  return {
    innovationFlowStates: flowStates,
    currentInnovationFlowState,
    canEditInnovationFlow,
  };
};

export default useInnovationFlowStates;
