import { useSpaceCommunityContributorsQuery } from '@/core/apollo/generated/apollo-hooks';
import CommunityContributorsView from '../CommunityContributors/CommunityContributorsView';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import NoOrganizations from '../CommunityContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';

const SubspaceContributorsDialogContent = ({ dialogOpen }: ContributorsDialogContentProps) => {
  const { journeyId } = useRouteResolver();

  const { loading, data } = useSpaceCommunityContributorsQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !dialogOpen || !journeyId,
  });

  const { memberUsers, memberOrganizations } = data?.lookup.space?.community.roleSet ?? {};

  return (
    <CommunityContributorsView
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
