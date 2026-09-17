import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatrixSessionProvider, useMatrixSessionContext } from './MatrixSessionProvider';

const harness = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  const stopSpy = vi.fn();
  type EstablishHooks = {
    onState?: (state: string) => void;
    onError?: (message: string) => void;
    onRooms?: unknown;
  };
  const harnessState = {
    stopSpy,
    lastHooks: undefined as EstablishHooks | undefined,
    establishSession: vi.fn(async (_actorId: string, hooks?: EstablishHooks) => {
      harnessState.lastHooks = hooks;
      return {
        machine: { state: () => 'idle', transition: () => true },
        stop: stopSpy,
      };
    }),
    admitted: { value: true },
    actorId: { value: 'actor-1' as string | undefined },
    opened: { value: false },
    listeners,
    notify: () => {
      harnessState.opened.value = true;
      for (const listener of listeners) {
        listener();
      }
      listeners.clear();
    },
  };
  return harnessState;
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

const StateProbe = () => <span data-testid="session-state">{useMatrixSessionContext().state}</span>;

const renderProvider = () =>
  render(
    <MatrixSessionProvider>
      <StateProbe />
    </MatrixSessionProvider>
  );

describe('MatrixSessionProvider', () => {
  beforeEach(() => {
    harness.establishSession.mockClear();
    harness.stopSpy.mockClear();
    harness.listeners.clear();
    harness.opened.value = false;
    harness.admitted.value = true;
    harness.actorId.value = 'actor-1';
    harness.lastHooks = undefined;
    delete (window as unknown as Record<string, unknown>).__alkemioMatrix;
  });

  it('does nothing at mount before messaging opens', () => {
    renderProvider();
    expect(harness.establishSession).not.toHaveBeenCalled();
  });

  it('never subscribes when the user is not admitted', () => {
    harness.admitted.value = false;
    renderProvider();
    harness.notify();
    expect(harness.establishSession).not.toHaveBeenCalled();
  });

  it('never subscribes without a signed-in user', () => {
    harness.actorId.value = undefined;
    renderProvider();
    harness.notify();
    expect(harness.establishSession).not.toHaveBeenCalled();
  });

  it('establishes exactly once when admitted and messaging opens', async () => {
    renderProvider();
    await act(async () => {
      harness.notify();
      harness.notify();
    });
    expect(harness.establishSession).toHaveBeenCalledOnce();
    expect(harness.establishSession.mock.calls[0][0]).toBe('actor-1');
  });

  it('establishes immediately when messaging was already open at mount', async () => {
    harness.opened.value = true;
    renderProvider();
    await act(async () => {});
    expect(harness.establishSession).toHaveBeenCalledOnce();
  });

  it('stops the session when the provider unmounts', async () => {
    const { unmount } = renderProvider();
    await act(async () => {
      harness.notify();
    });
    unmount();
    expect(harness.stopSpy).toHaveBeenCalledOnce();
  });

  it('stops the old session and establishes a new one when the actor changes', async () => {
    const { rerender } = renderProvider();
    await act(async () => {
      harness.notify();
    });
    expect(harness.establishSession).toHaveBeenCalledTimes(1);

    harness.actorId.value = 'actor-2';
    rerender(
      <MatrixSessionProvider>
        <StateProbe />
      </MatrixSessionProvider>
    );
    await act(async () => {});

    expect(harness.stopSpy).toHaveBeenCalledOnce();
    expect(harness.establishSession).toHaveBeenCalledTimes(2);
    expect(harness.establishSession.mock.calls[1][0]).toBe('actor-2');
  });

  it('reports failed when establishment rejects', async () => {
    harness.establishSession.mockRejectedValueOnce(new Error('boom'));
    renderProvider();
    await act(async () => {
      harness.notify();
    });
    expect(screen.getByTestId('session-state').textContent).toBe('failed');
  });

  describe('session diagnostics handle (FR-011, T024)', () => {
    const readHandle = () =>
      (window as unknown as { __alkemioMatrix?: { state: string; lastError?: string } }).__alkemioMatrix;

    it('is never assigned when the user is not admitted (flag off)', async () => {
      harness.admitted.value = false;
      renderProvider();
      await act(async () => {
        harness.notify();
      });
      expect(readHandle()).toBeUndefined();
    });

    it('is assigned for an admitted user at initialization, before messaging opens', () => {
      renderProvider();
      expect(readHandle()).toEqual({ state: 'idle', lastError: undefined });
    });

    it('reflects the controller state as it changes', async () => {
      renderProvider();
      await act(async () => {
        harness.notify();
      });
      await act(async () => {
        harness.lastHooks?.onState?.('ready');
      });

      expect(readHandle()?.state).toBe('ready');
      expect(screen.getByTestId('session-state').textContent).toBe('ready');
    });

    it('stores the last error redacted — no token substring is reachable through the handle', async () => {
      renderProvider();
      await act(async () => {
        harness.notify();
      });
      await act(async () => {
        harness.lastHooks?.onError?.('exchange failed: access_token=syt_super_secret rejected');
      });

      const handle = readHandle();
      expect(handle?.lastError).toContain('[REDACTED]');
      expect(JSON.stringify(handle)).not.toContain('syt_super_secret');
    });

    it('exposes no rooms observability and logs nothing to the console', async () => {
      const consoleSpy = vi.spyOn(console, 'info');
      renderProvider();
      await act(async () => {
        harness.notify();
      });

      expect(harness.lastHooks?.onRooms).toBeUndefined();
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
