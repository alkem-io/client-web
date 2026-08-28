import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CollaborativeExcalidrawWrapper from './CollaborativeExcalidrawWrapper';

// Shared, hoisted so the module mocks can reach it.
const h = vi.hoisted(() => ({
  mountCount: { value: 0 },
  provideApiOnMounts: { value: 1 }, // how many mounts call onExcalidrawAPI (1 = a stuck replacement never re-provides)
  capturedOnUpdateRejected: { value: undefined as (() => void) | undefined },
  initialize: vi.fn(),
  cleanup: vi.fn(),
}));

// The lazy <Excalidraw> is replaced with a stub that calls onExcalidrawAPI on mount —
// but only for the first `provideApiOnMounts` mounts, letting a test simulate a
// replacement editor that never hands back an API (stuck / failed remount).
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', async () => {
  const React = await import('react');
  return {
    lazyWithGlobalErrorHandler: () => (props: { onExcalidrawAPI?: (api: unknown) => void }) => {
      React.useEffect(() => {
        h.mountCount.value += 1;
        if (h.mountCount.value <= h.provideApiOnMounts.value) {
          props.onExcalidrawAPI?.({ id: `api-${h.mountCount.value}` });
        }
      }, []);
      return null;
    },
  };
});

// useCollab: capture the wrapper's onUpdateRejected; initializeCollab returns a
// tracked cleanup so the test can prove the old provider is torn down.
vi.mock('./collab/useCollab', () => ({
  default: (opts: { onUpdateRejected?: () => void }) => {
    h.capturedOnUpdateRejected.value = opts.onUpdateRejected;
    return [
      null,
      h.initialize,
      {
        connecting: false,
        collaborating: true,
        mode: 'write',
        modeReason: null,
        isReadOnly: false,
        phase: 'live',
        access: 'readWrite',
        hasEverSynced: true,
        hasUnconfirmedLocalChanges: false,
      },
    ];
  },
}));

vi.mock('./useWhiteboardDefaults', () => ({ default: () => ({}) }));
vi.mock('@/core/utils/onlineStatus', () => ({ default: () => true }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { profile: { displayName: 'Tester' } } }),
}));
vi.mock('@/domain/shared/utils/useCombinedRefs', () => ({ useCombinedRefs: () => ({ current: null }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const renderWrapper = () =>
  render(
    <CollaborativeExcalidrawWrapper
      entities={{ whiteboard: { id: 'wb-1' }, assetAdapter: {} as never, lastSuccessfulSavedDate: undefined }}
      options={{}}
      actions={{}}
      renderDisconnectNotice={() => null}
    >
      {({ children }) => <>{children}</>}
    </CollaborativeExcalidrawWrapper>
  );

describe('CollaborativeExcalidrawWrapper — update-rejected recovery', () => {
  beforeEach(() => {
    h.mountCount.value = 0;
    h.provideApiOnMounts.value = 1;
    h.capturedOnUpdateRejected.value = undefined;
    h.initialize.mockReset().mockReturnValue(h.cleanup);
    h.cleanup.mockReset();
  });
  afterEach(() => vi.clearAllMocks());

  it('tears down the old provider AND remounts a fresh editor on update-rejected', () => {
    renderWrapper();
    // First mount provides an API → the collab effect initializes once.
    expect(h.initialize).toHaveBeenCalledTimes(1);
    expect(h.cleanup).not.toHaveBeenCalled();
    const mountsBefore = h.mountCount.value;

    act(() => {
      h.capturedOnUpdateRejected.value?.();
    });

    // Old provider destroyed immediately (the effect cleanup ran) ...
    expect(h.cleanup).toHaveBeenCalledTimes(1);
    // ... and the <Excalidraw> generation key bumped → a fresh instance mounted.
    expect(h.mountCount.value).toBeGreaterThan(mountsBefore);
  });

  it('tears down the old provider EVEN IF the replacement editor never provides an API', () => {
    // provideApiOnMounts=1: the recovery remount does NOT call onExcalidrawAPI (a stuck
    // replacement). The old provider must still be destroyed — this is the whole point
    // of nulling the API on rejection rather than waiting for the replacement.
    renderWrapper();
    expect(h.initialize).toHaveBeenCalledTimes(1);

    act(() => {
      h.capturedOnUpdateRejected.value?.();
    });

    expect(h.cleanup).toHaveBeenCalledTimes(1); // torn down despite no replacement API
    expect(h.mountCount.value).toBeGreaterThan(1); // fresh instance did mount (it just didn't hand back an API)
    // The stuck replacement provided no API, so no NEW provider was initialized.
    expect(h.initialize).toHaveBeenCalledTimes(1);
  });
});
