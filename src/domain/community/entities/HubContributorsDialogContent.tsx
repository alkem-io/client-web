import React, { FC } from 'react';
import { useHub } from '../../../hooks';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import { useHubCommunityContributorsQuery } from '../../../hooks/generated/graphql';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import useUserCardProps from '../utils/useUserCardProps';
import CommunityContributorsView from '../CommunityContributors/CommunityContributorsView';
import NoOrganizations from '../CommunityContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';

const HubContributorsDialogContent: FC<ContributorsDialogContentProps> = ({ dialogOpen }) => {
  const { hubId } = useHub();

  const { loading, memberUsers, memberOrganizations } = useCommunityContributors(
    useHubCommunityContributorsQuery,
    data => {
      const { memberUsers, memberOrganizations } = data?.hub.community ?? {};
      return {
        memberUsers,
        memberOrganizations,
      };
    },
    { hubId },
    !dialogOpen
  );

  return (
    <>
      <CommunityContributorsView
        organizations={useOrganizationCardProps(memberOrganizations)}
        users={useUserCardProps(memberUsers, hubId)}
        organizationsCount={memberOrganizations?.length}
        usersCount={memberUsers?.length}
        noOrganizationsView={<NoOrganizations type={'member'} />}
        loading={loading}
      />
    </>
  );
};
export default HubContributorsDialogContent;
