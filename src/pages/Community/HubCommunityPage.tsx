import React, { FC } from 'react';
import { PageProps } from '../common';
import { useEcoverse } from '../../hooks';
import CommunityPage from './CommunityPage';

const EcoverseCommunityPage: FC<PageProps> = ({ paths }) => {
  const { hub } = useEcoverse();
  const hubId = hub?.id || '';
  const communityId = hub?.community?.id;

  return <CommunityPage paths={paths} hubId={hubId} communityId={communityId} />;
};
export default EcoverseCommunityPage;
