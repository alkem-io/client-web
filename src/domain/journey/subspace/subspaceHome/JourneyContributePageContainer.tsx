import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '../../../collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { CalloutGroupName, SubspacePageSpaceFragment } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../JourneyTypeName';
import { useSubspacePageQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface JourneyContributePageContainerProvided {
  innovationFlowStates: UseInnovationFlowStatesProvided;
  callouts: UseCalloutsProvided;
  subspace?: SubspacePageSpaceFragment;
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
  const { data } = useSubspacePageQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !journeyId,
  });

  const collaborationId = data?.space?.collaboration.id;

  const innovationFlowStates = useInnovationFlowStates({
    collaborationId,
  });

  const callouts = useCallouts({
    journeyId,
    journeyTypeName,
    groupNames: [CalloutGroupName.Contribute_1, CalloutGroupName.Contribute_2],
  });

  return <>{children({ innovationFlowStates, callouts, subspace: data?.space })}</>;
};

export default JourneyContributePageContainer;
