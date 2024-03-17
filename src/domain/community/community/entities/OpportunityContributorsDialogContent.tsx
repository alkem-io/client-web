import React, { FC } from 'react';
import { useOpportunity } from '../../../journey/opportunity/hooks/useOpportunity';
import { useOpportunityCommunityContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import CommunityContributorsView from '../CommunityContributors/CommunityContributorsView';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import NoOrganizations from '../CommunityContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

const OpportunityContributorsDialogContent: FC<ContributorsDialogContentProps> = ({ dialogOpen }) => {
  const { opportunityId } = useOpportunity();

  const { spaceId } = useRouteResolver();

  const { loading, memberUsers, memberOrganizations } = useCommunityContributors(
    useOpportunityCommunityContributorsQuery,
    data => {
      const { memberUsers, memberOrganizations } = data?.space.opportunity.community || {};
      return { memberUsers, memberOrganizations };
    },
    {
      spaceId,
      opportunityId,
    },
    !dialogOpen
  );

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

export default OpportunityContributorsDialogContent;
