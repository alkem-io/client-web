import { useCallback, useTransition } from 'react';
import { useCastPollVoteMutation, useRemovePollVoteMutation } from '@/core/apollo/generated/apollo-hooks';
import type { PollDetailsModel } from '@/domain/collaboration/poll/models/PollModels';

type UsePollVoteParams = {
  pollId: string;
  poll: PollDetailsModel;
};

export const usePollVote = ({ pollId, poll }: UsePollVoteParams) => {
  const [isPending, startTransition] = useTransition();

  const [castPollVoteMutation, { loading: mutationLoading, error }] = useCastPollVoteMutation();
  const [removePollVoteMutation, { loading: removeLoading, error: removeError }] = useRemovePollVoteMutation();

  const castVote = useCallback(
    (selectedOptionIds: string[]) => {
      const newTotalVotes = (poll.totalVotes ?? 0) + (poll.myVote ? 0 : 1);
      const now = new Date();

      return castPollVoteMutation({
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
            createdDate: now,
            updatedDate: now,
            title: poll.title,
            status: poll.status,
            settings: {
              __typename: 'PollSettings',
              ...poll.settings,
            },
            deadline: undefined,
            totalVotes: newTotalVotes,
            canSeeDetailedResults: poll.canSeeDetailedResults,
            options: poll.options.map(option => {
              const wasSelected = poll.myVote?.selectedOptions.some(o => o.id === option.id) ?? false;
              const isNowSelected = selectedOptionIds.includes(option.id);
              let voteCountDelta = 0;
              if (isNowSelected && !wasSelected) voteCountDelta = 1;
              if (!isNowSelected && wasSelected) voteCountDelta = -1;

              const newVoteCount = option.voteCount != null ? option.voteCount + voteCountDelta : undefined;

              return {
                __typename: 'PollOption' as const,
                id: option.id,
                createdDate: now,
                updatedDate: now,
                text: option.text,
                sortOrder: option.sortOrder,
                voteCount: newVoteCount,
                votePercentage:
                  newVoteCount != null && newTotalVotes > 0
                    ? Math.round((newVoteCount / newTotalVotes) * 100)
                    : option.votePercentage,
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
              createdDate: now,
              updatedDate: now,
              createdBy: '',
              selectedOptions: selectedOptionIds.map(id => ({
                __typename: 'PollOption' as const,
                id,
              })),
            },
          },
        },
      });
    },
    [pollId, poll, castPollVoteMutation]
  );

  const removeVote = useCallback(() => {
    startTransition(async () => {
      await removePollVoteMutation({
        variables: {
          pollId,
        },
        optimisticResponse: {
          removePollVote: {
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
            totalVotes: Math.max((poll.totalVotes ?? 1) - 1, 0),
            canSeeDetailedResults: poll.canSeeDetailedResults,
            options: poll.options.map(option => {
              const wasSelected = poll.myVote?.selectedOptions.some(o => o.id === option.id) ?? false;
              const newVoteCount = option.voteCount != null && wasSelected ? option.voteCount - 1 : option.voteCount;
              const newTotal = Math.max((poll.totalVotes ?? 1) - 1, 0);

              return {
                __typename: 'PollOption' as const,
                id: option.id,
                createdDate: new Date(),
                updatedDate: new Date(),
                text: option.text,
                sortOrder: option.sortOrder,
                voteCount: newVoteCount,
                votePercentage: newVoteCount != null && newTotal > 0 ? Math.round((newVoteCount / newTotal) * 100) : 0,
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
            myVote: undefined,
          },
        },
      });
    });
  }, [pollId, poll, removePollVoteMutation, startTransition]);

  return {
    castVote,
    removeVote,
    loading: isPending || mutationLoading || removeLoading,
    error: error || removeError,
  };
};
