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

  const { contributors, loading } = useCommunityContributors(
    useOpportunityCommunityContributorsQuery,
    data => data?.hub.opportunity.community,
    {
      hubId,
      opportunityId,
    }
  );

  return (
    <CommunityPage entityTypeName="opportunity" paths={paths} hubId={hubId} communityId={communityId}>
      <CommunityContributorsSection resourceId={opportunityId} {...contributors} loading={loading} />
    </CommunityPage>
  );
};
export default OpportunityCommunityPage;
