import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import useCallouts, { UseCalloutsProvided } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import { SubspacePageSpaceFragment } from '@/core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useCanReadSpace, { SpaceReadAccess } from '@/domain/journey/common/authorization/useCanReadSpace';

interface SubspaceHomeContainerProvided {
  innovationFlow: UseInnovationFlowStatesProvided;
  callouts: UseCalloutsProvided;
  subspace?: SubspacePageSpaceFragment;
  spaceReadAccess: SpaceReadAccess;
}

interface SubspaceHomeContainerProps extends SimpleContainerProps<SubspaceHomeContainerProvided> {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

const SubspaceHomeContainer = ({ journeyId, journeyTypeName, children }: SubspaceHomeContainerProps) => {
  const spaceReadAccess = useCanReadSpace({ spaceId: journeyId });

  const { data } = useSubspacePageQuery({
    variables: {
      spaceId: journeyId!,
      authorizedReadAccessCommunity: spaceReadAccess.canReadCommunity,
    },
    skip: !journeyId || !spaceReadAccess.canReadSpace,
  });

  const collaborationId = data?.lookup.space?.collaboration.id;
  const calloutsSetId = data?.lookup.space?.collaboration.calloutsSet?.id;

  const innovationFlow = useInnovationFlowStates({ collaborationId });

  const callouts = useCallouts({
    collaborationId,
    calloutsSetId,
    journeyTypeName,
    canReadCollaboration: true,
  });

  return <>{children({ innovationFlow, callouts, subspace: data?.lookup.space, spaceReadAccess })}</>;
};

export default SubspaceHomeContainer;
