import { useCallback, useTransition } from 'react';
import { useCastPollVoteMutation } from '@/core/apollo/generated/apollo-hooks';
import { PollDetailsModel } from '@/domain/collaboration/poll/models/PollModels';

type UsePollVoteParams = {
  pollId: string;
  poll: PollDetailsModel;
};

export const usePollVote = ({ pollId, poll }: UsePollVoteParams) => {
  const [isPending, startTransition] = useTransition();

  const [castPollVoteMutation, { loading: mutationLoading, error }] = useCastPollVoteMutation();

  const castVote = useCallback(
    (selectedOptionIds: string[]) => {
      startTransition(async () => {
        await castPollVoteMutation({
          variables: {
            voteData: {
              pollID: pollId,
              selectedOptionIDs: selectedOptionIds,
            },
          },
          optimisticResponse: {
            castPollVote: {
              __typename: 'Poll',
              id: poll.id,
              createdDate: new Date(),
              updatedDate: new Date(),
              title: poll.title,
              status: poll.status,
              settings: {
                __typename: 'PollSettings',
                ...poll.settings,
              },
              deadline: undefined,
              totalVotes: (poll.totalVotes ?? 0) + (poll.myVote ? 0 : 1),
              canSeeDetailedResults: true,
              options: poll.options.map(option => {
                const wasSelected = poll.myVote?.selectedOptions.some(o => o.id === option.id) ?? false;
                const isNowSelected = selectedOptionIds.includes(option.id);
                let voteCountDelta = 0;
                if (isNowSelected && !wasSelected) voteCountDelta = 1;
                if (!isNowSelected && wasSelected) voteCountDelta = -1;

                return {
                  __typename: 'PollOption' as const,
                  id: option.id,
                  createdDate: new Date(),
                  updatedDate: new Date(),
                  text: option.text,
                  sortOrder: option.sortOrder,
                  voteCount: option.voteCount != null ? option.voteCount + voteCountDelta : undefined,
                  votePercentage: option.votePercentage,
                  voters: option.voters?.map(v => ({
                    __typename: 'User' as const,
                    id: v.id,
                    profile: v.profile
                      ? {
                          __typename: 'Profile' as const,
                          id: v.profile.id,
                          displayName: v.profile.displayName,
                          visual: v.profile.visual
                            ? {
                                __typename: 'Visual' as const,
                                id: v.profile.visual.id,
                                uri: v.profile.visual.uri,
                              }
                            : undefined,
                        }
                      : undefined,
                  })),
                };
              }),
              myVote: {
                __typename: 'PollVote',
                id: poll.myVote?.id ?? 'optimistic-vote',
                createdDate: new Date(),
                updatedDate: new Date(),
                createdBy: '',
                selectedOptions: selectedOptionIds.map(id => ({
                  __typename: 'PollOption' as const,
                  id,
                })),
              },
            },
          },
        });
      });
    },
    [pollId, poll, castPollVoteMutation, startTransition]
  );

  return {
    castVote,
    loading: isPending || mutationLoading,
    error,
  };
};
