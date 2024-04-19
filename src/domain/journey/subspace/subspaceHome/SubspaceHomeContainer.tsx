import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '../../../collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { SubspacePageSpaceFragment } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../JourneyTypeName';
import { useSubspacePageQuery } from '../../../../core/apollo/generated/apollo-hooks';
import useStateWithAsyncDefault from '../../../../core/utils/useStateWithAsyncDefault';
import { useMemo } from 'react';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';

interface SubspaceHomeContainerProvided {
  innovationFlow: UseInnovationFlowStatesProvided & {
    selectedInnovationFlowState: string | undefined;
    onSelectInnovationFlowState: (state: InnovationFlowState) => void;
  };
  callouts: UseCalloutsProvided;
  subspace?: SubspacePageSpaceFragment;
}

interface SubspaceHomeContainerProps extends SimpleContainerProps<SubspaceHomeContainerProvided> {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

const SubspaceHomeContainer = ({ journeyId, journeyTypeName, children }: SubspaceHomeContainerProps) => {
  const { data } = useSubspacePageQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !journeyId,
  });

  const collaborationId = data?.space?.collaboration.id;

  const innovationFlowStates = useInnovationFlowStates({ collaborationId });

  const [selectedInnovationFlowState, setSelectedInnovationFlowState] = useStateWithAsyncDefault(
    innovationFlowStates.currentInnovationFlowState
  );

  const innovationFlow = useMemo(() => {
    return {
      ...innovationFlowStates,
      selectedInnovationFlowState: selectedInnovationFlowState,
      onSelectInnovationFlowState: (state: InnovationFlowState) => setSelectedInnovationFlowState(state.displayName),
    };
  }, [innovationFlowStates, selectedInnovationFlowState]);

  const callouts = useCallouts({
    journeyId,
    journeyTypeName,
  });

  return <>{children({ innovationFlow, callouts, subspace: data?.space })}</>;
};

export default SubspaceHomeContainer;
