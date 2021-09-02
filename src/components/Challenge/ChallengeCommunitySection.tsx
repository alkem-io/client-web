import { get, merge, setWith } from 'lodash';
import React, { FC } from 'react';
import {
  useChallengeCommunityMessagesQuery,
  useChallengeUserIdsQuery,
  useOnMessageReceivedSubscription,
} from '../../hooks/generated/graphql';
import { ChallengeCommunityMessagesQuery, User } from '../../models/graphql-schema';
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
  const { data, loading, updateQuery } = useChallengeCommunityMessagesQuery({
    variables: {
      ecoverseId: ecoverseId,
      challengeId: challengeId,
    },
    errorPolicy: 'ignore',
  });

  useOnMessageReceivedSubscription({
    shouldResubscribe: true,
    onSubscriptionData: options => {
      const subData = options.subscriptionData.data?.messageReceived;
      if (!subData) return;

      const discussionKey = 'discussionRoom';
      const updatesKey = 'updatesRoom';

      const update = (previous: ChallengeCommunityMessagesQuery, key: string) => {
        const room = get(previous, ['ecoverse', 'challenge', 'community', key]);
        if (room?.id === subData.roomId) {
          const result = {};
          setWith(
            result,
            ['ecoverse', 'challenge', 'community', key],
            {
              ...room,
              messages: [...room.messages, subData.message],
            },
            Object
          );

          return merge({}, previous, result);
        }

        return previous;
      };

      updateQuery(prev => (data ? update(update(data, discussionKey), updatesKey) : prev));
    },
  });

  if (loading || usersLoading) return <Loading text={'Loading community data'} />;

  return (
    <CommunitySection
      users={(usersQuery?.ecoverse.challenge.community?.members as User[]) || []}
      updates={data?.ecoverse.challenge.community?.updatesRoom?.messages}
      discussions={data?.ecoverse.challenge.community?.discussionRoom?.messages}
      {...rest}
    />
  );
};
export default ChallengeCommunitySection;
