import React, { FC } from 'react';
import { useChallengeCommunityMessagesQuery } from '../../generated/graphql';
import CommunitySection, { CommunitySectionProps } from '../Community/CommunitySection';
import Loading from '../core/Loading';

interface ChallengeCommunitySectionProps extends CommunitySectionProps {
  ecoverseId: string;
  challengeId: string;
}

export const ChallengeCommunitySection: FC<ChallengeCommunitySectionProps> = ({
  updates: _updates,
  discussions: _discussions,
  ecoverseId,
  challengeId,
  ...rest
}) => {
  const { data, loading } = useChallengeCommunityMessagesQuery({
    variables: {
      ecoverseId: ecoverseId,
      challengeId: challengeId,
    },
  });

  if (loading) return <Loading text={'Loading updates'} />;

  return (
    <CommunitySection
      updates={data?.ecoverse.challenge.community?.updatesRoom.messages}
      discussions={data?.ecoverse.challenge.community?.discussionRoom.messages}
      {...rest}
    />
  );
};
export default ChallengeCommunitySection;
