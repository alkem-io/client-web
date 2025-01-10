import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import { useSpaceRoleSetContributorTypesQuery } from '@/core/apollo/generated/apollo-hooks';
import useUserCardProps from '../utils/useUserCardProps';
import RoleSetContributorTypesView from '../RoleSetContributors/RoleSetContributorTypesView';
import NoOrganizations from '../RoleSetContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';

const SpaceContributorsDialogContent = ({ dialogOpen }: ContributorsDialogContentProps) => {
  const { spaceId, permissions } = useSpace();

  const { loading, data } = useSpaceRoleSetContributorTypesQuery({
    variables: { spaceId },
    skip: !dialogOpen || !spaceId || !permissions.canRead,
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

export default SpaceContributorsDialogContent;
