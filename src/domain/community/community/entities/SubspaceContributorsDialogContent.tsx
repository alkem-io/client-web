import { useSubspaceCommunityAndRoleSetIdQuery } from '@/core/apollo/generated/apollo-hooks';
import RoleSetContributorTypesView from '../RoleSetContributors/RoleSetContributorTypesView';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import NoOrganizations from '../RoleSetContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import { RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';

const SubspaceContributorsDialogContent = ({ dialogOpen }: ContributorsDialogContentProps) => {
  const { journeyId } = useRouteResolver();

  const { data: subspaceData, loading } = useSubspaceCommunityAndRoleSetIdQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !dialogOpen || !journeyId,
  });
  const roleSetId = subspaceData?.lookup.space?.community.roleSet.id;

  const { usersByRole, organizationsByRole } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Member],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
  });
  const memberUsers = usersByRole[RoleName.Member] ?? [];
  const memberOrganizations = organizationsByRole[RoleName.Member] ?? [];

  return (
    <RoleSetContributorTypesView
      organizations={useOrganizationCardProps(memberOrganizations)}
      users={useUserCardProps(memberUsers)}
      organizationsCount={memberOrganizations?.length}
      usersCount={memberUsers?.length}
      noOrganizationsView={<NoOrganizations type={'member'} />}
      loading={loading}
    />
  );
};

export default SubspaceContributorsDialogContent;
