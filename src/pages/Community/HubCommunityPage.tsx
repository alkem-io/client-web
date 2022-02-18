import React, { FC } from 'react';
import { PageProps } from '../common';
import { useHub } from '../../hooks';
import CommunityPage from './CommunityPage';

const HubCommunityPage: FC<PageProps> = ({ paths }) => {
  const { hub } = useHub();
  const hubId = hub?.id || '';
  const communityId = hub?.community?.id;

  return <CommunityPage paths={paths} hubId={hubId} communityId={communityId} />;
};
export default HubCommunityPage;
