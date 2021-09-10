import React, { FC } from 'react';
import { useCommunityUpdateSubscriptionSelector } from '../../containers/community-updates/CommunityUpdates';
import { useChallengeCommunityMessagesQuery, useChallengeUserIdsQuery } from '../../hooks/generated/graphql';
import { User } from '../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../Community/CommunitySection';
import { Loading } from '../core';

interface ChallengeCommunitySectionProps extends CommunitySectionPropsExt {
  ecoverseId: string;
  challengeId: string;
}

export const ChallengeCommunitySection: FC<ChallengeCommunitySectionProps> = ({ ecoverseId, challengeId, ...rest }) => {
  const { data: usersQuery, loading: usersLoading } = useChallengeUserIdsQuery({
    variables: {
      ecoverseId,
      challengeId,
    },
    errorPolicy: 'all',
  });
  const { data, loading } = useChallengeCommunityMessagesQuery({
    variables: {
      ecoverseId: ecoverseId,
      challengeId: challengeId,
    },
    errorPolicy: 'ignore',
  });

  const updateMessages = useCommunityUpdateSubscriptionSelector(data?.ecoverse.challenge.community);
  // useCommunityUpdateSubscription<ChallengeCommunityMessagesQuery>(['ecoverse', 'challenge', 'community'], f =>
  //   updateQuery(prev => (data ? f(data) : prev))
  // );

  if (loading || usersLoading) return <Loading text={'Loading community data'} />;

  return (
    <CommunitySection
      users={(usersQuery?.ecoverse.challenge.community?.members as User[]) || []}
      updates={updateMessages}
      discussions={data?.ecoverse.challenge.community?.discussionRoom?.messages}
      {...rest}
    />
  );
};
export default ChallengeCommunitySection;
