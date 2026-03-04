import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePollVote } from './usePollVote';
import { PollDetailsModel } from '@/domain/collaboration/poll/models/PollModels';

const mockCastPollVoteMutation = vi.fn().mockResolvedValue({ data: {} });

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCastPollVoteMutation: () => [mockCastPollVoteMutation, { loading: false, error: undefined }],
}));

const basePoll: PollDetailsModel = {
  id: 'poll-1',
  title: 'Test Poll',
  status: 'OPEN' as never,
  settings: {
    minResponses: 1,
    maxResponses: 1,
    resultsVisibility: 'VISIBLE' as never,
    resultsDetail: 'FULL' as never,
  },
  totalVotes: 5,
  canSeeDetailedResults: true,
  options: [
    { id: 'opt-1', text: 'Option A', sortOrder: 0, voteCount: 3, votePercentage: 60, voters: null },
    { id: 'opt-2', text: 'Option B', sortOrder: 1, voteCount: 2, votePercentage: 40, voters: null },
  ],
  myVote: null,
};

describe('usePollVote', () => {
  beforeEach(() => {
    mockCastPollVoteMutation.mockClear();
  });

  test('castVote calls mutation with correct pollID and selectedOptionIDs', async () => {
    const { result } = renderHook(() => usePollVote({ pollId: 'poll-1', poll: basePoll }));

    await act(async () => {
      result.current.castVote(['opt-1']);
    });

    expect(mockCastPollVoteMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          voteData: {
            pollID: 'poll-1',
            selectedOptionIDs: ['opt-1'],
          },
        },
      })
    );
  });

  test('optimistic response increments totalVotes for new vote', async () => {
    const { result } = renderHook(() => usePollVote({ pollId: 'poll-1', poll: basePoll }));

    await act(async () => {
      result.current.castVote(['opt-1']);
    });

    const optimistic = mockCastPollVoteMutation.mock.calls[0][0].optimisticResponse;
    expect(optimistic.castPollVote.totalVotes).toBe(6); // 5 + 1 (new vote)
  });

  test('optimistic response does not increment totalVotes for vote change', async () => {
    const pollWithVote: PollDetailsModel = {
      ...basePoll,
      myVote: { id: 'vote-1', selectedOptionIds: ['opt-1'] },
    };

    const { result } = renderHook(() => usePollVote({ pollId: 'poll-1', poll: pollWithVote }));

    await act(async () => {
      result.current.castVote(['opt-2']);
    });

    const optimistic = mockCastPollVoteMutation.mock.calls[0][0].optimisticResponse;
    expect(optimistic.castPollVote.totalVotes).toBe(5); // unchanged
  });

  test('optimistic response updates option vote counts correctly', async () => {
    const pollWithVote: PollDetailsModel = {
      ...basePoll,
      myVote: { id: 'vote-1', selectedOptionIds: ['opt-1'] },
    };

    const { result } = renderHook(() => usePollVote({ pollId: 'poll-1', poll: pollWithVote }));

    await act(async () => {
      result.current.castVote(['opt-2']);
    });

    const options = mockCastPollVoteMutation.mock.calls[0][0].optimisticResponse.castPollVote.options;
    expect(options[0].voteCount).toBe(2); // opt-1: 3 - 1
    expect(options[1].voteCount).toBe(3); // opt-2: 2 + 1
  });

  test('optimistic response sets myVote with selected options', async () => {
    const { result } = renderHook(() => usePollVote({ pollId: 'poll-1', poll: basePoll }));

    await act(async () => {
      result.current.castVote(['opt-1', 'opt-2']);
    });

    const myVote = mockCastPollVoteMutation.mock.calls[0][0].optimisticResponse.castPollVote.myVote;
    expect(myVote.selectedOptions).toEqual([
      { __typename: 'PollOption', id: 'opt-1' },
      { __typename: 'PollOption', id: 'opt-2' },
    ]);
  });
});
