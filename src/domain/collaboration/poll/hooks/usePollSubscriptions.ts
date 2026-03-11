import {
  usePollVoteUpdatedSubscription,
  usePollOptionsChangedSubscription,
  PollDetailsFragmentDoc,
} from '@/core/apollo/generated/apollo-hooks';

type UsePollSubscriptionsParams = {
  pollId: string | undefined;
  skip?: boolean;
};

export const usePollSubscriptions = ({ pollId, skip = false }: UsePollSubscriptionsParams) => {
  const shouldSkip = skip || !pollId;

  usePollVoteUpdatedSubscription({
    variables: { pollID: pollId! },
    skip: shouldSkip,
    onData: ({ client, data: subscriptionData }) => {
      const poll = subscriptionData.data?.pollVoteUpdated.poll;
      if (!poll) {
        return;
      }
      client.cache.writeFragment({
        id: client.cache.identify({ __typename: 'Poll', id: poll.id }),
        fragment: PollDetailsFragmentDoc,
        fragmentName: 'PollDetails',
        data: poll,
      });
    },
  });

  usePollOptionsChangedSubscription({
    variables: { pollID: pollId! },
    skip: shouldSkip,
    onData: ({ client, data: subscriptionData }) => {
      const poll = subscriptionData.data?.pollOptionsChanged.poll;
      if (!poll) {
        return;
      }
      client.cache.writeFragment({
        id: client.cache.identify({ __typename: 'Poll', id: poll.id }),
        fragment: PollDetailsFragmentDoc,
        fragmentName: 'PollDetails',
        data: poll,
      });
    },
  });
};
