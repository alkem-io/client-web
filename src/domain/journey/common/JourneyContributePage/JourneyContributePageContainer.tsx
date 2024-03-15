import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '../../../collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyLocation } from '../../../../main/routing/urlBuilders';
import useCollaborationIdentity from '../CollaborationIdentity/useCollaborationIdentity';

interface JourneyContributePageContainerProvided extends JourneyLocation {
  collaborationId: string | undefined;
  innovationFlowStates: UseInnovationFlowStatesProvided;
  callouts: UseCalloutsProvided;
}

const JourneyContributePageContainer = ({ children }: SimpleContainerProps<JourneyContributePageContainerProvided>) => {
  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const { collaborationId } = useCollaborationIdentity({ spaceNameId, challengeNameId, opportunityNameId });

  const innovationFlowStates = useInnovationFlowStates({
    collaborationId,
  });

  const callouts = useCallouts({
    spaceNameId,
    challengeNameId,
    opportunityNameId,
    groupNames: [CalloutGroupName.ContributeLeft, CalloutGroupName.ContributeRight],
  });

  return (
    <>
      {children({ innovationFlowStates, callouts, spaceNameId, challengeNameId, opportunityNameId, collaborationId })}
    </>
  );
};

export default JourneyContributePageContainer;
