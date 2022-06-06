import React, { FC } from 'react';
import { PageProps } from '../common';
import { useOpportunity } from '../../hooks';
import CommunityPage from './CommunityPage';
import { useOpportunityCommunityContributorsQuery } from '../../hooks/generated/graphql';
import CommunityContributorsSection from '../../domain/community/CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../../domain/community/CommunityContributors/useCommunityContributors';

const OpportunityCommunityPage: FC<PageProps> = ({ paths }) => {
  const { opportunity, hubId } = useOpportunity();
  const communityId = opportunity?.community?.id;
  const opportunityId = opportunity?.id;

  const { leadingContributors, memberContributors, loading } = useCommunityContributors(
    useOpportunityCommunityContributorsQuery,
    data => {
      const { leadUsers, memberUsers, leadOrganizations, memberOrganizations } = data?.hub.opportunity.community || {};
      return {
        leadingContributors: {
          users: leadUsers,
          organizations: leadOrganizations,
        },
        memberContributors: {
          users: memberUsers,
          organizations: memberOrganizations,
        },
      };
    },
    {
      hubId,
      opportunityId,
    }
  );

  return (
    <CommunityPage entityTypeName="opportunity" paths={paths} hubId={hubId} communityId={communityId}>
      <CommunityContributorsSection
        resourceId={opportunityId}
        {...leadingContributors}
        loading={loading}
        contributorType="leading"
      />
      <CommunityContributorsSection
        resourceId={opportunityId}
        {...memberContributors}
        loading={loading}
        contributorType="member"
      />
    </CommunityPage>
  );
};
export default OpportunityCommunityPage;
