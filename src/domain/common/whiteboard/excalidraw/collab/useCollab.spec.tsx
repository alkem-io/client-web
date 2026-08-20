import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ControlMessage } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import useCollab from './useCollab';

// AwarenessRouter subscribes to editor pointer/selection APIs we don't fake here.
vi.mock('./awarenessRouter', () => ({
  AwarenessRouter: class {
    destroy() {}
  },
}));

// Capture the provider's registered control handler so the test can drive control
// messages directly, without a live WebSocket / collab URL.
let controlHandler: ((message: ControlMessage) => void) | undefined;
vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider')>();
  class MockProvider {
    awareness = { setLocalStateField: vi.fn(), on: vi.fn(), off: vi.fn(), destroy: vi.fn() };
    ephemeralChannel = { send: vi.fn(), subscribe: vi.fn(() => () => {}) };
    on(event: string, handler: (m: ControlMessage) => void) {
      if (event === 'control') controlHandler = handler;
    }
    off() {}
    connect() {}
    destroy() {}
  }
  return { ...actual, UnifiedCollabProvider: MockProvider };
});

const fakeApi = {} as never;

describe('useCollab — update-rejected recovery routing', () => {
  afterEach(() => {
    controlHandler = undefined;
    vi.clearAllMocks();
  });

  it('calls onUpdateRejected when the server sends an update-rejected control', () => {
    const onUpdateRejected = vi.fn();
    const onRemoteSave = vi.fn();
    const { result } = renderHook(() =>
      useCollab({ username: 'Tester', onCloseConnection: () => {}, onRemoteSave, onUpdateRejected })
    );
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });

    controlHandler?.({ kind: 'update-rejected' });

    expect(onUpdateRejected).toHaveBeenCalledTimes(1);
    // a non-rejection control must NOT trigger recovery
    expect(onRemoteSave).not.toHaveBeenCalled();
    cleanup();
  });

  it('does NOT trigger recovery on a normal control (saved)', () => {
    const onUpdateRejected = vi.fn();
    const onRemoteSave = vi.fn();
    const { result } = renderHook(() =>
      useCollab({ username: 'Tester', onCloseConnection: () => {}, onRemoteSave, onUpdateRejected })
    );
    const cleanup = result.current[1]({ excalidrawApi: fakeApi, roomId: 'room-1' });

    controlHandler?.({ kind: 'saved' });

    expect(onRemoteSave).toHaveBeenCalledTimes(1);
    expect(onUpdateRejected).not.toHaveBeenCalled();
    cleanup();
  });
});
