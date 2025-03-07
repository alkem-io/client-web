import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import { UseCalloutsProvided } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import {
  AuthorizationPrivilege,
  RoleName,
  RoleSetContributorType,
  SpaceLevel,
  SubspacePageSpaceFragment,
} from '@/core/apollo/generated/graphql-schema';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useCanReadSpace, { SpaceReadAccess } from '@/domain/journey/space/graphql/queries/useCanReadSpace';
import useCalloutsOnCollaboration from '@/domain/collaboration/useCalloutsOnCollaboration';
import { ContributorViewProps } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';

interface SubspaceHomeContainerProvided {
  level: SpaceLevel | undefined;
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

  const space = data?.lookup.space;
  const collaboration = space?.collaboration;
  const collaborationId = collaboration?.id;

  const innovationFlow = useInnovationFlowStates({ collaborationId });

  const callouts = useCalloutsOnCollaboration({
    collaborationId,
  });

  const community = space?.community;
  const communityReadAccess = (community?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  const { organizations, users } = useRoleSetManager({
    roleSetId: community?.roleSet.id,
    relevantRoles: [RoleName.Lead],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
    fetchContributors: true,
  });

  return (
    <>
      {children({
        level: space?.level,
        innovationFlow,
        callouts,
        subspace: space,
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
