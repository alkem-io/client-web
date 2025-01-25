import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import { UseCalloutsProvided } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import {
  AuthorizationPrivilege,
  RoleName,
  RoleSetContributorType,
  SubspacePageSpaceFragment,
} from '@/core/apollo/generated/graphql-schema';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useCanReadSpace, { SpaceReadAccess } from '@/domain/journey/common/authorization/useCanReadSpace';
import useCalloutsOnCollaboration from '@/domain/collaboration/useCalloutsOnCollaboration';
import { ContributorViewProps } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import useRoleSetAdmin from '@/domain/access/RoleSetAdmin/useRoleSetAdmin';

interface SubspaceHomeContainerProvided {
  innovationFlow: UseInnovationFlowStatesProvided;
  callouts: UseCalloutsProvided;
  subspace?: SubspacePageSpaceFragment;
  spaceReadAccess: SpaceReadAccess;
  communityReadAccess: boolean;
  communityId: string | undefined;
  roleSet: {
    leadUsers: ContributorViewProps[];
    leadOrganizations: ContributorViewProps[];
  };
}

interface SubspaceHomeContainerProps extends SimpleContainerProps<SubspaceHomeContainerProvided> {
  spaceId: string | undefined;
}

const SubspaceHomeContainer = ({ spaceId: journeyId, children }: SubspaceHomeContainerProps) => {
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

  const { organizations, users } = useRoleSetAdmin({
    roleSetId: community?.roleSet.id,
    relevantRoles: [RoleName.Lead],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
  });

  return (
    <>
      {children({
        innovationFlow,
        callouts,
        subspace: data?.lookup.space,
        spaceReadAccess,
        communityReadAccess,
        communityId: community?.id,
        roleSet: {
          leadUsers: users,
          leadOrganizations: organizations,
        },
      })}
    </>
  );
};

export default SubspaceHomeContainer;
