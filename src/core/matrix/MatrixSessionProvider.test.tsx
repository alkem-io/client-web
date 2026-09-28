import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatrixSession } from './MatrixSessionProvider';

const harness = vi.hoisted(() => {
  const harnessState = {
    signals: [] as AbortSignal[],
    // Never settles: establishment is still in flight whenever the component is torn down.
    establishSession: vi.fn((_actorId: string, options?: { signal?: AbortSignal }) => {
      if (options?.signal) {
        harnessState.signals.push(options.signal);
      }
      return new Promise(() => {});
    }),
    actorId: { value: 'actor-1' as string | undefined },
  };
  return harnessState;
});

vi.mock('./sessionController', () => ({
  establishSession: harness.establishSession,
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: harness.actorId.value ? { id: harness.actorId.value } : undefined }),
}));

describe('MatrixSession', () => {
  beforeEach(() => {
    harness.establishSession.mockClear();
    harness.signals = [];
    harness.actorId.value = 'actor-1';
  });

  it('establishes a session for the signed-in actor', () => {
    render(<MatrixSession />);
    expect(harness.establishSession).toHaveBeenCalledOnce();
    expect(harness.establishSession.mock.calls[0][0]).toBe('actor-1');
  });

  it('does nothing without a signed-in user', () => {
    harness.actorId.value = undefined;
    render(<MatrixSession />);
    expect(harness.establishSession).not.toHaveBeenCalled();
  });

  it('stops the session when the component unmounts, even while establishment is still running', () => {
    const { unmount } = render(<MatrixSession />);
    expect(harness.signals[0]?.aborted).toBe(false);
    unmount();
    expect(harness.signals[0]?.aborted).toBe(true);
  });

  it('stops the old session and establishes a new one when the actor changes', () => {
    const { rerender } = render(<MatrixSession />);
    expect(harness.establishSession).toHaveBeenCalledTimes(1);

    harness.actorId.value = 'actor-2';
    rerender(<MatrixSession />);

    expect(harness.signals[0]?.aborted).toBe(true);
    expect(harness.signals[1]?.aborted).toBe(false);
    expect(harness.establishSession).toHaveBeenCalledTimes(2);
    expect(harness.establishSession.mock.calls[1][0]).toBe('actor-2');
  });
});
