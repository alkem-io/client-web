import React, { FC } from 'react';
import { PageProps } from '../common';
import { useEcoverse } from '../../hooks';
import CommunityPage from './CommunityPage';

const EcoverseCommunityPage: FC<PageProps> = ({ paths }) => {
  const { ecoverse } = useEcoverse();
  const ecoverseId = ecoverse?.id || '';
  const communityId = ecoverse?.community?.id;

  return <CommunityPage paths={paths} ecoverseId={ecoverseId} communityId={communityId} />;
};
export default EcoverseCommunityPage;
