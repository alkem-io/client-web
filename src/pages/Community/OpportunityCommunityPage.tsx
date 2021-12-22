import React, { FC } from 'react';
import { PageProps } from '../common';
import { useOpportunity } from '../../hooks';
import CommunityPageV2 from './CommunityPageV2';

const OpportunityCommunityPage: FC<PageProps> = ({ paths }) => {
  const { opportunity, ecoverseId } = useOpportunity();
  const communityId = opportunity?.community?.id;
  const opportunityId = opportunity?.id;

  return (
    <CommunityPageV2 paths={paths} ecoverseId={ecoverseId} communityId={communityId} opportunityId={opportunityId} />
  );
};
export default OpportunityCommunityPage;
