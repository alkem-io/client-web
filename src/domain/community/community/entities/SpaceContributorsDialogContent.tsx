import React, { FC } from 'react';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import { useSpaceCommunityContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import useUserCardProps from '../utils/useUserCardProps';
import CommunityContributorsView from '../CommunityContributors/CommunityContributorsView';
import NoOrganizations from '../CommunityContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';

const SpaceContributorsDialogContent: FC<ContributorsDialogContentProps> = ({ dialogOpen }) => {
  const { spaceId } = useSpace();

  const { loading, memberUsers, memberOrganizations } = useCommunityContributors(
    useSpaceCommunityContributorsQuery,
    data => {
      const { memberUsers, memberOrganizations } = data?.space.community ?? {};
      return {
        memberUsers,
        memberOrganizations,
      };
    },
    { spaceId },
    !dialogOpen
  );

  return (
    <>
      <CommunityContributorsView
        organizations={useOrganizationCardProps(memberOrganizations)}
        users={useUserCardProps(memberUsers)}
        organizationsCount={memberOrganizations?.length}
        usersCount={memberUsers?.length}
        noOrganizationsView={<NoOrganizations type={'member'} />}
        loading={loading}
      />
    </>
  );
};

export default SpaceContributorsDialogContent;
