import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '../../../collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { SubspacePageSpaceFragment } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../JourneyTypeName';
import { useSubspacePageQuery } from '../../../../core/apollo/generated/apollo-hooks';
import useCanReadSpace, { SpaceReadAccess } from '../../common/authorization/useCanReadSpace';
import { useUserContext } from '../../../community/user';

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
  const { isAuthenticated } = useUserContext();

  const { data } = useSubspacePageQuery({
    variables: {
      spaceId: journeyId!,
      authorizedReadAccessCommunity: isAuthenticated,
    },
    skip: !journeyId || !spaceReadAccess.canReadSpace,
  });

  const collaborationId = data?.lookup.space?.collaboration.id;

  const innovationFlow = useInnovationFlowStates({ collaborationId });

  const callouts = useCallouts({
    journeyId,
    journeyTypeName,
  });

  return <>{children({ innovationFlow, callouts, subspace: data?.lookup.space, spaceReadAccess })}</>;
};

export default SubspaceHomeContainer;
