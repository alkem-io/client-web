import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useInnovationFlowStates, {
  UseInnovationFlowStatesProvided,
} from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import useCalloutsSet, {
  UseCalloutsSetProvided,
} from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import {
  AuthorizationPrivilege,
  RoleName,
  RoleSetContributorType,
  SpaceLevel,
  SubspacePageSpaceFragment,
} from '@/core/apollo/generated/graphql-schema';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { ContributorViewProps } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useCanReadSpace, { SpaceReadAccess } from '../../../journey/space/graphql/queries/useCanReadSpace';

interface SubspaceHomeContainerProvided {
  level: SpaceLevel | undefined;
  innovationFlow: UseInnovationFlowStatesProvided;
  calloutsSetProvided: UseCalloutsSetProvided;
  subspace?: SubspacePageSpaceFragment;
  communityReadAccess: boolean;
  communityId: string | undefined;
  spaceReadAccess: SpaceReadAccess;
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
  const calloutsSetId = collaboration?.calloutsSet.id;
  const collaborationId = collaboration?.id;

  const innovationFlow = useInnovationFlowStates({ collaborationId });

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets: [],
    canSaveAsTemplate: false,
    entitledToSaveAsTemplate: false,
    includeClassification: true,
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
        calloutsSetProvided: calloutsSetProvided,
        subspace: space,
        communityReadAccess,
        communityId: community?.id,
        spaceReadAccess,
        roleSet: {
          leadUsers: users,
          leadOrganizations: organizations,
        },
      })}
    </>
  );
};

export default SubspaceHomeContainer;
