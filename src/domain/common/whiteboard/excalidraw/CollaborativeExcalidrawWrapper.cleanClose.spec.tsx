import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CloseVerdict } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import CollaborativeExcalidrawWrapper from './CollaborativeExcalidrawWrapper';

/**
 * COMPOSITION test: the real `useCollab` routing wired into the wrapper. The
 * provider-only 1000 test cannot see the wrapper's SECOND, independent retry loop
 * (`useAutoReconnect`). Here the provider is mocked only to inject a socket-close
 * verdict; `useCollab` and the wrapper are REAL. A clean (normal 1000) close must
 * reach NEITHER wrapper callback, so the reconnect notice never opens and
 * `useAutoReconnect` is never activated — unlike a transient drop, which does.
 */
const h = vi.hoisted(() => ({
  closeHandler: { value: undefined as ((v: CloseVerdict) => void) | undefined },
  autoReconnectActive: [] as boolean[],
}));

// Mock the provider so the wrapper's real useCollab still subscribes to a `close`
// event we can drive, without a live socket.
vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider')>();
  class MockProvider {
    awareness = { setLocalStateField: vi.fn(), on: vi.fn(), off: vi.fn(), destroy: vi.fn() };
    ephemeralChannel = { send: vi.fn(), subscribe: vi.fn(() => () => {}) };
    on(event: string, handler: (v: CloseVerdict) => void) {
      if (event === 'close') h.closeHandler.value = handler;
    }
    off() {}
    connect() {}
    destroy() {}
  }
  return { ...actual, UnifiedCollabProvider: MockProvider };
});
vi.mock('./collab/awarenessRouter', () => ({
  AwarenessRouter: class {
    destroy() {}
  },
}));

// Capture the `active` flag every time the wrapper drives useAutoReconnect.
vi.mock('./useAutoReconnect', () => ({
  useAutoReconnect: (params: { active: boolean }) => {
    h.autoReconnectActive.push(params.active);
    return { secondsRemaining: null };
  },
}));

// A stub <Excalidraw> that hands back an API on mount so useCollab initializes
// (and thus subscribes to the provider's `close`).
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', async () => {
  const React = await import('react');
  return {
    lazyWithGlobalErrorHandler: () => (props: { onExcalidrawAPI?: (api: unknown) => void }) => {
      React.useEffect(() => {
        props.onExcalidrawAPI?.({ id: 'api-1' });
      }, []);
      return null;
    },
  };
});
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

const lastActive = () => h.autoReconnectActive[h.autoReconnectActive.length - 1];

describe('CollaborativeExcalidrawWrapper — a clean close never activates the wrapper reconnect timer', () => {
  beforeEach(() => {
    h.closeHandler.value = undefined;
    h.autoReconnectActive.length = 0;
  });
  afterEach(() => vi.clearAllMocks());

  it('a NORMAL (clean 1000) close keeps useAutoReconnect active:false (no reconnect notice opened)', () => {
    renderWrapper();
    expect(typeof h.closeHandler.value).toBe('function'); // real useCollab subscribed

    act(() => {
      h.closeHandler.value?.({ code: 1000, reason: '', disposition: 'normal' });
    });

    expect(lastActive()).toBe(false);
  });

  it('a TRANSIENT close DOES activate useAutoReconnect (contrast — the notice opens)', () => {
    renderWrapper();

    act(() => {
      h.closeHandler.value?.({ code: 1011, reason: '', disposition: 'transient' });
    });

    expect(lastActive()).toBe(true);
  });
});
