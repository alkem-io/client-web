import React, { FC } from 'react';
import { PageProps } from '../common';
import { useChallenge } from '../../hooks';
import CommunityPage from './CommunityPage';

const ChallengeCommunityPage: FC<PageProps> = ({ paths }) => {
  const { challenge, ecoverseId } = useChallenge();
  const communityId = challenge?.community?.id;
  const challengeId = challenge?.id;

  return <CommunityPage paths={paths} ecoverseId={ecoverseId} communityId={communityId} challengeId={challengeId} />;
};
export default ChallengeCommunityPage;
