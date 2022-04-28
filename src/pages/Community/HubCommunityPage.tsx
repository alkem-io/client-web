import React, { FC } from 'react';
import { PageProps } from '../common';
import { useHub } from '../../hooks';
import CommunityPage from './CommunityPage';

const HubCommunityPage: FC<PageProps> = ({ paths }) => {
  const { hubId, communityId } = useHub();

  return <CommunityPage entityTypeName="hub" paths={paths} hubId={hubId} communityId={communityId} />;
};
export default HubCommunityPage;
