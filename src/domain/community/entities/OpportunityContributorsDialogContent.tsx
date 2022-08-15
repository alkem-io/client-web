import React, { FC } from 'react';
import { useOpportunity } from '../../../hooks';
import { useOpportunityCommunityContributorsQuery } from '../../../hooks/generated/graphql';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import CommunityContributorsView from '../CommunityContributors/CommunityContributorsView';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import NoOrganizations from '../CommunityContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';

const OpportunityContributorsDialogContent: FC<ContributorsDialogContentProps> = ({ dialogOpen }) => {
  const { hubId, opportunityId } = useOpportunity();

  const { loading, memberUsers, memberOrganizations } = useCommunityContributors(
    useOpportunityCommunityContributorsQuery,
    data => {
      const { memberUsers, memberOrganizations } = data?.hub.opportunity.community || {};
      return { memberUsers, memberOrganizations };
    },
    {
      hubId,
      opportunityId,
    },
    !dialogOpen
  );

  return (
    <CommunityContributorsView
      organizations={useOrganizationCardProps(memberOrganizations)}
      users={useUserCardProps(memberUsers, hubId)}
      organizationsCount={memberOrganizations?.length}
      usersCount={memberUsers?.length}
      noOrganizationsView={<NoOrganizations type={'member'} />}
      loading={loading}
    />
  );
};
export default OpportunityContributorsDialogContent;
