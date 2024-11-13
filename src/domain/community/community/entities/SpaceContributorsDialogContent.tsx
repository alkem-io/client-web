import React, { FC } from 'react';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import { useSpaceCommunityContributorsQuery } from '@core/apollo/generated/apollo-hooks';
import useUserCardProps from '../utils/useUserCardProps';
import CommunityContributorsView from '../CommunityContributors/CommunityContributorsView';
import NoOrganizations from '../CommunityContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';

const SpaceContributorsDialogContent: FC<ContributorsDialogContentProps> = ({ dialogOpen }) => {
  const { spaceId, permissions } = useSpace();

  const { loading, data } = useSpaceCommunityContributorsQuery({
    variables: { spaceId },
    skip: !dialogOpen || !spaceId || !permissions.canRead,
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

export default SpaceContributorsDialogContent;
