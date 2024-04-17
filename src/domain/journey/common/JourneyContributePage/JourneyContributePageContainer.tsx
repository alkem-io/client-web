import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '../../../collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import useCollaborationIdentity from '../CollaborationIdentity/useCollaborationIdentity';
import { JourneyTypeName } from '../../JourneyTypeName';

interface JourneyContributePageContainerProvided {
  collaborationId: string | undefined;
  innovationFlowStates: UseInnovationFlowStatesProvided;
  callouts: UseCalloutsProvided;
}

interface JourneyContributePageContainerProps extends SimpleContainerProps<JourneyContributePageContainerProvided> {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

const JourneyContributePageContainer = ({
  journeyId,
  journeyTypeName,
  children,
}: JourneyContributePageContainerProps) => {
  const { collaborationId } = useCollaborationIdentity({ journeyId, journeyTypeName });

  const innovationFlowStates = useInnovationFlowStates({
    collaborationId,
  });

  const callouts = useCallouts({
    journeyId,
    journeyTypeName,
    groupNames: [CalloutGroupName.Contribute],
  });

  return <>{children({ innovationFlowStates, callouts, collaborationId })}</>;
};

export default JourneyContributePageContainer;
