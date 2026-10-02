import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ add: vi.fn(), remove: vi.fn() }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAddReactionMutation: () => [harness.add],
  useRemoveReactionMutation: () => [harness.remove],
}));
vi.mock('@/core/utils/ensurePresence', () => ({
  default:
    () =>
    <T>(value: T) =>
      value,
}));

import useCommentReactionsMutations from './useCommentReactionsMutations';

describe('useCommentReactionsMutations (comments, forum, updates, calendar)', () => {
  it('adds and removes a reaction through the GraphQL mutations for the room', () => {
    const { result } = renderHook(() => useCommentReactionsMutations('room-1'));

    result.current.addReaction({ emoji: 'x', messageId: 'm1' });
    result.current.removeReaction('r1');

    expect(harness.add).toHaveBeenCalledWith({ variables: { emoji: 'x', messageId: 'm1', roomId: 'room-1' } });
    expect(harness.remove).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { reactionId: 'r1', roomId: 'room-1' } })
    );
  });
});
