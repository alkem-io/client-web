import React, { FC } from 'react';
import { PageProps } from '../common';
import { useEcoverse } from '../../hooks';
import CommunityPageV2 from './CommunityPageV2';

const EcoverseCommunityPage: FC<PageProps> = ({ paths }) => {
  const { ecoverse } = useEcoverse();
  const ecoverseId = ecoverse?.id || '';
  const communityId = ecoverse?.community?.id;

  return <CommunityPageV2 paths={paths} ecoverseId={ecoverseId} communityId={communityId} />;
};
export default EcoverseCommunityPage;
