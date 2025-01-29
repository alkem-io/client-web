import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import RoleSetContributorTypesView from '../RoleSetContributors/RoleSetContributorTypesView';
import NoOrganizations from '../RoleSetContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';
import useRoleSetAdmin, { RELEVANT_ROLES } from '@/domain/access/RoleSetAdmin/useRoleSetAdmin';
import { RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

const SpaceContributorsDialogContent = ({ dialogOpen }: ContributorsDialogContentProps) => {
  const { roleSetId } = useSpace();

  const { usersByRole, organizationsByRole, loading } = useRoleSetAdmin({
    roleSetId,
    relevantRoles: RELEVANT_ROLES.Community,
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
    skip: !dialogOpen,
  });
  const memberOrganizations = organizationsByRole[RoleName.Member] ?? [];
  const memberUsers = usersByRole[RoleName.Member] ?? [];

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
