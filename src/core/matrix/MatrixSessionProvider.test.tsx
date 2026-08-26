import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatrixSessionProvider } from './MatrixSessionProvider';

const harness = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  return {
    establishSession: vi.fn(async (_actorId: string) => ({
      machine: { state: () => 'idle', transition: () => true },
      stop: () => {},
    })),
    admitted: { value: true },
    actorId: { value: 'actor-1' as string | undefined },
    opened: { value: false },
    listeners,
    notify: () => {
      harness.opened.value = true;
      for (const listener of listeners) {
        listener();
      }
      listeners.clear();
    },
  };
});

vi.mock('./sessionController', () => ({
  establishSession: harness.establishSession,
  onMessagingOpened: (listener: () => void) => {
    if (harness.opened.value) {
      listener();
      return () => {};
    }
    harness.listeners.add(listener);
    return () => harness.listeners.delete(listener);
  },
  notifyMessagingOpened: harness.notify,
}));

vi.mock('./matrixConfig', () => ({
  isAdmitted: () => harness.admitted.value,
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: harness.actorId.value ? { id: harness.actorId.value } : undefined }),
}));

describe('MatrixSessionProvider', () => {
  beforeEach(() => {
    harness.establishSession.mockClear();
    harness.listeners.clear();
    harness.opened.value = false;
    harness.admitted.value = true;
    harness.actorId.value = 'actor-1';
  });

  it('does nothing at mount before messaging opens', () => {
    render(
      <MatrixSessionProvider>
        <span>child</span>
      </MatrixSessionProvider>
    );
    expect(harness.establishSession).not.toHaveBeenCalled();
  });

  it('never subscribes when the user is not admitted', () => {
    harness.admitted.value = false;
    render(
      <MatrixSessionProvider>
        <span>child</span>
      </MatrixSessionProvider>
    );
    harness.notify();
    expect(harness.establishSession).not.toHaveBeenCalled();
  });

  it('never subscribes without a signed-in user', () => {
    harness.actorId.value = undefined;
    render(
      <MatrixSessionProvider>
        <span>child</span>
      </MatrixSessionProvider>
    );
    harness.notify();
    expect(harness.establishSession).not.toHaveBeenCalled();
  });

  it('establishes exactly once when admitted and messaging opens', () => {
    render(
      <MatrixSessionProvider>
        <span>child</span>
      </MatrixSessionProvider>
    );
    harness.notify();
    harness.notify();
    expect(harness.establishSession).toHaveBeenCalledOnce();
    expect(harness.establishSession.mock.calls[0][0]).toBe('actor-1');
  });

  it('establishes immediately when messaging was already open at mount', () => {
    harness.opened.value = true;
    render(
      <MatrixSessionProvider>
        <span>child</span>
      </MatrixSessionProvider>
    );
    expect(harness.establishSession).toHaveBeenCalledOnce();
  });
});
