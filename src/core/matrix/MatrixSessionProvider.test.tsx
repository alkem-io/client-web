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
    platformOrigin: { value: 'https://alkem.io' as string | undefined },
  };
  return harnessState;
});

vi.mock('./sessionController', () => ({
  establishSession: harness.establishSession,
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: harness.actorId.value ? { id: harness.actorId.value } : undefined }),
}));

vi.mock('@/domain/platform/routes/usePlatformOrigin', () => ({
  default: () => harness.platformOrigin.value,
}));

describe('MatrixSession', () => {
  beforeEach(() => {
    harness.establishSession.mockClear();
    harness.signals = [];
    harness.actorId.value = 'actor-1';
    harness.platformOrigin.value = 'https://alkem.io';
  });

  it('passes the platform origin to the session, and waits until it is known', () => {
    harness.platformOrigin.value = undefined;
    const { rerender } = render(<MatrixSession />);
    expect(harness.establishSession).not.toHaveBeenCalled();

    harness.platformOrigin.value = 'https://alkem.io';
    rerender(<MatrixSession />);
    expect(harness.establishSession).toHaveBeenCalledOnce();
    expect(harness.establishSession.mock.calls[0][1]).toMatchObject({ platformOrigin: 'https://alkem.io' });
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
