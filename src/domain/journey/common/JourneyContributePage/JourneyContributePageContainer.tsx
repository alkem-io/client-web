import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import useJourneyIdentity from '../JourneyIdentity/useJourneyIdentity';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '../../../collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyLocation } from '../../../../main/routing/urlBuilders';

interface JourneyContributePageContainerProvided extends JourneyLocation {
  innovationFlowStates: UseInnovationFlowStatesProvided;
  callouts: UseCalloutsProvided;
}

const JourneyContributePageContainer = ({ children }: SimpleContainerProps<JourneyContributePageContainerProvided>) => {
  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const { journeyId, journeyTypeName } = useJourneyIdentity({ spaceNameId, challengeNameId, opportunityNameId });

  const innovationFlowStates = useInnovationFlowStates({
    journeyId,
    journeyTypeName,
  });

  const callouts = useCallouts({
    spaceNameId,
    challengeNameId,
    opportunityNameId,
    displayLocations: [CalloutDisplayLocation.ContributeLeft, CalloutDisplayLocation.ContributeRight],
  });

  return <>{children({ innovationFlowStates, callouts, spaceNameId, challengeNameId, opportunityNameId })}</>;
};

export default JourneyContributePageContainer;
