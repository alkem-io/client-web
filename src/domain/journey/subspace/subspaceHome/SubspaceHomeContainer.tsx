import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import { UseCalloutsProvided } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import { AuthorizationPrivilege, SubspacePageSpaceFragment } from '@/core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useCanReadSpace, { SpaceReadAccess } from '@/domain/journey/common/authorization/useCanReadSpace';
import useCalloutsOnCollaboration from '@/domain/collaboration/useCalloutsOnCollaboration';

interface SubspaceHomeContainerProvided {
  innovationFlow: UseInnovationFlowStatesProvided;
  callouts: UseCalloutsProvided;
  subspace?: SubspacePageSpaceFragment;
  spaceReadAccess: SpaceReadAccess;
  communityReadAccess: boolean;
  communityId: string | undefined;
}

interface SubspaceHomeContainerProps extends SimpleContainerProps<SubspaceHomeContainerProvided> {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

const SubspaceHomeContainer = ({ journeyId, children }: SubspaceHomeContainerProps) => {
  const spaceReadAccess = useCanReadSpace({ spaceId: journeyId });

  const { data } = useSubspacePageQuery({
    variables: {
      spaceId: journeyId!,
      authorizedReadAccessCommunity: spaceReadAccess.canReadCommunity,
    },
    skip: !journeyId || !spaceReadAccess.canReadSpace,
  });

  const collaboration = data?.lookup.space?.collaboration;
  const collaborationId = collaboration?.id;

  const innovationFlow = useInnovationFlowStates({ collaborationId });

  const callouts = useCalloutsOnCollaboration({
    collaborationId,
  });

  const community = data?.lookup.space?.community;
  const communityReadAccess = (community?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  return (
    <>
      {children({
        innovationFlow,
        callouts,
        subspace: data?.lookup.space,
        spaceReadAccess,
        communityReadAccess,
        communityId: community?.id,
      })}
    </>
  );
};

export default SubspaceHomeContainer;
