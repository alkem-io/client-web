import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePollOptionManagement } from './usePollOptionManagement';

const mockAddPollOption = vi.fn().mockResolvedValue({ data: {} });
const mockUpdatePollOption = vi.fn().mockResolvedValue({ data: {} });
const mockRemovePollOption = vi.fn().mockResolvedValue({ data: {} });
const mockReorderPollOptions = vi.fn().mockResolvedValue({ data: {} });

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAddPollOptionMutation: () => [mockAddPollOption, { loading: false }],
  useUpdatePollOptionMutation: () => [mockUpdatePollOption, { loading: false }],
  useRemovePollOptionMutation: () => [mockRemovePollOption, { loading: false }],
  useReorderPollOptionsMutation: () => [mockReorderPollOptions, { loading: false }],
}));

describe('usePollOptionManagement', () => {
  beforeEach(() => {
    mockAddPollOption.mockClear();
    mockUpdatePollOption.mockClear();
    mockRemovePollOption.mockClear();
    mockReorderPollOptions.mockClear();
  });

  test('addOption calls mutation with correct pollID and text', async () => {
    const { result } = renderHook(() => usePollOptionManagement({ pollId: 'poll-1' }));

    await act(async () => {
      await result.current.addOption('New Option');
    });

    expect(mockAddPollOption).toHaveBeenCalledWith({
      variables: { optionData: { pollID: 'poll-1', text: 'New Option' } },
    });
  });

  test('updateOption calls mutation with correct optionID and text', async () => {
    const { result } = renderHook(() => usePollOptionManagement({ pollId: 'poll-1' }));

    await act(async () => {
      await result.current.updateOption('opt-1', 'Updated Text');
    });

    expect(mockUpdatePollOption).toHaveBeenCalledWith({
      variables: { optionData: { pollID: 'poll-1', optionID: 'opt-1', text: 'Updated Text' } },
    });
  });

  test('removeOption calls mutation with correct optionID', async () => {
    const { result } = renderHook(() => usePollOptionManagement({ pollId: 'poll-1' }));

    await act(async () => {
      await result.current.removeOption('opt-1');
    });

    expect(mockRemovePollOption).toHaveBeenCalledWith({
      variables: { optionData: { pollID: 'poll-1', optionID: 'opt-1' } },
    });
  });

  test('reorderOptions calls mutation with full option ID list', async () => {
    const { result } = renderHook(() => usePollOptionManagement({ pollId: 'poll-1' }));

    await act(async () => {
      await result.current.reorderOptions(['opt-2', 'opt-1', 'opt-3']);
    });

    expect(mockReorderPollOptions).toHaveBeenCalledWith({
      variables: { optionData: { pollID: 'poll-1', optionIDs: ['opt-2', 'opt-1', 'opt-3'] } },
    });
  });
});
