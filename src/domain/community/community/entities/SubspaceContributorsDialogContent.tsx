import { useSpaceRoleSetContributorTypesQuery } from '@/core/apollo/generated/apollo-hooks';
import RoleSetContributorTypesView from '../RoleSetContributors/RoleSetContributorTypesView';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import NoOrganizations from '../RoleSetContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';

const SubspaceContributorsDialogContent = ({ dialogOpen }: ContributorsDialogContentProps) => {
  const { journeyId } = useRouteResolver();

  const { loading, data } = useSpaceRoleSetContributorTypesQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !dialogOpen || !journeyId,
  });

  const { memberUsers, memberOrganizations } = data?.lookup.space?.community.roleSet ?? {};

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
