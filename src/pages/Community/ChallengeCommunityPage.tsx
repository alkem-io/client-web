import React, { FC } from 'react';
import { PageProps } from '../common';
import { useChallenge } from '../../hooks';
import CommunityPageV2 from './CommunityPageV2';

const ChallengeCommunityPage: FC<PageProps> = ({ paths }) => {
  const { challenge, ecoverseId } = useChallenge();
  const communityId = challenge?.community?.id;
  const challengeId = challenge?.id;

  return <CommunityPageV2 paths={paths} ecoverseId={ecoverseId} communityId={communityId} challengeId={challengeId} />;
};
export default ChallengeCommunityPage;
