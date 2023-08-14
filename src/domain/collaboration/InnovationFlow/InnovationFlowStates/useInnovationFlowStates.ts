import { useChallengeInnovationFlowStatesAllowedValuesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useOpportunityInnovationFlowStatesAllowedValuesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
interface UseInnovationFlowStatesParams {
  spaceId: string;
  challengeId: string | undefined;
  opportunityId: string | undefined;
}

export const INNOVATION_FLOW_STATES_TAGSET_NAME = 'flow-state';

interface UseInnovationFlowStatesProvided {
  innovationFlowStates: string[] | undefined;
  currentInnovationFlowState: string | undefined;
  canEdit: boolean;
}

const useInnovationFlowStates = ({
  challengeId,
  opportunityId,
}: UseInnovationFlowStatesParams): UseInnovationFlowStatesProvided => {
  if (!challengeId && !opportunityId) {
    throw new Error('You need to provide either challenge or opportunity id!');
  }

  let canEdit = false;
  const skipChallenge: boolean = !(challengeId && !opportunityId);
  const challengeFlowStates = useChallengeInnovationFlowStatesAllowedValuesQuery({
    variables: {
      challengeId: challengeId!,
    },
    skip: skipChallenge,
  });

  const opportunityFlowStates = useOpportunityInnovationFlowStatesAllowedValuesQuery({
    variables: {
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
    const myPrivilleges = flowStatesData?.space.challenge.innovationFlow?.authorization?.myPrivileges;
    canEdit = myPrivilleges?.includes(AuthorizationPrivilege.Update);
  }

  if (opportunityId) {
    flowStatesData = opportunityFlowStates.data;
    flowStatesTagset = flowStatesData?.space.opportunity.innovationFlow?.profile.tagsets?.find(
      tagset => tagset.name === INNOVATION_FLOW_STATES_TAGSET_NAME
    );
    currentInnovationFlowState = flowStatesData?.space.opportunity.innovationFlow?.lifecycle?.state;
    const myPrivilleges = flowStatesData?.space.opportunity.innovationFlow?.authorization?.myPrivileges;
    canEdit = myPrivilleges?.includes(AuthorizationPrivilege.Update);
  }

  const flowStates = flowStatesTagset?.allowedValues;

  return {
    innovationFlowStates: flowStates,
    currentInnovationFlowState,
    canEdit: canEdit,
  };
};

export default useInnovationFlowStates;
