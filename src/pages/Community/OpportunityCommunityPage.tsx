import React, { FC } from 'react';
import { PageProps } from '../common';
import { useOpportunity } from '../../hooks';
import CommunityPage from './CommunityPage';

const OpportunityCommunityPage: FC<PageProps> = ({ paths }) => {
  const { opportunity, hubId } = useOpportunity();
  const communityId = opportunity?.community?.id;
  const opportunityId = opportunity?.id;

  return <CommunityPage paths={paths} hubId={hubId} communityId={communityId} opportunityId={opportunityId} />;
};
export default OpportunityCommunityPage;
